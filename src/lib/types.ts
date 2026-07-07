export type ModelKind = "chat" | "image" | "video" | "audio" | "music" | "model3d" | "embedding" | "realtime";

export type UiModel = {
  id: string;
  name: string;
  kind: ModelKind;
  provider: "pollinations" | "fallback" | string;
  description?: string;
  inputModalities?: string[];
  outputModalities?: string[];
  supportedEndpoints?: string[];
  reasoning?: boolean;
  tools?: boolean;
  contextLength?: number;
};

export type ChatPayload = {
  sessionId?: string;
  modelId: string;
  message: string;
  temperature?: number;
  reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high";
  systemPrompt?: string;
};

export type GeneratePayload = {
  type: "image" | "video" | "audio" | "music" | "model3d";
  prompt: string;
  negativePrompt?: string;
  modelId: string;
  sessionId?: string;
  width?: number;
  height?: number;
  duration?: number;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  voice?: string;
  format?: "mp3" | "wav" | "flac" | "opus" | "aac" | "pcm";
  seed?: number;
  instrumental?: boolean;
  style?: string;
  enhance?: boolean;
};
