"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import { Bot, Check, Copy, ImageIcon, Loader2, MessageSquarePlus, MoreHorizontal, Music, Pin, PinOff, RefreshCcw, Search, Send, Star, Trash2, Video, Volume2, Wand2 } from "lucide-react";
import clsx from "clsx";
import AppShell from "./AppShell";
import { VOICES } from "@/lib/fallback-models";
import type { UiModel } from "@/lib/types";

type SessionMode = "chat" | "image" | "video" | "audio" | "music";

type SessionRow = {
  id: string;
  title: string;
  type: SessionMode;
  modelId?: string;
  isPinned?: boolean;
  updatedAt: string;
  _count?: { messages: number; generations: number };
};

type MessageRow = {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  modelId?: string;
};

type GenerationRow = {
  id: string;
  type: "image" | "video" | "audio" | "music";
  title?: string;
  prompt: string;
  negativePrompt?: string;
  modelId: string;
  assetUrl?: string;
  isFavorite?: boolean;
  createdAt: string;
};

type TemplateRow = {
  id: string;
  name: string;
  mode: SessionMode;
  prompt: string;
  isPinned?: boolean;
};

const modes: Array<{ id: SessionMode; label: string; icon: any; hint: string }> = [
  { id: "chat", label: "Obrolan AI", icon: Bot, hint: "Tanya jawab, riset, coding, narasi, dan analisis." },
  { id: "image", label: "Gambar", icon: ImageIcon, hint: "Prompt ke gambar statis." },
  { id: "video", label: "Video", icon: Video, hint: "Prompt ke video pendek." },
  { id: "audio", label: "Audio", icon: Volume2, hint: "Text to speech / voice over." },
  { id: "music", label: "Musik", icon: Music, hint: "Prompt ke musik atau backsound." }
];

function defaultModelFor(mode: string) {
  if (mode === "image") return "flux";
  if (mode === "video") return "veo";
  if (mode === "audio") return "tts-1";
  if (mode === "music") return "elevenmusic";
  return "openai";
}

const examples: Record<SessionMode, string[]> = {
  chat: [
    "Jelaskan konsep ini dengan bahasa mahasiswa dan beri contoh kasus.",
    "Buatkan framework konten: hook, storyboard, keyframe, prompt, dan CTA.",
    "Review ide aplikasi ini dari sisi fitur, database, dan risiko teknis."
  ],
  image: [
    "Poster aplikasi AI modern, dark mode, aksen oranye, komposisi clean, tanpa teks.",
    "Foto produk kosmetik premium di atas meja marmer, softbox lighting, detail tajam.",
    "Ilustrasi dashboard teknologi dengan node fitur seperti mind map, UI dark futuristik."
  ],
  video: [
    "Cinematic shot aplikasi AI terbuka di laptop, camera dolly in, lighting neon, 6 detik.",
    "Produk skincare berputar pelan di studio putih, refleksi soft, detail realistis.",
    "Robot AI ramah mengetik di meja kerja modern, smooth camera movement."
  ],
  audio: [
    "Halo, selamat datang di Kreasi AI. Semua hasil kreatif Anda tersimpan otomatis di akun.",
    "Bacakan narasi pembuka presentasi ini dengan suara profesional dan tempo sedang.",
    "Pengumuman singkat: server akan dimatikan sementara untuk proses uji coba genset."
  ],
  music: [
    "Upbeat modern tech intro, clean electronic, catchy, cocok untuk aplikasi AI.",
    "Lo-fi calm study background, piano lembut, beat ringan, loopable.",
    "Cinematic corporate background, inspiring, soft percussion, premium mood."
  ]
};

