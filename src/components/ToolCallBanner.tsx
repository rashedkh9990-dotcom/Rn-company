import React from 'react';
import { ToolCallInfo } from '../types';
import { ExternalLink, Search, CheckCircle2, Globe, Sparkles } from 'lucide-react';

interface ToolCallBannerProps {
  toolCalls: ToolCallInfo[];
  onDismiss: (id: string) => void;
}

export const ToolCallBanner: React.FC<ToolCallBannerProps> = ({
  toolCalls,
  onDismiss,
}) => {
  if (toolCalls.length === 0) return null;

  const latestCall = toolCalls[toolCalls.length - 1];

  const getToolIcon = (name: string) => {
    switch (name) {
      case 'openWebsite':
        return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'searchWeb':
        return <Search className="w-4 h-4 text-pink-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  const url = latestCall.args?.url;

  return (
    <div id="anisa-tool-banner" className="w-full max-w-sm mx-auto px-4 z-20">
      <div className="bg-[#0b0d19]/90 border border-purple-500/30 rounded-2xl p-3.5 backdrop-blur-xl shadow-xl shadow-purple-950/40 flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 shrink-0 mt-0.5">
            {getToolIcon(latestCall.name)}
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-purple-300">
              <span>Tool Call:</span>
              <span className="text-white font-semibold">{latestCall.name}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            <p className="text-xs text-slate-300 mt-1 font-normal line-clamp-2">
              {latestCall.result || 'Action executed by Anisa'}
            </p>

            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
              >
                <span>Visit URL</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        <button
          onClick={() => onDismiss(latestCall.id)}
          className="text-slate-500 hover:text-slate-300 p-1 text-xs font-mono"
          title="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
