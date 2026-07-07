import type { UiModel } from "./types";

export const FALLBACK_MODELS: UiModel[] = [
  { id: "openai", name: "OpenAI", kind: "chat", provider: "fallback", outputModalities: ["text"] },
  { id: "openai-fast", name: "OpenAI Fast", kind: "chat", provider: "fallback", outputModalities: ["text"] },
  { id: "openai-large", name: "OpenAI Large", kind: "chat", provider: "fallback", outputModalities: ["text"] },
  { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite", kind: "chat", provider: "fallback", outputModalities: ["text"] },
  { id: "gemini-3-flash", name: "Gemini 3 Flash", kind: "chat", provider: "fallback", outputModalities: ["text"] },
  { id: "deepseek-v3", name: "DeepSeek V3", kind: "chat", provider: "fallback", outputModalities: ["text"] },
  { id: "mistral", name: "Mistral", kind: "chat", provider: "fallback", outputModalities: ["text"] },
  { id: "qwen-coder", name: "Qwen Coder", kind: "chat", provider: "fallback", outputModalities: ["text"] },
  { id: "claude-haiku-4.5", name: "Claude Haiku 4.5", kind: "chat", provider: "fallback", outputModalities: ["text"] },
  { id: "claude-sonnet-4.5", name: "Claude Sonnet 4.5", kind: "chat", provider: "fallback", outputModalities: ["text"] },
  { id: "claude-opus-4.5", name: "Claude Opus 4.5", kind: "chat", provider: "fallback", outputModalities: ["text"] },
  { id: "perplexity-sonar", name: "Perplexity Sonar", kind: "chat", provider: "fallback", outputModalities: ["text"] },
  { id: "kimi-k2-thinking", name: "Kimi K2 Thinking", kind: "chat", provider: "fallback", outputModalities: ["text"] },
  { id: "glm-4.7", name: "GLM 4.7", kind: "chat", provider: "fallback", outputModalities: ["text"] },
  { id: "minimax-m2.1", name: "MiniMax M2.1", kind: "chat", provider: "fallback", outputModalities: ["text"] },

  { id: "flux", name: "Flux", kind: "image", provider: "fallback", outputModalities: ["image"] },
  { id: "zimage", name: "Z-Image", kind: "image", provider: "fallback", outputModalities: ["image"] },
  { id: "turbo", name: "Turbo Image", kind: "image", provider: "fallback", outputModalities: ["image"] },
  { id: "gptimage", name: "GPT Image", kind: "image", provider: "fallback", outputModalities: ["image"] },
  { id: "kontext", name: "Kontext", kind: "image", provider: "fallback", outputModalities: ["image"] },
  { id: "seedream", name: "Seedream", kind: "image", provider: "fallback", outputModalities: ["image"] },
  { id: "nanobanana", name: "Nano Banana", kind: "image", provider: "fallback", outputModalities: ["image"] },
  { id: "nanobanana-pro", name: "Nano Banana Pro", kind: "image", provider: "fallback", outputModalities: ["image"] },

  { id: "veo", name: "Veo", kind: "video", provider: "fallback", outputModalities: ["video"] },
  { id: "seedance", name: "Seedance", kind: "video", provider: "fallback", outputModalities: ["video"] },
  { id: "seedance-pro", name: "Seedance Pro", kind: "video", provider: "fallback", outputModalities: ["video"] },
  { id: "seedance-2.0", name: "Seedance 2.0", kind: "video", provider: "fallback", outputModalities: ["video"] },
  { id: "wan", name: "Wan", kind: "video", provider: "fallback", outputModalities: ["video"] },
  { id: "wan-fast", name: "Wan Fast", kind: "video", provider: "fallback", outputModalities: ["video"] },
  { id: "wan-pro", name: "Wan Pro", kind: "video", provider: "fallback", outputModalities: ["video"] },
  { id: "nova-reel", name: "Nova Reel", kind: "video", provider: "fallback", outputModalities: ["video"] },

  { id: "tts-1", name: "Text to Speech", kind: "audio", provider: "fallback", outputModalities: ["audio"] },
  { id: "qwen-tts", name: "Qwen TTS", kind: "audio", provider: "fallback", outputModalities: ["audio"] },
  { id: "qwen-tts-instruct", name: "Qwen TTS Instruct", kind: "audio", provider: "fallback", outputModalities: ["audio"] },
  { id: "elevenmusic", name: "ElevenMusic", kind: "music", provider: "fallback", outputModalities: ["audio"] },
  { id: "acestep", name: "ACE-Step Music", kind: "music", provider: "fallback", outputModalities: ["audio"] },

  { id: "trellis-2-low", name: "Trellis 2 Low", kind: "model3d", provider: "fallback", outputModalities: ["3d"] },
  { id: "trellis-2-medium", name: "Trellis 2 Medium", kind: "model3d", provider: "fallback", outputModalities: ["3d"] },
  { id: "trellis-2-high", name: "Trellis 2 High", kind: "model3d", provider: "fallback", outputModalities: ["3d"] },
  { id: "hyper3d-rodin", name: "Hyper3D Rodin", kind: "model3d", provider: "fallback", outputModalities: ["3d"] }
];

export const VOICES = [
  "alloy", "echo", "fable", "onyx", "nova", "shimmer", "ash", "ballad", "coral", "sage", "verse",
  "rachel", "domi", "bella", "elli", "charlotte", "dorothy", "sarah", "emily", "lily", "matilda",
  "adam", "antoni", "arnold", "josh", "sam", "daniel", "charlie", "james", "fin", "callum",
  "liam", "george", "brian", "bill"
];
