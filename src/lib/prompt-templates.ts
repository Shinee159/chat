import type { GeneratePayload } from "./types";

export const DEFAULT_TEMPLATES: Array<{ name: string; mode: GeneratePayload["type"] | "chat"; prompt: string; isPinned?: boolean }> = [
  {
    name: "Asisten riset ringkas",
    mode: "chat",
    isPinned: true,
    prompt: "Jelaskan topik berikut secara sistematis, objektif, dan mudah dipahami. Berikan poin inti, risiko, dan langkah lanjutan: "
  },
  {
    name: "Storyboard konten",
    mode: "chat",
    prompt: "Buat storyboard 8 scene untuk konten berikut. Sertakan visual, narasi, keyframe, prompt gambar/video, dan transisi: "
  },
  {
    name: "Gambar produk realistis",
    mode: "image",
    isPinned: true,
    prompt: "Foto produk realistis, pencahayaan studio lembut, background bersih, detail tajam, komposisi premium, tanpa teks: "
  },
  {
    name: "Video cinematic pendek",
    mode: "video",
    prompt: "Video cinematic 6 detik, camera dolly in, lighting dramatis, detail realistis, tanpa teks, adegan: "
  },
  {
    name: "Voice over Indonesia",
    mode: "audio",
    prompt: "Bacakan dengan intonasi jelas, profesional, tempo sedang, bahasa Indonesia natural: "
  },
  {
    name: "Musik promosi modern",
    mode: "music",
    prompt: "Musik instrumental modern untuk promosi digital, upbeat, clean, catchy, durasi pendek, mood: "
  },
  {
    name: "Objek 3D game asset",
    mode: "model3d",
    prompt: "Game-ready 3D asset, low-poly clean topology, PBR material, centered object, detail: "
  }
];
