import type { UiModel } from "./types";

// Manual model list.
// Edit this file kalau mau menambah, menghapus, atau mengganti model yang tampil di dropdown.
// API /api/models sekarang membaca daftar ini langsung, bukan dari cache database atau endpoint model eksternal.
export const FALLBACK_MODELS: UiModel[] = [
  // Text / Chat
  { id: "openai", name: "OpenAI", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "openai-fast", name: "OpenAI Fast", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "openai-large", name: "OpenAI Large", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "gpt-4.1", name: "GPT-4.1", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "gpt-4.1-mini", name: "GPT-4.1 Mini", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "gpt-4o", name: "GPT-4o", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "o3-mini", name: "O3 Mini", kind: "chat", provider: "pollinations", outputModalities: ["text"], reasoning: true },
  { id: "deepseek-v3", name: "DeepSeek V3", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "deepseek-r1", name: "DeepSeek R1", kind: "chat", provider: "pollinations", outputModalities: ["text"], reasoning: true },
  { id: "mistral", name: "Mistral", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "qwen-coder", name: "Qwen Coder", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "qwen3-coder", name: "Qwen3 Coder", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "llama", name: "Llama", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "llama-fast", name: "Llama Fast", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "gemini", name: "Gemini", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "claude-haiku", name: "Claude Haiku", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "claude-sonnet", name: "Claude Sonnet", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "perplexity-sonar", name: "Perplexity Sonar", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "searchgpt", name: "SearchGPT", kind: "chat", provider: "pollinations", outputModalities: ["text"], tools: true },

  // Image
  { id: "flux", name: "Flux", kind: "image", provider: "pollinations", outputModalities: ["image"] },
  { id: "turbo", name: "Turbo Image", kind: "image", provider: "pollinations", outputModalities: ["image"] },
  { id: "gptimage", name: "GPT Image", kind: "image", provider: "pollinations", outputModalities: ["image"] },
  { id: "kontext", name: "Kontext", kind: "image", provider: "pollinations", outputModalities: ["image"] },
  { id: "seedream", name: "Seedream", kind: "image", provider: "pollinations", outputModalities: ["image"] },
  { id: "nanobanana", name: "Nano Banana", kind: "image", provider: "pollinations", outputModalities: ["image"] },
  { id: "nanobanana-pro", name: "Nano Banana Pro", kind: "image", provider: "pollinations", outputModalities: ["image"] },
  { id: "zimage", name: "Z-Image", kind: "image", provider: "pollinations", outputModalities: ["image"] },

  // Video
  { id: "veo", name: "Veo", kind: "video", provider: "pollinations", outputModalities: ["video"] },
  { id: "seedance", name: "Seedance", kind: "video", provider: "pollinations", outputModalities: ["video"] },
  { id: "seedance-pro", name: "Seedance Pro", kind: "video", provider: "pollinations", outputModalities: ["video"] },
  { id: "seedance-2.0", name: "Seedance 2.0", kind: "video", provider: "pollinations", outputModalities: ["video"] },
  { id: "wan", name: "Wan", kind: "video", provider: "pollinations", outputModalities: ["video"] },
  { id: "wan-fast", name: "Wan Fast", kind: "video", provider: "pollinations", outputModalities: ["video"] },
  { id: "wan-pro", name: "Wan Pro", kind: "video", provider: "pollinations", outputModalities: ["video"] },
  { id: "nova-reel", name: "Nova Reel", kind: "video", provider: "pollinations", outputModalities: ["video"] },

  // Audio / Text to Speech
  // Catatan: endpoint audio project ini memakai voice, jadi modelId audio hanya untuk pilihan UI.
  { id: "tts-1", name: "Text to Speech", kind: "audio", provider: "pollinations", outputModalities: ["audio"] },
  { id: "openai-audio", name: "OpenAI Audio", kind: "audio", provider: "pollinations", outputModalities: ["audio"] },
  { id: "qwen-tts", name: "Qwen TTS", kind: "audio", provider: "pollinations", outputModalities: ["audio"] },
  { id: "qwen-tts-instruct", name: "Qwen TTS Instruct", kind: "audio", provider: "pollinations", outputModalities: ["audio"] },

  // Music
  { id: "elevenmusic", name: "ElevenMusic", kind: "music", provider: "pollinations", outputModalities: ["audio"] },
  { id: "acestep", name: "ACE-Step Music", kind: "music", provider: "pollinations", outputModalities: ["audio"] },];

export const VOICES = [
  "alloy", "echo", "fable", "onyx", "nova", "shimmer", "ash", "ballad", "coral", "sage", "verse",
  "rachel", "domi", "bella", "elli", "charlotte", "dorothy", "sarah", "emily", "lily", "matilda",
  "adam", "antoni", "arnold", "josh", "sam", "daniel", "charlie", "james", "fin", "callum",
  "liam", "george", "brian", "bill"
];
