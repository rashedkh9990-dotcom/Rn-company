import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { PulsarOrb } from './components/PulsarOrb';
import { Controls } from './components/Controls';
import { ToolCallBanner } from './components/ToolCallBanner';
import { PersonaHints } from './components/PersonaHints';
import { LiveSession } from './services/LiveSession';
import { LiveSessionState, PersonalityVibe, ToolCallInfo } from './types';
import { AlertCircle, Volume2, ShieldCheck, Sparkles } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<LiveSessionState>('disconnected');
  const [vibe, setVibe] = useState<PersonalityVibe>('sassy');
  const [isMuted, setIsMuted] = useState(false);
  const [toolCalls, setToolCalls] = useState<ToolCallInfo[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);

  const sessionRef = useRef<LiveSession | null>(null);
  const timerRef = useRef<number | null>(null);

  // Initialize session instance on mount
  useEffect(() => {
    sessionRef.current = new LiveSession({
      onStateChange: (newState) => {
        setState(newState);
        if (newState === 'listening' || newState === 'speaking') {
          setErrorMessage(null);
        }
      },
      onToolCall: (tool) => {
        setToolCalls((prev) => [...prev, tool]);
      },
      onError: (err) => {
        setErrorMessage(err);
      },
      onVibeChange: (newVibe) => {
        if (['sassy', 'flirty', 'playful', 'witty'].includes(newVibe)) {
          setVibe(newVibe as PersonalityVibe);
        }
      },
    });

    return () => {
      if (sessionRef.current) {
        sessionRef.current.disconnect();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Track session duration
  useEffect(() => {
    if (state !== 'disconnected' && state !== 'error') {
      if (!timerRef.current) {
        timerRef.current = window.setInterval(() => {
          setSessionDuration((prev) => prev + 1);
        }, 1000);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setSessionDuration(0);
    }
  }, [state]);

  const handleToggleConnect = useCallback(() => {
    setErrorMessage(null);
    if (!sessionRef.current) return;

    if (state === 'disconnected' || state === 'error') {
      sessionRef.current.connect();
    } else {
      sessionRef.current.disconnect();
    }
  }, [state]);

  const handleToggleMute = useCallback(() => {
    if (!sessionRef.current) return;
    const streamer = sessionRef.current.getAudioStreamer();
    if (streamer) {
      const nextMuted = !isMuted;
      streamer.setMuted(nextMuted);
      setIsMuted(nextMuted);
    }
  }, [isMuted]);

  const handleInterrupt = useCallback(() => {
    if (!sessionRef.current) return;
    const streamer = sessionRef.current.getAudioStreamer();
    if (streamer) {
      streamer.stopPlaybackAndClearQueue();
    }
    setState('listening');
  }, []);

  const handleDismissTool = useCallback((id: string) => {
    setToolCalls((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div id="anisa-app-shell" className="relative flex flex-col h-full w-full bg-[#05060b] text-slate-100 overflow-hidden">
      {/* Futuristic Background Atmospheric Mesh & Lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-right violet aura */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
        {/* Bottom-left magenta aura */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl" />
        {/* Center cyan pulse when listening */}
        {state === 'listening' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        )}
        {/* Center rose glow when speaking */}
        {state === 'speaking' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-rose-500/15 rounded-full blur-3xl animate-pulse" />
        )}
        {/* Futuristic subtle grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
      </div>

      {/* Top Application Header */}
      <Header
        state={state}
        vibe={vibe}
        onVibeChange={setVibe}
        sessionDuration={sessionDuration}
      />

      {/* Error / Permission Toast */}
      {errorMessage && (
        <div className="mx-4 mt-3 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-w-md mx-auto p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 flex items-center justify-between text-xs backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-200 ml-2 font-mono"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Voice Interaction Canvas */}
      <main className="flex-1 flex flex-col items-center justify-between py-2 sm:py-4 px-4 overflow-y-auto z-10">
        {/* Tool Call Notification */}
        <div className="w-full">
          <ToolCallBanner
            toolCalls={toolCalls}
            onDismiss={handleDismissTool}
          />
        </div>

        {/* Central Glowing Pulsar Orb */}
        <div className="my-auto py-4">
          <PulsarOrb
            state={state}
            vibe={vibe}
            audioStreamer={sessionRef.current?.getAudioStreamer() || null}
            onOrbClick={handleToggleConnect}
          />
        </div>

        {/* Dynamic Hints & Contextual Suggestion Cards */}
        <div className="w-full">
          <PersonaHints vibe={vibe} />
        </div>
      </main>

      {/* Bottom Floating Control Dock */}
      <footer className="w-full border-t border-white/5 bg-[#05060b]/90 backdrop-blur-xl z-20">
        <Controls
          state={state}
          isMuted={isMuted}
          onToggleConnect={handleToggleConnect}
          onToggleMute={handleToggleMute}
          onInterrupt={handleInterrupt}
        />
      </footer>
    </div>
  );
}
