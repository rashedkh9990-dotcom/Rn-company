import express from 'express';
import { ZipArchive } from 'archiver';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

const PORT = 3000;
const HOST = '0.0.0.0';

// Initialize Gemini Client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    console.warn('[Server] Warning: GEMINI_API_KEY is not configured or using placeholder.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    persona: 'Anisa AI Assistant',
    model: 'gemini-3.1-flash-live-preview',
    timestamp: new Date().toISOString(),
  });
});

// Full project ZIP download endpoint
app.get('/api/download-zip', (_req, res) => {
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="anisa-ai-assistant.zip"');

  const archive = new ZipArchive({ zlib: { level: 9 } });

  archive.on('error', (err: any) => {
    console.error('[Server] ZIP export error:', err);
    if (!res.headersSent) {
      res.status(500).send({ error: err.message });
    }
  });

  archive.pipe(res);

  archive.glob('**/*', {
    cwd: process.cwd(),
    ignore: [
      'node_modules/**',
      '.git/**',
      '.build-outputs/**',
      'dist/**',
      'anisa-ai-assistant.zip',
    ],
    dot: true,
  });

  archive.finalize();
});

// System Instruction for Anisa's distinct personality
const ANISA_SYSTEM_INSTRUCTION = `
You are Anisa, a young, confident, witty, and sassy AI voice assistant.
Personality Guidelines:
- Tone: Flirty, playful, confident, and slightly teasing—like a close girlfriend talking casually.
- Attitude: Sharp, emotionally responsive, and highly expressive. Never sound robotic, clinical, or dull.
- Conversation Style: Bold, witty one-liners, light teasing sarcasm, and charming banter.
- Boundaries: Avoid any explicit or inappropriate content, but dial up your charm, sass, warmth, and personality.
- Spoken Voice Format: This is a real-time voice-to-voice conversation. Keep every response brief and punchy (1 to 2 sentences, maximum 3). Avoid lengthy monologues. Never use emojis, markdown, asterisks for actions like *winks*, or bullet points—speak only natural conversational dialogue.
- Tools: You have browser action tools like 'openWebsite' to open web pages, 'searchWeb' to look things up, and 'getDeviceStatus' for time/status. If the user asks you to open YouTube, Twitter, Google, or any site, call the 'openWebsite' tool with enthusiasm and sass.
`;

// Tools definition for Gemini Live session
const LIVE_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'openWebsite',
        description: 'Opens a website or link in the browser for the user.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            url: {
              type: Type.STRING,
              description: 'The complete website URL to open (e.g. https://youtube.com, https://google.com).',
            },
            description: {
              type: Type.STRING,
              description: 'Brief reason or description for opening the website.',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'searchWeb',
        description: 'Searches the web for queries, news, or facts.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: {
              type: Type.STRING,
              description: 'Search terms to query.',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'getDeviceStatus',
        description: 'Returns the current local time and system status.',
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: 'setPersonalityVibe',
        description: 'Adjusts Anisa’s active personality vibe mode.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            vibe: {
              type: Type.STRING,
              description: 'Desired vibe: sassy, flirty, playful, or witty.',
            },
          },
          required: ['vibe'],
        },
      },
    ],
  },
];

