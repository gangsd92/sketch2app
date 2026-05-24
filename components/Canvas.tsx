
"use client";

import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CanvasProps {
  onClear?: () => void;
}

export interface CanvasHandle {
  getDataUrl: () => string;
  clear: () => void;
}

const Canvas = forwardRef<CanvasHandle, CanvasProps>(({ onClear }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [color, setColor] = useState('#111');
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  useImperativeHandle(ref, () => ({
    getDataUrl: () => {
      if (!canvasRef.current) return '';
      return canvasRef.current.toDataURL('image/png');
    },
    clear: () => {
      clearCanvas();
    }
  }));

  const getCtx = () => canvasRef.current?.getContext('2d');

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (canvas && ctx) {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, w, h);
      drawHint(ctx);
    }
  };

  const drawHint = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '13px ui-sans-serif, system-ui';
    ctx.fillText('Sketch a UI here — try a header, a card, buttons, a form…', 20, 32);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      
      if (w === 0 || h === 0) return;

      // Save current content
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx && canvas.width > 0 && canvas.height > 0) {
        tempCtx.drawImage(canvas, 0, 0);
      }

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform before scaling
        ctx.scale(dpr, dpr);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);
        if (tempCanvas.width > 0 && tempCanvas.height > 0) {
          ctx.drawImage(tempCanvas, 0, 0, w, h);
        } else {
          drawHint(ctx);
        }
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    };

    const parent = canvas.parentElement;
    if (!parent) return;
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    resize();

    return () => observer.disconnect();
  }, []);

  const getPos = (e: React.PointerEvent | PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.PointerEvent) => {
    drawingRef.current = true;
    lastPosRef.current = getPos(e);
  };

  const draw = (e: React.PointerEvent) => {
    if (!drawingRef.current) return;
    const ctx = getCtx();
    if (!ctx) return;

    const currentPos = getPos(e);
    ctx.strokeStyle = tool === 'eraser' ? '#fff' : color;
    ctx.lineWidth = tool === 'eraser' ? 24 : 3;
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();
    lastPosRef.current = currentPos;
  };

  const stopDrawing = () => {
    drawingRef.current = false;
  };

  const colors = [
    { name: 'Black', value: '#111' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Green', value: '#10b981' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 px-4 h-10 border-b border-border bg-card/40 text-xs shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
        <span className="font-medium">Sketch</span>
        <span className="text-muted">— draw a rough UI</span>
        <div className="flex-1"></div>
        <div className="flex items-center gap-1 mr-2">
          {colors.map((c) => (
            <button
              key={c.value}
              onClick={() => { setColor(c.value); setTool('pen'); }}
              className={cn(
                "w-4 h-4 rounded-full border-2 transition-all",
                color === c.value && tool === 'pen' ? "border-white scale-110" : "border-transparent"
              )}
              style={{ background: c.value }}
              title={c.name}
            />
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-7 px-2 text-[11px]", tool === 'pen' && "bg-violet-500/10 text-violet-300 border-violet-500")}
          onClick={() => setTool('pen')}
        >
          Pen
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-7 px-2 text-[11px]", tool === 'eraser' && "bg-violet-500/10 text-violet-300 border-violet-500")}
          onClick={() => setTool('eraser')}
        >
          Eraser
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-[11px]"
          onClick={clearCanvas}
        >
          Clear
        </Button>
      </div>
      <div className="flex-1 relative bg-white touch-none">
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerOut={stopDrawing}
          className="absolute inset-0 w-full h-full cursor-crosshair"
        />
      </div>
    </div>
  );
});

Canvas.displayName = "Canvas";

export default Canvas;
