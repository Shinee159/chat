import type { UiModel } from "./types";

// Manual model list.
// Edit this file kalau mau menambah, menghapus, atau mengganti model yang tampil di dropdown.
// API /api/models sekarang membaca daftar ini langsung, bukan dari cache database atau endpoint model eksternal.
export const FALLBACK_MODELS: UiModel[] = [
  // Text / Chat
  { id: "openai", name: "OpenAI", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "openai-fast", name: "OpenAI Fast", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "openai-large", name: "OpenAI Large", kind: "chat", provider: "pollinations", outputModalities: ["text"], reasoning: true },
  { id: "gpt-5.4", name: "Gpt 5.4", kind: "chat", provider: "pollinations", outputModalities: ["text"], reasoning: true },
  { id: "gpt-5.4-mini", name: "GPT 5.4 Mini", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "gpt-5.6-sol", name: "GPT 5.6 Sol", kind: "chat", provider: "pollinations", outputModalities: ["text"], reasoning: true },
  { id: "gpt-5.6-terra", name: "GPT 5.6 Terra", kind: "chat", provider: "pollinations", outputModalities: ["text"], reasoning: true },
  { id: "gpt-5.6-luna", name: "GPT 5.6 Luna", kind: "chat", provider: "pollinations", outputModalities: ["text"], reasoning: true },
  { id: "qwen-coder", name: "Qwen Coder", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "qwen-large", name: "Qwen Large", kind: "chat", provider: "pollinations", outputModalities: ["text"], reasoning: true, tools: true },
  { id: "qwen-safety", name: "Qwen Safety", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "qwen-vision", name: "Qwen Vision", kind: "chat", provider: "pollinations", outputModalities: ["text"], tools: true },
  { id: "qwen-vision-pro", name: "Qwen Vision Pro", kind: "chat", provider: "pollinations", outputModalities: ["text"], reasoning: true, tools: true },
  { id: "mistral-small-3.2", name: "Mistral Small 3.2", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "mistral", name: "Mistral", kind: "chat", provider: "pollinations", outputModalities: ["text"], reasoning: true },
  { id: "mistral-large", name: "Mistral Large", kind: "chat", provider: "pollinations", outputModalities: ["text"], reasoning: true, tools: true },
  { id: "deepseek", name: "DeepSeek", kind: "chat", provider: "pollinations", outputModalities: ["text"], reasoning: true },
  { id: "deepseek-pro", name: "DeepSeek Pro", kind: "chat", provider: "pollinations", outputModalities: ["text"], reasoning: true },
  { id: "gemma", name: "Gemma", kind: "chat", provider: "pollinations", outputModalities: ["text"], reasoning: true },
  { id: "grok", name: "Grok", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "grok-4-20-reasoning", name: "Grok 4-2 Reasoning", kind: "chat", provider: "pollinations", outputModalities: ["text"], reasoning: true },
  { id: "grok-large", name: "Grok Large", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "midijourney", name: "MidiJourney", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "midijourney-large", name: "MidiJourney Large", kind: "chat", provider: "pollinations", outputModalities: ["text"] },
  { id: "perplexity-fast", name: "Perplexity Fast", kind: "chat", provider: "pollinations", outputModalities: ["text"], search: true },
  { id: "perplexity-deep", name: "Perplexity Deep", kind: "chat", provider: "pollinations", outputModalities: ["text"], search: true },
  { id: "perplexity", name: "Perplexity", kind: "chat", provider: "pollinations", outputModalities: ["text"], search: true },
  { id: "perplexity-reasoning", name: "Perplexity Reasoning", kind: "chat", provider: "pollinations", outputModalities: ["text"], reasoning: true, search: true },
  { id: "kimi", name: "Kimi", kind: "chat", provider: "pollinations", outputModalities: ["text"], reasoning: true, tools: true },
  { id: "kimi-code", name: "Kimi Code", kind: "chat", provider: "pollinations", outputModalities: ["text"], reasoning: true, tools: true },
  { id: "nova-fast", name: "Nova Fast", kind: "chat", provider: "pollinations", outputModalities: ["text"], tools: true },
  { id: "nova", name: "Nova", kind: "chat", provider: "pollinations", outputModalities: ["text"], reasoning: true, tools: true },
  { id: "glm", name: "GLM", kind: "chat", provider: "pollinations", outputModalities: ["text"], reasoning: true, tools: true },
  { id: "llama", name: "Llama", kind: "chat", provider: "pollinations", outputModalities: ["text"], tools: true },
  { id: "nova-fast", name: "Nova Fast", kind: "chat", provider: "pollinations", outputModalities: ["text"], tools: true },
  { id: "llama-scout", name: "Llama Scout", kind: "chat", provider: "pollinations", outputModalities: ["text"], tools: true },
  { id: "minimax-m2.7", name: "Minimax m2.7", kind: "chat", provider: "pollinations", outputModalities: ["text"], reasoning: true, tools: true },
  { id: "minimax", name: "Minimax", kind: "chat", provider: "pollinations", outputModalities: ["text"], reasoning: true, tools: true },
  { id: "step-flash", name: "Step Flash", kind: "chat", provider: "pollinations", outputModalities: ["text"], reasoning: true, tools: true },
  { id: "step-3.5-flash", name: "Step 3.5 Flash", kind: "chat", provider: "pollinations", outputModalities: ["text"], reasoning: true, tools: true },
  { id: "voodoohop/anyvm-deepseek-chat", name: "DeepSeek V2", kind: "chat", provider: "pollinations", outputModalities: ["text"] },

  // Image
  { id: "flux", name: "Flux", kind: "image", provider: "pollinations", outputModalities: ["image"] },
  { id: "nova-canvas", name: "Nova Canvas", kind: "image", provider: "pollinations", outputModalities: ["image"] },
  { id: "ltx-2", name: "Ltx-2", kind: "image", provider: "pollinations", outputModalities: ["image"] },
  { id: "klein", name: "Klein", kind: "image", provider: "pollinations", outputModalities: ["image"] },
  { id: "gptimage-large", name: "GPT Image Large", kind: "image", provider: "pollinations", outputModalities: ["image"] },
  { id: "gptimage", name: "GPT Image", kind: "image", provider: "pollinations", outputModalities: ["image"] },
  { id: "kontext", name: "Kontext", kind: "image", provider: "pollinations", outputModalities: ["image"] },
  { id: "zimage", name: "Z-Image", kind: "image", provider: "pollinations", outputModalities: ["image"] },

  // Video
  { id: "nova-reel", name: "Nova Reel", kind: "video", provider: "pollinations", outputModalities: ["video"] },

  // Audio / Text to Speech
  // Catatan: endpoint audio project ini memakai voice, jadi modelId audio hanya untuk pilihan UI.
  { id: "tts-1", name: "Text to Speech", kind: "audio", provider: "pollinations", outputModalities: ["audio"] },
  { id: "whisper", name: "Whisper", kind: "audio", provider: "pollinations", outputModalities: ["audio"] },
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
