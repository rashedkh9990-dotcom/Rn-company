import React from 'react';
import { PersonalityVibe } from '../types';
import { Sparkles, MessageCircleHeart, Info } from 'lucide-react';

interface PersonaHintsProps {
  vibe: PersonalityVibe;
}

export const PersonaHints: React.FC<PersonaHintsProps> = ({ vibe }) => {
  const hintsByVibe: Record<PersonalityVibe, string[]> = {
    sassy: [
      '"Anisa, be honest with me, do you think I have good taste?"',
      '"Open Wikipedia and tell me something I actually care about."',
      '"What makes you think you\'re smarter than me?"',
    ],
    flirty: [
      '"Hey Anisa, did you miss me while I was away?"',
      '"What\'s a fun website we should check out together?"',
      '"Tell me something cute before I get back to work."',
    ],
    playful: [
      '"Anisa, roast my productivity today in one sentence."',
      '"Search Google for funny dog memes."',
      '"If you were human for one day, what would you do first?"',
    ],
    witty: [
      '"Anisa, what\'s the meaning of life, but keep it brief."',
      '"Open GitHub and let\'s pretend I know what I\'m doing."',
      '"Hit me with your sharpest one-liner."',
    ],
  };

  const quotes = hintsByVibe[vibe] || hintsByVibe.sassy;

  return (
    <div id="anisa-voice-hints" className="w-full max-w-sm mx-auto px-4 py-2 select-none">
      <div className="bg-[#090b14]/60 border border-white/5 rounded-2xl p-3 backdrop-blur-md">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
          <div className="flex items-center gap-1.5 text-purple-400 font-semibold uppercase tracking-wider">
            <MessageCircleHeart className="w-3.5 h-3.5 text-pink-400" />
            <span>Try saying aloud:</span>
          </div>
          <span className="text-slate-500 font-mono text-[10px]">Real-time mic</span>
        </div>

        <div className="space-y-1.5">
          {quotes.map((q, idx) => (
            <div
              key={idx}
              className="text-xs text-slate-300/90 font-normal italic bg-white/[0.02] hover:bg-white/[0.05] p-1.5 rounded-lg border border-white/5 transition-colors"
            >
              {q}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
