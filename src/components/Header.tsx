import React, { useState } from 'react';
import { LiveSessionState, PersonalityVibe } from '../types';
import { Sparkles, Radio, Zap, Heart, Download } from 'lucide-react';
import { ExportModal } from './ExportModal';

interface HeaderProps {
  state: LiveSessionState;
  vibe: PersonalityVibe;
  onVibeChange: (vibe: PersonalityVibe) => void;
  sessionDuration: number;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  vibe,
  onVibeChange,
  sessionDuration,
}) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const vibes: { key: PersonalityVibe; label: string; icon: string }[] = [
    { key: 'sassy', label: 'Sassy', icon: '💅' },
    { key: 'flirty', label: 'Flirty', icon: '💋' },
    { key: 'playful', label: 'Playful', icon: '✨' },
    { key: 'witty', label: 'Witty', icon: '🧠' },
  ];

  return (
    <header id="anisa-header" className="w-full px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between border-b border-white/5 bg-[#05060b]/80 backdrop-blur-xl z-20">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-500 p-[1px] shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-[#090a12] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-pink-400" />
            </div>
          </div>
          {state !== 'disconnected' && state !== 'error' && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#05060b]" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
              Anisa
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                LIVE
              </span>
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 tracking-tight font-medium flex items-center gap-1">
            <span>Voice Companion</span>
            <span className="text-slate-600">•</span>
            <span className="text-pink-400/90 font-mono">Gemini 3.1 Live</span>
          </p>
        </div>
      </div>

      {/* Center Session Active Timer */}
      {state !== 'disconnected' && (
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
          <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>{formatTime(sessionDuration)}</span>
        </div>
      )}

      {/* Right Controls: Vibes & Export ZIP */}
      <div className="flex items-center gap-2">
        {/* Vibe Selector Pills */}
        <div className="flex items-center gap-1.5 bg-[#0e101c] p-1 rounded-xl border border-white/10 shadow-inner">
          {vibes.map((v) => {
            const isActive = vibe === v.key;
            return (
              <button
                key={v.key}
                id={`vibe-btn-${v.key}`}
                onClick={() => onVibeChange(v.key)}
                title={`${v.label} persona tone`}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30 scale-102'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span>{v.icon}</span>
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            );
          })}
        </div>

        {/* Export / Download ZIP Button */}
        <button
          id="header-export-zip-btn"
          onClick={() => setIsExportModalOpen(true)}
          title="Download Project ZIP for PC"
          className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-102 active:scale-98"
        >
          <Download className="w-3.5 h-3.5 text-pink-400" />
          <span className="hidden sm:inline font-semibold">Export ZIP</span>
        </button>
      </div>

      {/* Export & Setup Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </header>
  );
};
