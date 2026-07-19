"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, ImageIcon, Music, RefreshCcw, Search, Star, Trash2, Video, Volume2 } from "lucide-react";
import clsx from "clsx";
import AppShell from "./AppShell";

type Generation = {
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

const iconMap: Record<Generation["type"], any> = {
  image: ImageIcon,
  video: Video,
  audio: Volume2,
  music: Music
};

const filters = ["all", "image", "video", "audio", "music"] as const;

export default function CollectionGrid() {
  const [items, setItems] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<(typeof filters)[number]>("all");
  const [query, setQuery] = useState("");
  const [favoriteOnly, setFavoriteOnly] = useState(false);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (type !== "all") params.set("type", type);
    if (query.trim()) params.set("q", query.trim());
    if (favoriteOnly) params.set("favorite", "1");
    const res = await fetch(`/api/collections?${params.toString()}`);
    const data = await res.json().catch(() => ({}));
    setItems(data.generations || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [type, favoriteOnly]);

  const counts = useMemo(() => {
    return items.reduce<Record<string, number>>((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});
  }, [items]);

  async function toggleFavorite(item: Generation) {
    await fetch(`/api/collections/${item.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isFavorite: !item.isFavorite })
    });
    setItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, isFavorite: !row.isFavorite } : row)));
  }

  async function renameItem(item: Generation) {
    const title = window.prompt("Judul koleksi:", item.title || item.prompt.slice(0, 60));
    if (title === null) return;
    await fetch(`/api/collections/${item.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: title.trim() })
    });
    await load();
  }

  async function deleteItem(item: Generation) {
    if (!window.confirm("Hapus item koleksi ini?")) return;
    await fetch(`/api/collections/${item.id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((row) => row.id !== item.id));
  }

  return (
    <AppShell>
      <div className="card min-h-[calc(100vh-3rem)] rounded-[32px] p-4 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black">Koleksi Saya</h1>
            <p className="mt-2 text-sm text-slate-400">Semua hasil generate tersimpan per akun, bisa difilter, difavoritkan, diunduh, atau dihapus.</p>
          </div>
          <button onClick={load} className="btn-ghost inline-flex items-center gap-2"><RefreshCcw size={16} /> Muat Ulang</button>
        </div>

        <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input className="input pl-9" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") load(); }} placeholder="Cari prompt, model, atau judul" />
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button key={f} onClick={() => setType(f)} className={clsx("rounded-2xl px-4 py-2 text-sm font-black", type === f ? "bg-[#6366f1] text-white" : "bg-slate-950/40 text-slate-300 hover:bg-slate-800")}>
                {f === "all" ? "Semua" : f} {f !== "all" && counts[f] ? `(${counts[f]})` : ""}
              </button>
            ))}
            <button onClick={() => setFavoriteOnly((v) => !v)} className={clsx("inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-black", favoriteOnly ? "bg-yellow-400 text-slate-950" : "bg-slate-950/40 text-slate-300 hover:bg-slate-800")}>
              <Star size={15} fill={favoriteOnly ? "currentColor" : "none"} /> Favorit
            </button>
            <button onClick={load} className="btn-primary">Cari</button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-700 p-8 text-center text-slate-400">Memuat koleksi...</div>
        ) : !items.length ? (
          <div className="rounded-3xl border border-dashed border-slate-700 p-10 text-center text-slate-400">Belum ada hasil generate.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const Icon = iconMap[item.type];
              return (
                <article key={item.id} className="rounded-3xl border border-slate-700 bg-slate-950/25 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <button onClick={() => renameItem(item)} className="min-w-0 text-left">
                      <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-300"><Icon size={16} className="text-[#6366f1]" /> {item.title || item.type}</div>
                      <div className="mt-1 truncate text-xs text-slate-500">{new Date(item.createdAt).toLocaleString("id-ID")}</div>
                    </button>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">{item.modelId}</span>
                  </div>
                  <p className="line-clamp-3 min-h-[64px] text-sm leading-6 text-slate-300">{item.prompt}</p>
                  {item.negativePrompt && <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">Negative: {item.negativePrompt}</p>}
                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70 p-3">
                    {renderPreview(item)}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    {item.assetUrl && (
                      <a href={item.assetUrl} download className="inline-flex items-center gap-2 text-sm font-black text-[#c7d2fe]"><Download size={16} /> Unduh</a>
                    )}
                    <button onClick={() => toggleFavorite(item)} className={clsx("inline-flex items-center gap-2 text-sm font-black", item.isFavorite ? "text-yellow-300" : "text-slate-400 hover:text-yellow-200")}><Star size={16} fill={item.isFavorite ? "currentColor" : "none"} /> Favorit</button>
                    <button onClick={() => deleteItem(item)} className="ml-auto inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-red-300"><Trash2 size={16} /> Hapus</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function renderPreview(item: Generation) {
  if (!item.assetUrl) return <div className="text-sm text-slate-400">File belum tersedia.</div>;
  if (item.type === "image") return <img src={item.assetUrl} alt={item.prompt} className="h-56 w-full object-contain" />;
  if (item.type === "video") return <video src={item.assetUrl} controls className="h-56 w-full" />;
  if (item.type === "audio" || item.type === "music") return <audio src={item.assetUrl} controls className="w-full" />;
  return <a href={item.assetUrl} className="btn-primary inline-block" download>Unduh GLB</a>;
}
