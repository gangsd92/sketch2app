"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MODELS, callGemini, ANALYZE_SCHEMA, stripHtml, AnalyzeResult } from '@/lib/gemini';
import Canvas, { CanvasHandle } from '@/components/Canvas';
import AgentThread, { Message } from '@/components/AgentThread';
import Preview from '@/components/Preview';
import { toast } from 'sonner';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-2.0-flash-exp');
  const [status, setStatus] = useState<'idle' | 'thinking' | 'ready' | 'failed' | 'refining'>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [generatedCode, setGeneratedCode] = useState('');
  
  const canvasRef = useRef<CanvasHandle>(null);

  // Restore API key
  useEffect(() => {
    const saved = localStorage.getItem('gemini_key');
    if (saved) setApiKey(saved);
  }, []);

  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    localStorage.setItem('gemini_key', val);
  };

  const runAgent = useCallback(async () => {
    if (!apiKey.trim()) {
      toast.error('Add your Gemini API key (top right)');
      return;
    }
    if (!canvasRef.current) return;

    setMessages([]);
    setGeneratedCode('');
    setStatus('thinking');

    const sketchB64 = canvasRef.current.getDataUrl().split(',')[1];

    try {
      // 1. ANALYZE
      const planJson = await callGemini({
        apiKey,
        model,
        parts: [
          { text: "You are a senior product designer. Analyze this wireframe and produce a structured plan. Identify multiple screens or user flows." },
          { inline_data: { mime_type: 'image/png', data: sketchB64 } }
        ],
        jsonSchema: ANALYZE_SCHEMA,
        temperature: 0.4
      });

      const plan: AnalyzeResult = JSON.parse(planJson);
      
      const planHtml = (
        <div className="space-y-3">
          <div className="text-[11px] uppercase tracking-wider text-muted font-bold">Reasoning</div>
          <p>{plan.reasoning}</p>
          <div className="text-[11px] uppercase tracking-wider text-muted font-bold">Sitemap</div>
          <div className="space-y-2">
            {plan.pages.map(p => (
              <div key={p.route} className="rounded-md border border-border bg-background/60 p-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-violet-300 bg-violet-500/10 px-1.5 py-0.5 rounded">PAGE</span>
                  <span className="font-medium">{p.name}</span>
                </div>
                <div className="space-y-1 pl-2 border-l border-border/50">
                  {p.components.map((c, i) => (
                    <div key={i} className="text-[10px]"><span className="text-zinc-400">•</span> {c.name}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

      setMessages([{ id: 'analyze', role: 'agent', html: planHtml }]);

      // 2. BUILD
      const buildText = await callGemini({
        apiKey,
        model,
        parts: [
          { text: `You are an expert front-end engineer. Build a polished, Multi-Page SPA from this plan + sketch.
          
          PLAN: ${planJson}
          
          REQUIREMENTS:
          - Output ONE complete HTML document.
          - Implement a vanilla JS router for SPA navigation.
          - Use Tailwind CSS via CDN.
          - No other external assets.
          - Polished, professional design.` },
          { inline_data: { mime_type: 'image/png', data: sketchB64 } }
        ],
        temperature: 0.55
      });

      const html = stripHtml(buildText);
      setGeneratedCode(html);
      setMessages(prev => [...prev, { id: 'build', role: 'agent', text: `✓ Generated a complete SPA (${html.length.toLocaleString()} chars). Check the preview!` }]);
      setStatus('ready');
    } catch (e: any) {
      console.error(e);
      setStatus('failed');
      toast.error(e.message || 'Agent failed');
    }
  }, [apiKey, model]);

  const handleRefine = useCallback(async (instruction: string) => {
    if (!generatedCode || !canvasRef.current) return;

    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', text: instruction }]);
    setStatus('refining');

    const sketchB64 = canvasRef.current.getDataUrl().split(',')[1];

    try {
      const result = await callGemini({
        apiKey,
        model,
        parts: [
          { text: `You are an expert front-end engineer. Refine this HTML based on the user instruction and new sketch.
          
          CURRENT HTML:
          ${generatedCode}
          
          INSTRUCTION: "${instruction}"
          
          REQUIREMENTS:
          - Return the FULL updated HTML.
          - Maintain SPA architecture and Tailwind CDN.
          - Output ONLY HTML.` },
          { inline_data: { mime_type: 'image/png', data: sketchB64 } }
        ],
        temperature: 0.4
      });

      const updatedHtml = stripHtml(result);
      setGeneratedCode(updatedHtml);
      setMessages(prev => [...prev, { id: 'refine-' + userMsgId, role: 'agent', text: `✓ Applied: ${instruction}` }]);
      setStatus('ready');
    } catch (e: any) {
      console.error(e);
      setStatus('ready');
      toast.error(e.message || 'Refinement failed');
    }
  }, [apiKey, model, generatedCode]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center gap-3 px-5 h-14 border-b border-border bg-card/70 backdrop-blur shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-black text-xs font-bold shadow-lg">S2</div>
          <h1 className="text-[15px] font-semibold tracking-tight">Sketch<span className="text-violet-400">2</span>App</h1>
          <span className="text-[10px] uppercase tracking-wider text-muted px-2 py-0.5 rounded-full border border-border ml-1">full-stack · next.js</span>
        </div>
        <div className="flex-1" />
        <Select value={model} onValueChange={(val) => val && setModel(val)}>
          <SelectTrigger className="w-[180px] h-8 text-xs bg-background border-border">
            <SelectValue placeholder="Model" />
          </SelectTrigger>
          <SelectContent>
            {MODELS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input 
          type="password" 
          placeholder="Gemini API key" 
          className="w-56 h-8 text-xs bg-background border-border"
          value={apiKey}
          onChange={(e) => handleApiKeyChange(e.target.value)}
        />
        <Button 
          size="sm" 
          className="h-8 px-4 bg-white text-black hover:bg-zinc-200 font-semibold"
          onClick={runAgent}
          disabled={status === 'thinking' || status === 'refining'}
        >
          {status === 'thinking' ? 'Running...' : 'Run agent ✨'}
        </Button>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-12 min-h-0">
        <section className="col-span-4 border-r border-border">
          <Canvas ref={canvasRef} />
        </section>
        
        <section className="col-span-4 border-r border-border">
          <AgentThread 
            messages={messages} 
            status={status} 
            onSendMessage={handleRefine}
            disabled={status === 'thinking' || status === 'refining'}
          />
        </section>

        <section className="col-span-4 overflow-hidden">
          <Preview code={generatedCode} />
        </section>
      </main>
    </div>
  );
}