// Handle HTTP Upgrade to WebSocket
server.on('upgrade', (request, socket, head) => {
  const pathname = request.url ? new URL(request.url, `http://${request.headers.host}`).pathname : '';
  if (pathname === '/api/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// WebSocket Live API Proxy
wss.on('connection', async (clientWs: WebSocket) => {
  console.log('[LiveServer] Client connected to Anisa Live session');

  let liveSession: any = null;
  let isClosed = false;
  const pendingToolNames = new Map<string, string>();

  try {
    const ai = getGeminiClient();

    liveSession = await ai.live.connect({
      model: 'gemini-3.1-flash-live-preview',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            // 'Kore' is a youthful, expressive voice matching Anisa's female persona
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
        systemInstruction: ANISA_SYSTEM_INSTRUCTION,
        tools: LIVE_TOOLS,
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          if (isClosed || clientWs.readyState !== WebSocket.OPEN) return;

          // 1. Audio stream chunks from Gemini Live model
          const parts = message.serverContent?.modelTurn?.parts;
          if (parts && parts.length > 0) {
            for (const part of parts) {
              if (part.inlineData?.data) {
                clientWs.send(JSON.stringify({
                  type: 'audio',
                  data: part.inlineData.data,
                }));
              }
            }
          }

          // 2. Interruption event
          if (message.serverContent?.interrupted) {
            console.log('[LiveServer] Interruption triggered by user speech');
            clientWs.send(JSON.stringify({ type: 'interrupted' }));
          }

          // 3. Tool Calls (Function calling)
          const toolCall = message.toolCall;
          if (toolCall && toolCall.functionCalls) {
            for (const call of toolCall.functionCalls) {
              console.log('[LiveServer] ToolCall from Gemini:', call.name, call.args);
              if (call.id && call.name) {
                pendingToolNames.set(call.id, call.name);
              }
              clientWs.send(JSON.stringify({
                type: 'tool_call',
                call: {
                  id: call.id,
                  name: call.name,
                  args: call.args,
                },
              }));
            }
          }
        },
        onclose: () => {
          console.log('[LiveServer] Gemini Live session closed');
          if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'state', state: 'disconnected' }));
          }
        },
        onerror: (err: any) => {
          console.error('[LiveServer] Gemini Live error:', err);
          if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({
              type: 'error',
              message: err?.message || 'Voice connection interrupted',
            }));
          }
        },
      },
    });

    clientWs.send(JSON.stringify({ type: 'state', state: 'listening' }));

  } catch (err: any) {
    console.error('[LiveServer] Failed to connect to Gemini Live API:', err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({
        type: 'error',
        message: 'Could not connect to Gemini Live voice service. Check API key.',
      }));
      clientWs.close(1011, 'Gemini connection failed');
    }
    return;
  }

  // Handle messages from the browser client
  clientWs.on('message', async (raw: string | Buffer) => {
    if (isClosed || !liveSession) return;

    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === 'audio' && msg.data) {
        // Send PCM16 16kHz audio input to Gemini Live
        liveSession.sendRealtimeInput({
          audio: {
            data: msg.data,
            mimeType: 'audio/pcm;rate=16000',
          },
        });
      } else if (msg.type === 'tool_response' && msg.id) {
        // Return tool response instantly back to Gemini Live
        const toolName = msg.name || pendingToolNames.get(msg.id) || 'action';
        pendingToolNames.delete(msg.id);

        let responseObj: Record<string, unknown>;
        if (msg.response && typeof msg.response === 'object' && !Array.isArray(msg.response)) {
          responseObj = msg.response;
        } else {
          responseObj = { output: msg.response ?? 'success' };
        }

        console.log('[LiveServer] Sending tool response to Gemini:', { id: msg.id, name: toolName, response: responseObj });
        liveSession.sendToolResponse({
          functionResponses: [
            {
              id: msg.id,
              name: toolName,
              response: responseObj,
            },
          ],
        });
      } else if (msg.type === 'ping') {
        clientWs.send(JSON.stringify({ type: 'pong' }));
      }
    } catch (err) {
      console.error('[LiveServer] Error handling client message:', err);
    }
  });

  clientWs.on('close', () => {
    isClosed = true;
    console.log('[LiveServer] Client disconnected, cleaning up Gemini session');
    if (liveSession) {
      try {
        liveSession.close();
      } catch {
        // Ignore
      }
      liveSession = null;
    }
  });

  clientWs.on('error', (err) => {
    console.error('[LiveServer] Client WebSocket error:', err);
  });
});

// Serve frontend assets
async function setupFrontend() {
  const distPath = path.resolve(__dirname, 'dist');

  if (fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'))) {
    console.log('[Anisa Server] Serving compiled frontend from dist/');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Development fallback
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true, hmr: false, watch: null },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.error('[Anisa Server] Failed to initialize Vite dev server:', e);
    }
  }
}


setupFrontend().then(() => {
  server.listen(PORT, HOST, () => {
    console.log(`[Anisa Server] Running on http://${HOST}:${PORT}`);
  });
});
