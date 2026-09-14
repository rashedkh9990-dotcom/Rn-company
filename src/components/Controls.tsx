import React from 'react';
import { LiveSessionState } from '../types';
import { Mic, MicOff, Power, Hand, Radio } from 'lucide-react';

interface ControlsProps {
  state: LiveSessionState;
  isMuted: boolean;
  onToggleConnect: () => void;
  onToggleMute: () => void;
  onInterrupt: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  state,
  isMuted,
  onToggleConnect,
  onToggleMute,
  onInterrupt,
}) => {
  const isConnected = state !== 'disconnected' && state !== 'error';

  return (
    <div id="anisa-controls-bar" className="w-full max-w-md mx-auto px-6 py-6 flex items-center justify-center gap-6 z-20">
      {/* Secondary Left Action: Mute / Unmute */}
      {isConnected ? (
        <button
          id="btn-toggle-mute"
          onClick={onToggleMute}
          title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
            isMuted
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-lg shadow-rose-500/20'
              : 'bg-slate-900/80 text-slate-300 border-white/10 hover:bg-slate-800 hover:text-white'
          } active:scale-95`}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
      ) : (
        <div className="w-13 h-13" />
      )}

      {/* Primary Central Button: Power / Mic connection */}
      <div className="relative">
        {/* Animated glow ring when active */}
        {isConnected && (
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-70 blur-md animate-pulse pointer-events-none" />
        )}

        <button
          id="btn-main-power"
          onClick={onToggleConnect}
          title={isConnected ? 'Disconnect Anisa session' : 'Connect to Anisa'}
          className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-300 border-2 active:scale-95 shadow-2xl ${
            !isConnected
              ? 'bg-gradient-to-tr from-purple-600 to-pink-600 border-purple-400 text-white shadow-purple-600/50 hover:brightness-110'
              : state === 'speaking'
              ? 'bg-gradient-to-tr from-rose-600 to-pink-600 border-rose-300 text-white shadow-rose-600/60 animate-pulse'
              : state === 'listening'
              ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 border-cyan-300 text-white shadow-cyan-600/60'
              : 'bg-slate-800 border-amber-400 text-amber-300'
          }`}
        >
          {!isConnected ? (
            <>
              <Power className="w-8 h-8 drop-shadow-md" />
              <span className="text-[10px] font-bold tracking-wider uppercase mt-0.5">START</span>
            </>
          ) : (
            <>
              <Mic className={`w-8 h-8 drop-shadow-md ${state === 'listening' ? 'scale-110' : ''}`} />
              <span className="text-[9px] font-mono font-semibold tracking-wider uppercase mt-0.5">
                {state === 'speaking' ? 'ANISA' : state === 'listening' ? 'LIVE' : 'SYNC'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Secondary Right Action: Interrupt Anisa */}
      {isConnected ? (
        <button
          id="btn-interrupt-anisa"
          onClick={onInterrupt}
          disabled={state !== 'speaking'}
          title="Interrupt Anisa while speaking"
          className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
            state === 'speaking'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 cursor-pointer shadow-lg shadow-amber-500/20 animate-bounce'
              : 'bg-slate-900/40 text-slate-600 border-white/5 cursor-not-allowed opacity-50'
          } active:scale-95`}
        >
          <Hand className="w-5 h-5" />
        </button>
      ) : (
        <div className="w-13 h-13" />
      )}
    </div>
  );
};
