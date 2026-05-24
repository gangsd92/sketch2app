
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PreviewProps {
  code: string;
}

const Preview: React.FC<PreviewProps> = ({ code }) => {
  const [view, setView] = useState<'preview' | 'code'>('preview');

  const copyCode = async () => {
    if (!code) {
      toast.error('Nothing to copy');
      return;
    }
    await navigator.clipboard.writeText(code);
    toast.success('Copied to clipboard!');
  };

  const downloadCode = () => {
    if (!code) {
      toast.error('Nothing to download');
      return;
    }
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sketch2app.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 px-4 h-10 border-b border-border bg-card/40 text-xs shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        <span className="font-medium">Live output</span>
        <div className="flex-1"></div>
        <div className="inline-flex border border-border rounded-md overflow-hidden text-[11px]">
          <button
            onClick={() => setView('preview')}
            className={cn(
              "px-2.5 py-0.5 transition-colors",
              view === 'preview' ? "bg-white text-black font-medium" : "hover:bg-card text-muted"
            )}
          >
            Preview
          </button>
          <button
            onClick={() => setView('code')}
            className={cn(
              "px-2.5 py-0.5 transition-colors",
              view === 'code' ? "bg-white text-black font-medium" : "hover:bg-card text-muted"
            )}
          >
            Code
          </button>
        </div>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] ml-1" onClick={copyCode}>
          Copy
        </Button>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px]" onClick={downloadCode}>
          ↓
        </Button>
      </div>
      <div className="flex-1 relative bg-white">
        {code ? (
          <>
            <iframe
              title="preview"
              srcDoc={code}
              className={cn("w-full h-full border-0", view !== 'preview' && "hidden")}
              sandbox="allow-scripts allow-forms"
            />
            <pre
              className={cn(
                "absolute inset-0 m-0 p-4 overflow-auto bg-[#09090b] text-zinc-300 text-[11px] leading-relaxed font-mono",
                view !== 'code' && "hidden"
              )}
            >
              {code}
            </pre>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm bg-[#09090b]">
            Waiting for agent…
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;
