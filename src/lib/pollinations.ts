import type { GeneratePayload, UiModel } from "./types";

export const POLLINATIONS_BASE_URL = process.env.POLLINATIONS_BASE_URL || "https://gen.pollinations.ai";

export function getPollinationsKey() {
  const key = process.env.POLLINATIONS_KEY;
  if (!key) throw new Error("POLLINATIONS_KEY belum diisi di .env");
  return key;
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getPollinationsKey()}`
  };
}

function optionalAuthHeaders() {
  return process.env.POLLINATIONS_KEY ? authHeaders() : undefined;
}

function withKeyParam(params: URLSearchParams) {
  if (process.env.POLLINATIONS_KEY && !params.has("key")) {
    params.set("key", process.env.POLLINATIONS_KEY);
  }
}

export async function pollinationsChat(params: {
  modelId: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  temperature?: number;
  reasoningEffort?: string;
  systemPrompt?: string;
}) {
  const messages = params.systemPrompt?.trim()
    ? [{ role: "system" as const, content: params.systemPrompt.trim() }, ...params.messages]
    : params.messages;

  const body: Record<string, unknown> = {
    model: params.modelId,
    messages,
    temperature: params.temperature ?? 0.7,
    stream: false,
    safe: true
  };

  if (params.reasoningEffort && params.reasoningEffort !== "none") {
    body.reasoning_effort = params.reasoningEffort;
  }

  const res = await fetch(`${POLLINATIONS_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "content-type": "application/json"
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Pollinations chat gagal (${res.status}): ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Respons model kosong atau format tidak dikenali.");
  return String(content);
}

const STABLE_GENERATION_MODELS: Record<string, Set<string>> = {
  image: new Set(["flux", "turbo", "gptimage", "kontext", "seedream", "nanobanana", "nanobanana-pro", "zimage"]),
  video: new Set(["veo", "seedance", "seedance-pro", "seedance-2.0", "wan", "wan-fast", "wan-pro", "nova-reel"]),
  audio: new Set(["tts-1", "openai-audio", "qwen-tts", "qwen-tts-instruct"]),
  music: new Set(["elevenmusic", "acestep"])
};

const MUSIC_MODEL_IDS = new Set(["elevenmusic", "acestep"]);
const AUDIO_MODEL_IDS = new Set(["tts-1", "openai-audio", "qwen-tts", "qwen-tts-instruct"]);

export function inferKind(raw: any): UiModel["kind"] {
  const id = String(raw?.id ?? raw?.name ?? raw?.model ?? raw?.value ?? "").toLowerCase();
  const out = (raw?.output_modalities || raw?.outputModalities || raw?.output || raw?.capabilities?.output || []) as string[];
  const input = (raw?.input_modalities || raw?.inputModalities || raw?.input || raw?.capabilities?.input || []) as string[];
  const endpoints = (raw?.supported_endpoints || raw?.supportedEndpoints || raw?.endpoints || []) as string[];
  const joined = `${id} ${out.join(" ")} ${input.join(" ")} ${endpoints.join(" ")}`.toLowerCase();

  if (joined.includes("embedding")) return "embedding";
  if (joined.includes("realtime")) return "realtime";
  if (joined.includes("video") || id.includes("veo") || id.includes("seedance") || id.includes("wan") || id.includes("nova-reel")) return "video";
  if (MUSIC_MODEL_IDS.has(id) || joined.includes("music")) return "music";
  if (AUDIO_MODEL_IDS.has(id) || joined.includes("audio") || id.includes("tts") || id.includes("whisper") || id.includes("scribe")) return "audio";
  if (joined.includes("image") || id.includes("flux") || id.includes("zimage") || id.includes("gptimage") || id.includes("kontext") || id.includes("seedream") || id.includes("nanobanana")) return "image";
  return "chat";
}

function normalizeArray(value: unknown): string[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return [value];
  return undefined;
}

function rawId(raw: any) {
  return String(typeof raw === "string" ? raw : raw?.id || raw?.name || raw?.model || raw?.value || "").toLowerCase();
}

function kindFromEndpoint(endpoint: string, raw: any): UiModel["kind"] {
  const inferred = inferKind(raw);
  if (endpoint.includes("/text/")) return "chat";
  if (endpoint.includes("/image/")) return "image";
  if (endpoint.includes("/video/")) return "video";
  if (endpoint.includes("/audio/")) return MUSIC_MODEL_IDS.has(rawId(raw)) ? "music" : "audio";
  if (endpoint.includes("/embeddings/")) return "embedding";
  return inferred;
}

function outputModalitiesFromKind(kind: UiModel["kind"]): string[] {
  if (kind === "chat") return ["text"];
  if (kind === "music") return ["audio"];
  return [kind];
}

function isRunnableModel(raw: any, model: UiModel) {
  if (model.kind === "embedding" || model.kind === "realtime") return false;

  // Untuk generator media, project ini memakai endpoint GET sederhana.
  // Karena itu hanya tampilkan model yang umum stabil di endpoint tersebut.
  const stable = STABLE_GENERATION_MODELS[model.kind];
  if (stable) return stable.has(model.id);

  // Jangan tampilkan model paid/specialized di dropdown utama karena sering gagal untuk akun biasa.
  if (raw && typeof raw !== "string" && (raw.paid_only === true || raw.is_specialized === true)) return false;

  return true;
}

