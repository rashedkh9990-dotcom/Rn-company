/**
 * AudioStreamer
 * Manages raw PCM 16kHz microphone capture and gapless 24kHz audio playback
 * with real-time frequency analysis and instant interruption clearing.
 */
export class AudioStreamer {
  private inputCtx: AudioContext | null = null;
  private outputCtx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private inputAnalyser: AnalyserNode | null = null;
  private outputAnalyser: AnalyserNode | null = null;

  private nextStartTime: number = 0;
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private isMuted: boolean = false;

  private onAudioInputCallback: ((base64Pcm: string) => void) | null = null;
  private onSpeakingChangeCallback: ((isSpeaking: boolean) => void) | null = null;

  constructor(
    onAudioInput: (base64Pcm: string) => void,
    onSpeakingChange?: (isSpeaking: boolean) => void
  ) {
    this.onAudioInputCallback = onAudioInput;
    this.onSpeakingChangeCallback = onSpeakingChange || null;
  }

  /**
   * Initializes both input (16kHz) and output (24kHz) audio contexts
   * and starts microphone streaming.
   */
  async start(): Promise<void> {
    // 1. Initialize 24kHz Output Context for Gemini Live Audio
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.outputCtx = new AudioContextClass({ sampleRate: 24000 });
    if (this.outputCtx.state === 'suspended') {
      await this.outputCtx.resume();
    }

    this.outputAnalyser = this.outputCtx.createAnalyser();
    this.outputAnalyser.fftSize = 64;
    this.outputAnalyser.smoothingTimeConstant = 0.8;
    this.outputAnalyser.connect(this.outputCtx.destination);
    this.nextStartTime = this.outputCtx.currentTime;

    // 2. Initialize 16kHz Input Context for Microphone
    this.inputCtx = new AudioContextClass({ sampleRate: 16000 });
    if (this.inputCtx.state === 'suspended') {
      await this.inputCtx.resume();
    }

    this.inputAnalyser = this.inputCtx.createAnalyser();
    this.inputAnalyser.fftSize = 64;
    this.inputAnalyser.smoothingTimeConstant = 0.6;

    // 3. Request Microphone Permissions
    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    this.micSource = this.inputCtx.createMediaStreamSource(this.micStream);
    this.micSource.connect(this.inputAnalyser);

    // 4. Capture raw PCM samples via ScriptProcessor
    const bufferSize = 4096;
    this.scriptProcessor = this.inputCtx.createScriptProcessor(bufferSize, 1, 1);
    this.inputAnalyser.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.inputCtx.destination);

    this.scriptProcessor.onaudioprocess = (event: AudioProcessingEvent) => {
      if (this.isMuted) return;

      const inputData = event.inputBuffer.getChannelData(0);
      const base64Pcm = this.floatTo16BitPCMBase64(inputData);
      if (this.onAudioInputCallback && base64Pcm) {
        this.onAudioInputCallback(base64Pcm);
      }
    };
  }

  /**
   * Queue and seamlessly play 24kHz raw PCM audio chunk
   */
  queueAudioChunk(base64Chunk: string): void {
    if (!this.outputCtx || !this.outputAnalyser) return;

    try {
      const pcm16 = this.base64To16BitPCM(base64Chunk);
      if (!pcm16 || pcm16.length === 0) return;

      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768.0;
      }

      const audioBuffer = this.outputCtx.createBuffer(1, float32.length, 24000);
      audioBuffer.copyToChannel(float32, 0);

      const source = this.outputCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputAnalyser);

      const currentTime = this.outputCtx.currentTime;
      const startTime = Math.max(currentTime, this.nextStartTime);
      source.start(startTime);

      this.nextStartTime = startTime + audioBuffer.duration;
      this.activeSources.add(source);

      if (this.onSpeakingChangeCallback && this.activeSources.size === 1) {
        this.onSpeakingChangeCallback(true);
      }

      source.onended = () => {
        this.activeSources.delete(source);
        if (this.activeSources.size === 0 && this.onSpeakingChangeCallback) {
          this.onSpeakingChangeCallback(false);
        }
      };
    } catch (err) {
      console.error('[AudioStreamer] Error playing audio chunk:', err);
    }
  }

  /**
   * Immediately stops all ongoing playback and resets schedule queue.
   * Called when Gemini Live indicates an interruption.
   */
  stopPlaybackAndClearQueue(): void {
    this.activeSources.forEach((source) => {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Source may already have ended
      }
    });
    this.activeSources.clear();

    if (this.outputCtx) {
      this.nextStartTime = this.outputCtx.currentTime;
    }

    if (this.onSpeakingChangeCallback) {
      this.onSpeakingChangeCallback(false);
    }
  }

  /**
   * Toggle microphone mute
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  getIsMuted(): boolean {
    return this.isMuted;
  }

  getIsSpeaking(): boolean {
    return this.activeSources.size > 0;
  }

  /**
   * Returns current audio amplitude/frequencies for real-time visualization.
   */
  getVisualizerLevels(): { inputRms: number; outputRms: number; inputFreqs: number[]; outputFreqs: number[] } {
    let inputRms = 0;
    const inputFreqs: number[] = new Array(8).fill(0);
    if (this.inputAnalyser) {
      const data = new Uint8Array(this.inputAnalyser.frequencyBinCount);
      this.inputAnalyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum += (data[i] / 255) ** 2;
      }
      inputRms = Math.min(1, Math.sqrt(sum / data.length) * 2.5);
      const step = Math.floor(data.length / 8);
      for (let i = 0; i < 8; i++) {
        inputFreqs[i] = (data[i * step] || 0) / 255;
      }
    }

    let outputRms = 0;
    const outputFreqs: number[] = new Array(8).fill(0);
    if (this.outputAnalyser && this.activeSources.size > 0) {
      const data = new Uint8Array(this.outputAnalyser.frequencyBinCount);
      this.outputAnalyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum += (data[i] / 255) ** 2;
      }
      outputRms = Math.min(1, Math.sqrt(sum / data.length) * 2.2);
      const step = Math.floor(data.length / 8);
      for (let i = 0; i < 8; i++) {
        outputFreqs[i] = (data[i * step] || 0) / 255;
      }
    }

    return { inputRms, outputRms, inputFreqs, outputFreqs };
  }

  /**
   * Stop everything and release audio hardware
   */
  stop(): void {
    this.stopPlaybackAndClearQueue();

    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor.onaudioprocess = null;
      this.scriptProcessor = null;
    }

    if (this.micSource) {
      this.micSource.disconnect();
      this.micSource = null;
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }

    if (this.inputCtx) {
      this.inputCtx.close().catch(() => {});
      this.inputCtx = null;
    }

    if (this.outputCtx) {
      this.outputCtx.close().catch(() => {});
      this.outputCtx = null;
    }
  }

  // --- Helper Conversion Functions ---

  private floatTo16BitPCMBase64(float32Array: Float32Array): string {
    const pcm16 = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    const uint8 = new Uint8Array(pcm16.buffer);
    let binary = '';
    const len = uint8.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    return btoa(binary);
  }

  private base64To16BitPCM(base64: string): Int16Array | null {
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new Int16Array(bytes.buffer);
    } catch {
      return null;
    }
  }
}