export default function GeneratorWorkspace() {
  const [mode, setMode] = useState<SessionMode>("chat");
  const [models, setModels] = useState<UiModel[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [generations, setGenerations] = useState<GenerationRow[]>([]);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [modelId, setModelId] = useState("openai");
  const [modelQuery, setModelQuery] = useState("");
  const [sessionQuery, setSessionQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [voice, setVoice] = useState("nova");
  const [duration, setDuration] = useState(6);
  const [size, setSize] = useState("1024x1024");
  const [temperature, setTemperature] = useState(0.7);
  const [reasoningEffort, setReasoningEffort] = useState<"none" | "minimal" | "low" | "medium" | "high">("medium");
  const [seed, setSeed] = useState("");
  const [style, setStyle] = useState("");
  const [enhance, setEnhance] = useState(true);
  const [instrumental, setInstrumental] = useState(false);

  useEffect(() => {
    loadModels();
    loadSessions();
  }, []);

  useEffect(() => {
    loadTemplates(mode);
  }, [mode]);

  const modelsForMode = useMemo(() => {
    const filtered = models.filter((m) => m.kind === mode || (mode === "chat" && m.kind === "chat"));
    const narrowed = filtered.length ? filtered : models.filter((m) => m.id === defaultModelFor(mode));
    const q = modelQuery.trim().toLowerCase();
    return q ? narrowed.filter((m) => `${m.name} ${m.id} ${m.provider}`.toLowerCase().includes(q)) : narrowed;
  }, [models, mode, modelQuery]);

  useEffect(() => {
    const available = modelsForMode;
    if (!available.some((m) => m.id === modelId)) setModelId(available[0]?.id || defaultModelFor(mode));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, models.length]);

  async function loadModels(refresh = false) {
    const res = await fetch(`/api/models${refresh ? "?refresh=1" : ""}`);
    const data = await res.json().catch(() => ({}));
    setModels(data.models || []);
  }

  async function loadSessions() {
    const q = sessionQuery.trim();
    const res = await fetch(`/api/sessions${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    if (!res.ok) return;
    const data = await res.json();
    setSessions(data.sessions || []);
  }

  async function loadTemplates(nextMode = mode) {
    const res = await fetch(`/api/templates?mode=${nextMode}`);
    if (!res.ok) return;
    const data = await res.json().catch(() => ({}));
    setTemplates(data.templates || []);
  }

  async function loadSession(id: string) {
    setActiveSessionId(id);
    const res = await fetch(`/api/sessions/${id}`);
    const data = await res.json().catch(() => ({}));
    const s = data.session;
    setMessages(s?.messages || []);
    setGenerations(s?.generations || []);
    if (s?.modelId) setModelId(s.modelId);
    if (s?.type) setMode(s.type);
  }

  async function newSession() {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: mode === "chat" ? "Percakapan Baru" : `Kreasi ${mode}`, type: mode, modelId })
    });
    const data = await res.json();
    setActiveSessionId(data.session.id);
    setMessages([]);
    setGenerations([]);
    await loadSessions();
  }

  async function renameSession(s: SessionRow) {
    const title = window.prompt("Nama session baru:", s.title);
    if (!title || title.trim() === s.title) return;
    await fetch(`/api/sessions/${s.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: title.trim() })
    });
    await loadSessions();
  }

  async function togglePin(s: SessionRow) {
    await fetch(`/api/sessions/${s.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isPinned: !s.isPinned })
    });
    await loadSessions();
  }

  async function deleteSession(id: string) {
    if (!window.confirm("Hapus session ini beserta pesan/generasinya?")) return;
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    if (activeSessionId === id) {
      setActiveSessionId(undefined);
      setMessages([]);
      setGenerations([]);
    }
    await loadSessions();
  }

  async function submit(e?: FormEvent) {
    e?.preventDefault();
    if (!prompt.trim() || loading) return;
    setError("");
    setLoading(true);

    try {
      if (mode === "chat") {
        const optimistic: MessageRow = { role: "user", content: prompt, modelId };
        setMessages((prev) => [...prev, optimistic]);
        const currentPrompt = prompt;
        setPrompt("");
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sessionId: activeSessionId, modelId, message: currentPrompt, temperature, reasoningEffort, systemPrompt })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Chat gagal.");
        setActiveSessionId(data.sessionId);
        setMessages((prev) => [...prev, data.message]);
      } else {
        const [width, height] = size.split("x").map(Number);
        const currentPrompt = prompt;
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            type: mode,
            sessionId: activeSessionId,
            prompt: currentPrompt,
            negativePrompt: negativePrompt || undefined,
            modelId,
            width,
            height,
            duration,
            voice,
            format: "mp3",
            aspectRatio: width > height ? "16:9" : width < height ? "9:16" : "1:1",
            seed: seed ? Number(seed) : undefined,
            style: style || undefined,
            enhance,
            instrumental
          })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Generate gagal.");
        setActiveSessionId(data.generation.sessionId);
        setGenerations((prev) => [data.generation, ...prev]);
      }
      await loadSessions();
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      submit();
    }
  }

  function applyTemplate(t: TemplateRow) {
    setPrompt((prev) => `${t.prompt}${prev}`);
  }

  function useExample(text: string) {
    setPrompt(text);
  }

  async function copyText(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  }

  async function toggleFavorite(g: GenerationRow) {
    await fetch(`/api/collections/${g.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isFavorite: !g.isFavorite })
    });
    setGenerations((prev) => prev.map((item) => (item.id === g.id ? { ...item, isFavorite: !item.isFavorite } : item)));
  }

  function renderGeneration(g: GenerationRow) {
    if (!g.assetUrl) return null;
    if (g.type === "image") return <img src={g.assetUrl} alt={g.prompt} className="mt-3 max-h-[460px] w-full rounded-2xl object-contain" />;
    if (g.type === "video") return <video src={g.assetUrl} controls className="mt-3 max-h-[460px] w-full rounded-2xl" />;
    if (g.type === "audio" || g.type === "music") return <audio src={g.assetUrl} controls className="mt-3 w-full" />;
    return <a href={g.assetUrl} className="btn-primary mt-3 inline-block" download>Unduh file GLB</a>;
  }

  const activeMode = modes.find((m) => m.id === mode)!;
  const ActiveIcon = activeMode.icon;
  const visibleGenerations = generations.filter((g) => g.type === mode);

  return (
    <AppShell>
      <div className="grid min-h-[calc(100vh-3rem)] gap-5 xl:grid-cols-[320px_1fr_300px]">
        <aside className="card rounded-[32px] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">Session</h2>
              <p className="text-xs text-slate-400">Riwayat per akun</p>
            </div>
            <button onClick={newSession} className="rounded-2xl bg-[#6366f1] p-3 text-white"><MessageSquarePlus size={18} /></button>
          </div>

          <div className="mb-3 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input className="input pl-9" value={sessionQuery} onChange={(e) => setSessionQuery(e.target.value)} placeholder="Cari session" />
            </div>
            <button onClick={loadSessions} className="btn-ghost px-3"><RefreshCcw size={16} /></button>
          </div>

          <div className="scrollbar-thin max-h-[calc(100vh-15rem)] space-y-2 overflow-auto pr-1">
            {sessions.map((s) => (
              <div key={s.id} className={clsx("rounded-2xl border p-3 transition", activeSessionId === s.id ? "border-[#6366f1]/70 bg-[#6366f1]/10" : "border-slate-700 bg-slate-950/25 hover:bg-slate-800/60")}>
                <button onClick={() => loadSession(s.id)} className="w-full text-left">
                  <div className="flex items-center gap-2">
                    {s.isPinned && <Pin size={13} className="text-[#c7d2fe]" />}
                    <div className="truncate text-sm font-black">{s.title}</div>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                    <span>{s.type}</span>
                    <span>{(s._count?.messages || 0) + (s._count?.generations || 0)} item</span>
                  </div>
                </button>
                <div className="mt-3 flex items-center gap-2 border-t border-slate-700/70 pt-2 text-xs text-slate-400">
                  <button onClick={() => togglePin(s)} className="hover:text-white">{s.isPinned ? <PinOff size={14} /> : <Pin size={14} />}</button>
                  <button onClick={() => renameSession(s)} className="hover:text-white"><MoreHorizontal size={15} /></button>
                  <button onClick={() => deleteSession(s.id)} className="ml-auto hover:text-red-300"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
            {!sessions.length && <div className="rounded-2xl border border-slate-700 p-4 text-sm text-slate-400">Belum ada session.</div>}
          </div>
        </aside>

        <section className="card flex min-h-[calc(100vh-3rem)] flex-col rounded-[32px] p-4 md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/70 pb-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#6366f1]/15 text-[#6366f1]"><ActiveIcon /></div>
              <div>
                <h1 className="text-2xl font-black">{activeMode.label}</h1>
                <p className="text-sm text-slate-400">{activeMode.hint}</p>
              </div>
            </div>
            <button onClick={() => loadModels(true)} className="btn-ghost inline-flex items-center gap-2"><RefreshCcw size={16} /> Sinkron Model</button>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {modes.map((m) => {
              const Icon = m.icon;
              return (
                <button key={m.id} onClick={() => setMode(m.id)} className={clsx("inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-black", mode === m.id ? "bg-[#6366f1] text-white" : "bg-slate-950/40 text-slate-300 hover:bg-slate-800")}>
                  <Icon size={16} /> {m.label}
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_180px_160px]">
            <label>
              <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-400">Model</span>
              <div className="grid gap-2 sm:grid-cols-[1fr_170px]">
                <select className="input" value={modelId} onChange={(e) => setModelId(e.target.value)}>
                  {modelsForMode.map((m) => <option key={`${m.kind}-${m.id}`} value={m.id}>{m.name || m.id}</option>)}
                </select>
                <input className="input" value={modelQuery} onChange={(e) => setModelQuery(e.target.value)} placeholder="Filter model" />
              </div>
            </label>
            {mode === "chat" && (
              <label>
                <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-400">Temperature</span>
                <input className="input" type="number" min={0} max={2} step={0.1} value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} />
              </label>
            )}
            {mode === "chat" && (
              <label>
                <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-400">Reasoning</span>
                <select className="input" value={reasoningEffort} onChange={(e) => setReasoningEffort(e.target.value as any)}>
                  <option value="none">none</option><option value="minimal">minimal</option><option value="low">low</option><option value="medium">medium</option><option value="high">high</option>
                </select>
              </label>
            )}
            {mode !== "chat" && mode !== "audio" && mode !== "music" && (
              <label>
                <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-400">Ukuran</span>
                <select className="input" value={size} onChange={(e) => setSize(e.target.value)}>
                  <option>1024x1024</option><option>1280x720</option><option>720x1280</option><option>768x768</option><option>1536x1024</option><option>1024x1536</option>
                </select>
              </label>
            )}
            {(mode === "video" || mode === "music") && (
              <label>
                <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-400">Durasi</span>
                <input className="input" type="number" min={mode === "music" ? 3 : 1} max={mode === "music" ? 300 : 120} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
              </label>
            )}
            {mode === "audio" && (
              <label>
                <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-400">Voice</span>
                <select className="input" value={voice} onChange={(e) => setVoice(e.target.value)}>{VOICES.map((v) => <option key={v}>{v}</option>)}</select>
              </label>
            )}
          </div>

          <div className="scrollbar-thin mt-5 min-h-[320px] flex-1 overflow-auto rounded-3xl border border-slate-700 bg-slate-950/25 p-4">
            {mode === "chat" ? (
              <div className="space-y-4">
                {messages.map((m, idx) => (
                  <div key={m.id || idx} className={clsx("group max-w-[92%] rounded-3xl px-4 py-3", m.role === "user" ? "ml-auto bg-[#6366f1] text-white" : "bg-slate-800 text-slate-100")}>
                    <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase opacity-70">
                      <span>{m.role === "user" ? "Anda" : m.modelId || "AI"}</span>
                      <button onClick={() => copyText(m.id || String(idx), m.content)} className="ml-auto opacity-0 transition group-hover:opacity-100">
                        {copied === (m.id || String(idx)) ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div className="whitespace-pre-wrap leading-7">{m.content}</div>
                  </div>
                ))}
                {!messages.length && <EmptyState text="Mulai percakapan baru dengan model pilihan. Gunakan Ctrl+Enter untuk kirim cepat." />}
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {visibleGenerations.map((g) => (
                  <div key={g.id} className="rounded-3xl border border-slate-700 bg-slate-900/60 p-4">
                    <div className="flex items-center gap-2 text-sm font-black">
                      <span>{g.modelId}</span>
                      <button onClick={() => toggleFavorite(g)} className={clsx("ml-auto", g.isFavorite ? "text-yellow-300" : "text-slate-500 hover:text-yellow-200")}><Star size={17} fill={g.isFavorite ? "currentColor" : "none"} /></button>
                    </div>
                    <p className="mt-1 text-sm text-slate-300">{g.prompt}</p>
                    {g.negativePrompt && <p className="mt-2 text-xs text-slate-500">Negative: {g.negativePrompt}</p>}
                    {renderGeneration(g)}
                    {g.assetUrl && <a href={g.assetUrl} className="mt-3 inline-block text-sm font-bold text-[#c7d2fe]" download>Unduh hasil</a>}
                  </div>
                ))}
                {!visibleGenerations.length && <EmptyState text="Belum ada hasil di mode ini." />}
              </div>
            )}
          </div>

          {error && <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

          <div className="mt-4 grid gap-3">
            {mode === "chat" && (
              <textarea className="input min-h-[46px] resize-none" value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} placeholder="System prompt opsional: gaya jawaban, aturan, persona model..." />
            )}
            {mode !== "chat" && (
              <div className="grid gap-3 md:grid-cols-3">
                <input className="input" value={style} onChange={(e) => setStyle(e.target.value)} placeholder="Style opsional: cinematic, realistic..." />
                <input className="input" value={seed} onChange={(e) => setSeed(e.target.value.replace(/[^0-9-]/g, ""))} placeholder="Seed opsional" />
                <label className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/30 px-4 py-3 text-sm font-bold text-slate-300">
                  <input type="checkbox" checked={enhance} onChange={(e) => setEnhance(e.target.checked)} /> Enhance prompt
                </label>
                {(mode === "music" || mode === "video") && (
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/30 px-4 py-3 text-sm font-bold text-slate-300">
                    <input type="checkbox" checked={instrumental} onChange={(e) => setInstrumental(e.target.checked)} /> Instrumental / tanpa audio tambahan
                  </label>
                )}
                {(mode === "image" || mode === "video") && (
                  <input className="input md:col-span-2" value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} placeholder="Negative prompt opsional: blur, watermark, teks, low quality..." />
                )}
              </div>
            )}
            <form onSubmit={submit} className="flex gap-3">
              <textarea className="input min-h-[64px] flex-1 resize-none" value={prompt} onKeyDown={handleKeyDown} onChange={(e) => setPrompt(e.target.value)} placeholder={mode === "chat" ? "Tulis pesan untuk AI..." : "Tulis prompt detail untuk generate..."} />
              <button disabled={loading} className="btn-primary grid w-16 place-items-center" type="submit">
                {loading ? <Loader2 className="animate-spin" /> : <Send />}
              </button>
            </form>
          </div>
        </section>

        <aside className="card rounded-[32px] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">Prompt</h2>
              <p className="text-xs text-slate-400">Template dan contoh cepat</p>
            </div>
            <Wand2 className="text-[#6366f1]" />
          </div>

          <div className="mb-5 space-y-2">
            <div className="text-xs font-black uppercase tracking-wide text-slate-500">Template</div>
            {templates.slice(0, 8).map((t) => (
              <button key={t.id} onClick={() => applyTemplate(t)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/25 p-3 text-left hover:bg-slate-800/60">
                <div className="flex items-center gap-2 text-sm font-black">{t.isPinned && <Pin size={13} className="text-[#c7d2fe]" />} {t.name}</div>
                <div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{t.prompt}</div>
              </button>
            ))}
            {!templates.length && <div className="rounded-2xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">Template belum tersedia.</div>}
          </div>

          <div className="space-y-2">
            <div className="text-xs font-black uppercase tracking-wide text-slate-500">Contoh prompt</div>
            {examples[mode].map((text) => (
              <button key={text} onClick={() => useExample(text)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/25 p-3 text-left text-sm leading-6 text-slate-300 hover:bg-slate-800/60">
                {text}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-3xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">{text}</div>;
}
