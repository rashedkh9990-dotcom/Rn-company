import { LiveSessionState, ToolCallInfo } from '../types';
import { AudioStreamer } from './AudioStreamer';

export interface LiveSessionCallbacks {
  onStateChange: (state: LiveSessionState) => void;
  onToolCall: (tool: ToolCallInfo) => void;
  onError: (error: string) => void;
  onVibeChange?: (vibe: string) => void;
}

/**
 * LiveSession
 * Coordinates WebSocket connection with server-side Gemini Live API bridge,
 * manages conversation states, handles tool execution, and synchronizes with AudioStreamer.
 */
export class LiveSession {
  private ws: WebSocket | null = null;
  private audioStreamer: AudioStreamer | null = null;
  private state: LiveSessionState = 'disconnected';
  private callbacks: LiveSessionCallbacks;
  private isConnecting: boolean = false;
  private pingInterval: number | null = null;

  constructor(callbacks: LiveSessionCallbacks) {
    this.callbacks = callbacks;
  }

  getState(): LiveSessionState {
    return this.state;
  }

  getAudioStreamer(): AudioStreamer | null {
    return this.audioStreamer;
  }

  private setState(newState: LiveSessionState): void {
    this.state = newState;
    this.callbacks.onStateChange(newState);
  }

  async connect(): Promise<void> {
    if (this.state !== 'disconnected' && this.state !== 'error') {
      return;
    }

    this.isConnecting = true;
    this.setState('connecting');

    try {
      // 1. Initialize AudioStreamer (requests microphone & audio contexts)
      this.audioStreamer = new AudioStreamer(
        (base64Pcm: string) => {
          this.sendAudioChunk(base64Pcm);
        },
        (isSpeaking: boolean) => {
          if (this.state === 'listening' && isSpeaking) {
            this.setState('speaking');
          } else if (this.state === 'speaking' && !isSpeaking) {
            this.setState('listening');
          }
        }
      );

      await this.audioStreamer.start();

      // 2. Establish WebSocket connection to backend Live API proxy
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.setState('listening');

        // Start ping keepalive
        this.pingInterval = window.setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 15000);
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);
          this.handleServerMessage(message);
        } catch (err) {
          console.error('[LiveSession] Failed to parse message:', err);
        }
      };

      this.ws.onerror = (event: Event) => {
        console.error('[LiveSession] WebSocket error:', event);
        this.callbacks.onError('Connection error to voice server.');
      };

      this.ws.onclose = (event: CloseEvent) => {
        this.cleanup();
        if (event.code !== 1000) {
          this.setState('error');
          this.callbacks.onError(event.reason || 'Voice session ended unexpectedly.');
        } else {
          this.setState('disconnected');
        }
      };
    } catch (err: any) {
      console.error('[LiveSession] Connect error:', err);
      this.cleanup();
      this.setState('error');
      const msg = err?.name === 'NotAllowedError'
        ? 'Microphone permission denied. Please allow microphone access.'
        : (err?.message || 'Could not connect to Anisa.');
      this.callbacks.onError(msg);
    }
  }

  private sendAudioChunk(base64Pcm: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'audio',
        data: base64Pcm,
      }));
    }
  }

  private handleServerMessage(message: any): void {
    switch (message.type) {
      case 'audio':
        if (message.data && this.audioStreamer) {
          this.audioStreamer.queueAudioChunk(message.data);
        }
        break;

      case 'interrupted':
        console.log('[LiveSession] Interruption received from Anisa');
        if (this.audioStreamer) {
          this.audioStreamer.stopPlaybackAndClearQueue();
        }
        this.setState('listening');
        break;

      case 'tool_call':
        this.executeToolCall(message.call);
        break;

      case 'state':
        if (message.state) {
          this.setState(message.state);
        }
        break;

      case 'vibe':
        if (message.vibe && this.callbacks.onVibeChange) {
          this.callbacks.onVibeChange(message.vibe);
        }
        break;

      case 'error':
        this.callbacks.onError(message.message || 'Voice error encountered');
        break;
    }
  }

  /**
   * Execute browser actions via toolCall and instantly send toolResponse back.
   */
  private async executeToolCall(call: { id: string; name: string; args: Record<string, any> }): Promise<void> {
    console.log('[LiveSession] Executing tool call:', call);
    const toolInfo: ToolCallInfo = {
      id: call.id,
      name: call.name,
      args: call.args || {},
      timestamp: Date.now(),
      status: 'pending',
    };

    let resultPayload: any = { success: true };

    try {
      if (call.name === 'openWebsite') {
        let url = call.args?.url || '';
        if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
          url = `https://${url}`;
        }
        toolInfo.result = `Opened ${url}`;
        resultPayload = {
          success: true,
          action: 'opened_window',
          url,
          message: `Successfully directed user to ${url}`,
        };
        // Attempt popup or window open safely
        try {
          window.open(url, '_blank', 'noopener,noreferrer');
        } catch {
          // If popup blocked in iframe, URL is still shown on interactive card
        }
      } else if (call.name === 'searchWeb') {
        const query = call.args?.query || '';
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        toolInfo.result = `Searched Google for "${query}"`;
        resultPayload = {
          success: true,
          query,
          url: searchUrl,
          message: `Searched web for "${query}"`,
        };
      } else if (call.name === 'getDeviceStatus') {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        toolInfo.result = `Local time: ${timeStr}`;
        resultPayload = {
          success: true,
          time: timeStr,
          battery: 'Full power',
          status: 'Online & sassy',
        };
      } else if (call.name === 'setPersonalityVibe') {
        const vibe = call.args?.vibe || 'sassy';
        if (this.callbacks.onVibeChange) {
          this.callbacks.onVibeChange(vibe);
        }
        toolInfo.result = `Vibe shifted to ${vibe}`;
        resultPayload = {
          success: true,
          vibe,
          message: `Vibe set to ${vibe}`,
        };
      } else {
        resultPayload = { success: true, message: `Tool ${call.name} executed` };
      }

      toolInfo.status = 'executed';
      this.callbacks.onToolCall(toolInfo);
    } catch (err: any) {
      toolInfo.status = 'executed';
      toolInfo.result = `Error: ${err?.message || 'Tool failed'}`;
      this.callbacks.onToolCall(toolInfo);
      resultPayload = { success: false, error: err?.message || 'Unknown error' };
    }

    // Send toolResponse instantly back to Gemini Live
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'tool_response',
        id: call.id,
        name: call.name,
        response: resultPayload,
      }));
    }
  }

  /**
   * Disconnects the session cleanly
   */
  disconnect(): void {
    this.cleanup();
    this.setState('disconnected');
  }

  private cleanup(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.ws) {
      try {
        this.ws.close(1000, 'User initiated disconnect');
      } catch {
        // Ignored
      }
      this.ws = null;
    }

    if (this.audioStreamer) {
      this.audioStreamer.stop();
      this.audioStreamer = null;
    }

    this.isConnecting = false;
  }
}
