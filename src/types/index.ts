export type LiveSessionState = 'disconnected' | 'connecting' | 'listening' | 'speaking' | 'error';

export interface ToolCallInfo {
  id: string;
  name: string;
  args: Record<string, any>;
  timestamp: number;
  result?: string;
  status: 'pending' | 'executed';
}

export type PersonalityVibe = 'flirty' | 'sassy' | 'playful' | 'witty';

export interface AnisaStats {
  sessionDuration: number;
  toolsExecutedCount: number;
  userTalkTime: number;
  anisaTalkTime: number;
}
