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

export function inferKind(raw: any): UiModel["kind"] {
  const id = String(raw?.id ?? raw?.name ?? "").toLowerCase();
  const out = (raw?.output_modalities || raw?.outputModalities || raw?.output || raw?.capabilities?.output || []) as string[];
  const input = (raw?.input_modalities || raw?.inputModalities || raw?.input || raw?.capabilities?.input || []) as string[];
  const endpoints = (raw?.supported_endpoints || raw?.supportedEndpoints || raw?.endpoints || []) as string[];
  const joined = `${id} ${out.join(" ")} ${input.join(" ")} ${endpoints.join(" ")}`.toLowerCase();

  if (joined.includes("embedding")) return "embedding";
  if (joined.includes("realtime")) return "realtime";
  if (joined.includes("3d") || joined.includes("gltf") || joined.includes("glb") || id.includes("trellis") || id.includes("rodin")) return "model3d";
  if (joined.includes("video") || id.includes("veo") || id.includes("seedance") || id.includes("wan") || id.includes("nova-reel")) return "video";
  if (id.includes("elevenmusic") || id.includes("acestep") || joined.includes("music")) return "music";
  if (joined.includes("audio") || id.includes("tts") || id.includes("whisper") || id.includes("scribe")) return "audio";
  if (joined.includes("image") || id.includes("flux") || id.includes("zimage") || id.includes("gptimage") || id.includes("kontext") || id.includes("seedream") || id.includes("nanobanana")) return "image";
  return "chat";
}

function normalizeArray(value: unknown): string[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return [value];
  return undefined;
}

function normalizeModel(raw: any, endpoint: string): UiModel | null {
  const id = raw?.id || raw?.name || raw?.model || raw?.value;
  if (!id || typeof id !== "string") return null;
  const kind = inferKind(raw);

  return {
    id,
    name: raw?.name && raw.name !== id ? String(raw.name) : id,
    kind,
    provider: "pollinations",
    description: raw?.description || raw?.owned_by || endpoint,
    inputModalities: normalizeArray(raw?.input_modalities || raw?.inputModalities || raw?.input || raw?.capabilities?.input),
    outputModalities: normalizeArray(raw?.output_modalities || raw?.outputModalities || raw?.output || raw?.capabilities?.output),
    supportedEndpoints: normalizeArray(raw?.supported_endpoints || raw?.supportedEndpoints || raw?.endpoints),
    reasoning: Boolean(raw?.reasoning || raw?.capabilities?.reasoning),
    tools: Boolean(raw?.tools || raw?.capabilities?.tools),
    contextLength: typeof raw?.context_length === "number" ? raw.context_length : undefined
  };
}

export async function fetchProviderModels(): Promise<UiModel[]> {
  const endpoints = ["/models", "/text/models", "/image/models", "/audio/models", "/video/models", "/embeddings/models", "/3d/models"];
  const models = new Map<string, UiModel>();

  await Promise.allSettled(
    endpoints.map(async (endpoint) => {
      const res = await fetch(`${POLLINATIONS_BASE_URL}${endpoint}`, {
        headers: process.env.POLLINATIONS_KEY ? authHeaders() : undefined,
        next: { revalidate: 60 * 60 }
      });
      if (!res.ok) return;
      const data = await res.json();
      const rows = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.models) ? data.models : [];
      for (const raw of rows) {
        const normalized = normalizeModel(raw, endpoint);
        if (normalized) models.set(`${normalized.kind}:${normalized.id}`, normalized);
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
  params.set("model", payload.modelId);
  params.set("safe", "true");
  if (payload.seed !== undefined && !Number.isNaN(payload.seed)) params.set("seed", String(payload.seed));
  if (payload.enhance) params.set("enhance", "true");

  if (payload.type === "image") {
    params.set("width", String(payload.width || 1024));
    params.set("height", String(payload.height || 1024));
    if (payload.style) params.set("style", payload.style);
    return { url: `${base}/image/${prompt}?${params.toString()}`, mimeType: "image/jpeg" };
  }

  if (payload.type === "video") {
    params.set("width", String(payload.width || 1280));
    params.set("height", String(payload.height || 720));
    if (payload.duration) params.set("duration", String(payload.duration));
    if (payload.aspectRatio) params.set("aspectRatio", payload.aspectRatio);
    params.set("audio", payload.instrumental ? "false" : "true");
    if (payload.style) params.set("style", payload.style);
    return { url: `${base}/video/${prompt}?${params.toString()}`, mimeType: "video/mp4" };
  }

  if (payload.type === "audio" || payload.type === "music") {
    if (payload.type === "music") {
      params.set("model", payload.modelId || "elevenmusic");
      if (payload.duration) params.set("duration", String(payload.duration));
      if (payload.instrumental) params.set("instrumental", "true");
      if (payload.style) params.set("style", payload.style);
    } else {
      params.set("voice", payload.voice || "alloy");
      params.set("format", payload.format || "mp3");
    }
    return { url: `${base}/audio/${prompt}?${params.toString()}`, mimeType: payload.format === "wav" ? "audio/wav" : "audio/mpeg" };
  }

  params.set("model", payload.modelId || "trellis-2-low");
  if (payload.style) params.set("style", payload.style);
  return { url: `${base}/3d/${prompt}?${params.toString()}`, mimeType: "model/gltf-binary" };
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
