import React, { useEffect, useRef, useState } from 'react';
import { LiveSessionState, PersonalityVibe } from '../types';
import { AudioStreamer } from '../services/AudioStreamer';

interface PulsarOrbProps {
  state: LiveSessionState;
  vibe: PersonalityVibe;
  audioStreamer: AudioStreamer | null;
  onOrbClick: () => void;
}

export const PulsarOrb: React.FC<PulsarOrbProps> = ({
  state,
  vibe,
  audioStreamer,
  onOrbClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [level, setLevel] = useState(0);

  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      let currentLevel = 0;
      let freqs: number[] = new Array(8).fill(0);

      if (audioStreamer) {
        const levels = audioStreamer.getVisualizerLevels();
        if (state === 'speaking') {
          currentLevel = levels.outputRms;
          freqs = levels.outputFreqs;
        } else if (state === 'listening') {
          currentLevel = levels.inputRms;
          freqs = levels.inputFreqs;
        }
      }

      setLevel(currentLevel);

      const time = Date.now() * 0.003;

      // Color themes based on state and vibe
      let primaryColor = 'rgba(168, 85, 247, 0.8)'; // Violet
      let secondaryColor = 'rgba(236, 72, 153, 0.6)'; // Pink
      let outerGlow = 'rgba(192, 132, 252, 0.2)';

      if (state === 'speaking') {
        // High energy sassy hot pink & electric violet
        primaryColor = 'rgba(244, 63, 94, 0.9)';
        secondaryColor = 'rgba(168, 85, 247, 0.8)';
        outerGlow = 'rgba(244, 63, 94, 0.35)';
      } else if (state === 'listening') {
        // Electric cyan & futuristic neon teal
        primaryColor = 'rgba(6, 182, 212, 0.9)';
        secondaryColor = 'rgba(59, 130, 246, 0.8)';
        outerGlow = 'rgba(6, 182, 212, 0.3)';
      } else if (state === 'connecting') {
        // Shimmering amber/indigo
        primaryColor = 'rgba(245, 158, 11, 0.9)';
        secondaryColor = 'rgba(139, 92, 246, 0.8)';
        outerGlow = 'rgba(245, 158, 11, 0.25)';
      } else {
        // Idle
        primaryColor = 'rgba(139, 92, 246, 0.7)';
        secondaryColor = 'rgba(99, 102, 241, 0.5)';
        outerGlow = 'rgba(139, 92, 246, 0.15)';
      }

      const baseRadius = 64;
      const dynamicRadius = baseRadius + currentLevel * 38;

      // 1. Draw outer ambient pulsating aura
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.4,
        centerX,
        centerY,
        dynamicRadius * 2.2
      );
      gradient.addColorStop(0, primaryColor);
      gradient.addColorStop(0.5, secondaryColor);
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, dynamicRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw holographic audio waveform orbits
      if (state === 'speaking' || state === 'listening') {
        const ringCount = 3;
        for (let r = 0; r < ringCount; r++) {
          const radiusOffset = (r + 1) * 24 + currentLevel * 20;
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate((r % 2 === 0 ? 1 : -1) * (time * 0.4 + r));

          ctx.beginPath();
          const points = 32;
          for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const freqIdx = i % freqs.length;
            const distortion = (freqs[freqIdx] || 0) * 16 * Math.sin(angle * 4 + time * 3);
            const radius = baseRadius + radiusOffset + distortion;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();
          ctx.strokeStyle = r === 0 ? primaryColor : outerGlow;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        }
      } else if (state === 'connecting') {
        // Rotating loading dots
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(time * 2);
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const x = Math.cos(angle) * (baseRadius + 24);
          const y = Math.sin(angle) * (baseRadius + 24);
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = primaryColor;
          ctx.fill();
        }
        ctx.restore();
      }

      // 3. Inner Core Orb with glowing gradient
      const innerGrad = ctx.createRadialGradient(
        centerX - dynamicRadius * 0.25,
        centerY - dynamicRadius * 0.25,
        dynamicRadius * 0.1,
        centerX,
        centerY,
        dynamicRadius
      );
      innerGrad.addColorStop(0, '#ffffff');
      innerGrad.addColorStop(0.35, primaryColor);
      innerGrad.addColorStop(0.9, '#0d0d17');
      innerGrad.addColorStop(1, '#05060b');

      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, dynamicRadius, 0, Math.PI * 2);
      ctx.fill();

      // Core border reflection
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, vibe, audioStreamer]);

  // Status text & badge color
  const getStatusInfo = () => {
    switch (state) {
      case 'speaking':
        return { text: 'Anisa Speaking', color: 'text-rose-400', badge: 'bg-rose-500/20 border-rose-500/40' };
      case 'listening':
        return { text: 'Listening to you...', color: 'text-cyan-400', badge: 'bg-cyan-500/20 border-cyan-500/40' };
      case 'connecting':
        return { text: 'Establishing Neural Live Link...', color: 'text-amber-400', badge: 'bg-amber-500/20 border-amber-500/40' };
      case 'error':
        return { text: 'Connection Offline', color: 'text-red-400', badge: 'bg-red-500/20 border-red-500/40' };
      default:
        return { text: 'Tap to Wake Anisa', color: 'text-purple-300', badge: 'bg-purple-500/10 border-purple-500/30' };
    }
  };

  const status = getStatusInfo();

  return (
    <div id="anisa-orb-container" className="relative flex flex-col items-center justify-center select-none">
      {/* Orb Stage */}
      <div 
        onClick={onOrbClick}
        role="button"
        tabIndex={0}
        aria-label="Wake or disconnect Anisa"
        className="relative cursor-pointer transition-transform duration-300 active:scale-95 group focus:outline-none"
      >
        <canvas
          ref={canvasRef}
          width={340}
          height={340}
          className="w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] drop-shadow-[0_0_40px_rgba(168,85,247,0.35)]"
        />

        {/* Central Overlay Indicator Icon */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`p-4 rounded-full backdrop-blur-md transition-all duration-500 ${
            state === 'speaking' 
              ? 'bg-rose-500/20 scale-110 shadow-[0_0_30px_rgba(244,63,94,0.5)]' 
              : state === 'listening'
              ? 'bg-cyan-500/20 scale-105 shadow-[0_0_30px_rgba(6,182,212,0.4)]'
              : 'bg-black/30'
          }`}>
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
              state === 'speaking' 
                ? 'bg-rose-400 animate-ping' 
                : state === 'listening' 
                ? 'bg-cyan-400 animate-pulse' 
                : state === 'connecting'
                ? 'bg-amber-400 animate-spin'
                : 'bg-purple-400'
            }`} />
          </div>
        </div>
      </div>

      {/* Dynamic Status Pill */}
      <div className="mt-4 flex flex-col items-center">
        <div className={`px-4 py-1.5 rounded-full border text-xs font-mono font-medium tracking-wide flex items-center gap-2 backdrop-blur-md transition-all duration-300 ${status.badge}`}>
          <span className={`w-2 h-2 rounded-full ${
            state === 'speaking' ? 'bg-rose-400 animate-pulse' :
            state === 'listening' ? 'bg-cyan-400 animate-ping' :
            state === 'connecting' ? 'bg-amber-400 animate-bounce' :
            'bg-slate-500'
          }`} />
          <span className={status.color}>{status.text}</span>
        </div>

        {/* Subtitle Sass Quote / Hint */}
        <p className="mt-2 text-xs text-slate-400 max-w-xs text-center font-normal tracking-wide">
          {state === 'disconnected' && 'Voice-to-voice only. No keyboard required, babe.'}
          {state === 'listening' && 'Say anything. I’m all ears (and plenty of attitude).'}
          {state === 'speaking' && 'Listen close, I won’t repeat myself twice.'}
          {state === 'connecting' && 'Tuning in to your wavelength...'}
          {state === 'error' && 'Tap the button below to reconnect.'}
        </p>
      </div>
    </div>
  );
};