function normalizeModel(raw: any, endpoint: string): UiModel | null {
  const isStringModel = typeof raw === "string";
  const id = isStringModel ? raw : raw?.id || raw?.name || raw?.model || raw?.value;
  if (!id || typeof id !== "string") return null;

  const kind = kindFromEndpoint(endpoint, raw);
  const name = isStringModel
    ? id
    : raw?.name && raw.name !== id
      ? String(raw.name)
      : id;

  const model: UiModel = {
    id,
    name,
    kind,
    provider: "pollinations",
    description: isStringModel ? endpoint : raw?.description || raw?.owned_by || endpoint,
    inputModalities: isStringModel
      ? undefined
      : normalizeArray(raw?.input_modalities || raw?.inputModalities || raw?.input || raw?.capabilities?.input),
    outputModalities: isStringModel
      ? outputModalitiesFromKind(kind)
      : normalizeArray(raw?.output_modalities || raw?.outputModalities || raw?.output || raw?.capabilities?.output) || outputModalitiesFromKind(kind),
    supportedEndpoints: isStringModel
      ? [endpoint]
      : normalizeArray(raw?.supported_endpoints || raw?.supportedEndpoints || raw?.endpoints) || [endpoint],
    reasoning: isStringModel ? false : Boolean(raw?.reasoning || raw?.capabilities?.reasoning),
    tools: isStringModel ? false : Boolean(raw?.tools || raw?.capabilities?.tools),
    contextLength: !isStringModel && typeof raw?.context_length === "number" ? raw.context_length : undefined
  };

  return isRunnableModel(raw, model) ? model : null;
}

export async function fetchProviderModels(): Promise<UiModel[]> {
  const endpoints = ["/text/models", "/image/models", "/video/models", "/audio/models", "/models"];
  const models = new Map<string, UiModel>();

  await Promise.allSettled(
    endpoints.map(async (endpoint) => {
      const res = await fetch(`${POLLINATIONS_BASE_URL}${endpoint}`, {
        headers: optionalAuthHeaders(),
        next: { revalidate: 60 * 60 }
      });
      if (!res.ok) return;
      const data = await res.json();
      const rows = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.models) ? data.models : [];
      for (const raw of rows) {
        const normalized = normalizeModel(raw, endpoint);
        if (!normalized) continue;

        // Endpoint spesifik lebih dipercaya daripada /models gabungan.
        const existing = models.get(normalized.id);
        const existingFromUnified = existing?.supportedEndpoints?.includes("/models") ?? false;
        const currentFromUnified = endpoint === "/models";
        if (!existing || (existingFromUnified && !currentFromUnified)) {
          models.set(normalized.id, normalized);
        }
      }
    })
  );

  return Array.from(models.values()).sort((a, b) => a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id));
}

export function buildMediaRequest(payload: GeneratePayload) {
  const base = POLLINATIONS_BASE_URL.replace(/\/$/, "");
  const promptText = payload.negativePrompt?.trim()
    ? `${payload.prompt}\n\nNegative prompt: ${payload.negativePrompt}`
    : payload.prompt;
  const prompt = encodeURIComponent(promptText);
  const params = new URLSearchParams();
  params.set("safe", "true");
  if (payload.seed !== undefined && !Number.isNaN(payload.seed)) params.set("seed", String(payload.seed));
  if (payload.enhance) params.set("enhance", "true");
  withKeyParam(params);

  if (payload.type === "image") {
    params.set("model", payload.modelId || "flux");
    params.set("width", String(payload.width || 1024));
    params.set("height", String(payload.height || 1024));
    if (payload.style) params.set("style", payload.style);
    return { url: `${base}/image/${prompt}?${params.toString()}`, mimeType: "image/jpeg" };
  }

  if (payload.type === "video") {
    params.set("model", payload.modelId || "veo");
    params.set("width", String(payload.width || 1280));
    params.set("height", String(payload.height || 720));
    if (payload.duration) params.set("duration", String(payload.duration));
    if (payload.aspectRatio) params.set("aspectRatio", payload.aspectRatio);
    params.set("audio", payload.instrumental ? "false" : "true");
    if (payload.style) params.set("style", payload.style);
    return { url: `${base}/video/${prompt}?${params.toString()}`, mimeType: "video/mp4" };
  }

  if (payload.type === "audio") {
    // Endpoint audio GET Pollinations memakai voice/format. Parameter model TTS tertentu bisa membuat sebagian request gagal.
    params.set("voice", payload.voice || "alloy");
    params.set("format", payload.format || "mp3");
    return { url: `${base}/audio/${prompt}?${params.toString()}`, mimeType: payload.format === "wav" ? "audio/wav" : "audio/mpeg" };
  }

  if (payload.type === "music") {
    params.set("model", payload.modelId || "elevenmusic");
    if (payload.duration) params.set("duration", String(payload.duration));
    if (payload.instrumental) params.set("instrumental", "true");
    if (payload.style) params.set("style", payload.style);
    return { url: `${base}/audio/${prompt}?${params.toString()}`, mimeType: payload.format === "wav" ? "audio/wav" : "audio/mpeg" };
  }

  throw new Error("Tipe generator tidak didukung.");
}

export async function fetchGeneratedMedia(payload: GeneratePayload) {
  const request = buildMediaRequest(payload);
  const res = await fetch(request.url, {
    headers: authHeaders(),
    cache: "no-store"
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Generate media gagal (${res.status}): ${detail.slice(0, 300)}`);
  }

  return { res, mimeType: res.headers.get("content-type") || request.mimeType };
}
