"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Mic, Send, Sparkles, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export interface Message {
  id: string;
  role: 'user' | 'agent';
  text?: string;
  html?: React.ReactNode;
}

interface AgentThreadProps {
  messages: Message[];
  status: 'idle' | 'thinking' | 'ready' | 'failed' | 'refining';
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

const AgentThread: React.FC<AgentThreadProps> = ({ messages, status, onSendMessage, disabled }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => setIsRecording(true);
      rec.onend = () => setIsRecording(false);
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        onSendMessage(transcript);
      };
      rec.onerror = (e: any) => {
        console.error('Speech recognition error', e);
        toast.error('Voice recognition failed');
      };
      
      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [onSendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }
    try {
      if (isRecording) recognitionRef.current.stop();
      else recognitionRef.current.start();
    } catch (e) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0f0f12]">
      <div className="flex items-center gap-2 px-4 h-10 border-b border-border bg-card/40 text-xs shrink-0">
        <span className={cn("w-1.5 h-1.5 rounded-full", status === 'ready' ? "bg-emerald-400" : "bg-cyan-400")}></span>
        <span className="font-medium">Agent</span>
        <span className="text-muted">— Analyze · Plan · Build · Refine</span>
        <div className="flex-1"></div>
        <span className={cn(
          "text-[11px] transition-colors",
          status === 'failed' ? "text-red-400" : status === 'ready' ? "text-emerald-400" : "text-muted"
        )}>
          {status === 'thinking' ? 'thinking…' : status === 'refining' ? 'refining…' : status}
        </span>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 flex flex-col">
          {messages.length === 0 ? (
            <div className="text-xs text-muted text-center py-12 border border-dashed border-border rounded-lg">
              <div className="text-2xl mb-2">✦</div>
              Draw on the left, then hit <span className="text-white font-medium">Run agent</span>.<br/>
              The agent will analyze your sketch, plan the components, build the app, and let you chat to refine it.
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "fade-in rounded-lg border p-3 text-xs leading-relaxed",
                  m.role === 'user' 
                    ? "self-end ml-8 border-violet-500/40 bg-violet-500/10 text-violet-100" 
                    : "border-border bg-card text-zinc-300"
                )}
              >
                {m.text && <div className="prose-agent">{m.text}</div>}
                {m.html && <div>{m.html}</div>}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-3 bg-card/30">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              "w-9 h-9 shrink-0 border-border bg-background hover:bg-card transition-all",
              isRecording && "text-red-500 bg-red-500/10 border-red-500/50"
            )}
            onClick={toggleVoice}
            disabled={disabled || status === 'idle'}
          >
            {isRecording ? <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Refine: 'make it dark mode'…"
            className="flex-1 bg-background border-border text-xs h-9"
            disabled={disabled || status === 'idle'}
          />
          <Button 
            type="submit" 
            size="icon"
            className="w-9 h-9 shrink-0 bg-violet-500 hover:bg-violet-600"
            disabled={disabled || status === 'idle' || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AgentThread;
