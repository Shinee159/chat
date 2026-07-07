"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bot, ChevronRight, Database, Download, ImageIcon, KeyRound, Library, LogIn, LogOut, Music, Settings, Sparkles, Star, UserPlus, Video, Wand2 } from "lucide-react";
import AppShell from "./AppShell";

const branches = [
  {
    title: "Chat & Kreasi",
    subtitle: "Aktif",
    icon: Bot,
    href: "/chat",
    y: 34,
    features: ["Obrolan AI", "Pembuat Gambar", "Pembuat Video", "Pembuat Musik", "Audio", "3D"],
    featureIcons: [Bot, ImageIcon, Video, Music, Sparkles, Database]
  },
  {
    title: "Koleksi Saya",
    subtitle: "Aktif",
    icon: Library,
    href: "/collection",
    y: 205,
    features: ["Semua Hasil", "Filter", "Favorit", "Unduh Hasil"],
    featureIcons: [Library, Sparkles, Star, Download]
  },
  {
    title: "Daftar & Masuk",
    subtitle: "Aktif",
    icon: KeyRound,
    href: "/",
    y: 376,
    features: ["Daftar Akun", "Masuk Akun", "Session Cookie", "DB Session"],
    featureIcons: [UserPlus, LogIn, KeyRound, Database]
  },
  {
    title: "Pengaturan Akun",
    subtitle: "Aktif",
    icon: Settings,
    href: "/settings",
    y: 547,
    features: ["Ubah Profil", "Export Data", "Keluar Akun"],
    featureIcons: [Settings, Download, LogOut]
  }
];

type Stats = {
  sessions: number;
  messages: number;
  generations: number;
  favorites: number;
  models: number;
  usageLast30: number;
  byType: Array<{ type: string; count: number }>;
};

export default function GraphDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setStats(d.stats || null))
      .catch(() => setStats(null));
  }, []);

  const cards = [
    ["Session", stats?.sessions ?? 0],
    ["Pesan", stats?.messages ?? 0],
    ["Generasi", stats?.generations ?? 0],
    ["Favorit", stats?.favorites ?? 0],
    ["Model", stats?.models ?? 0]
  ];

  return (
    <AppShell>
      <div className="card min-h-[calc(100vh-3rem)] overflow-hidden rounded-[32px] p-4 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#6366f1]/35 bg-[#6366f1]/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#c7d2fe]">
              <Sparkles size={14} /> Fase 2 Development
            </div>
            <h1 className="mt-3 text-3xl font-black md:text-4xl">Struktur Website Kreasi AI</h1>
            <p className="mt-2 text-sm text-slate-400">Dashboard fitur mengikuti diagram awal, tetapi sudah ditambah statistik, template prompt, koleksi favorit, dan export data.</p>
          </div>
          <Link href="/chat" className="btn-primary inline-flex items-center gap-2">
            Buka Workspace <ChevronRight size={18} />
          </Link>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map(([label, value]) => (
            <div key={label as string} className="rounded-3xl border border-slate-700 bg-slate-950/30 p-4">
              <div className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</div>
              <div className="mt-2 text-3xl font-black">{value}</div>
            </div>
          ))}
        </div>

        <div className="relative hidden min-h-[720px] xl:block">
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1120 720" preserveAspectRatio="none">
            {branches.map((b) => (
              <path key={b.title} d={`M 210 340 C 330 ${b.y + 54}, 350 ${b.y + 54}, 430 ${b.y + 54}`} stroke="rgba(148,163,184,.68)" strokeWidth="1.5" fill="none" />
            ))}
            {branches.map((b) => (
              <path key={`${b.title}-right`} d={`M 610 ${b.y + 54} C 710 ${b.y + 54}, 720 ${b.y + 54}, 765 ${b.y + 54}`} stroke="rgba(148,163,184,.68)" strokeWidth="1.5" fill="none" />
            ))}
          </svg>

          <div className="absolute left-0 top-[300px] w-[260px] rounded-3xl border border-slate-700 bg-slate-800/90 p-5 shadow-glow">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#6366f1]/15 text-[#6366f1]"><Wand2 size={20} /></div>
              <h2 className="text-xl font-black">Kreasi AI</h2>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-400">Production workspace</p>
            <span className="absolute right-[-6px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-slate-400" />
          </div>

          {branches.map((branch) => {
            const Icon = branch.icon;
            return (
              <div key={branch.title}>
                <Link href={branch.href} className="absolute left-[430px] block w-[250px] rounded-3xl border border-slate-700 bg-slate-800/90 p-4 transition hover:border-[#6366f1]/70" style={{ top: branch.y }}>
                  <span className="absolute -top-3 right-4 rounded-full border border-[#6366f1]/60 bg-[#6366f1]/15 px-2 py-0.5 text-xs font-black text-[#c7d2fe]">FASE 2</span>
                  <span className="absolute left-[-6px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-slate-400" />
                  <span className="absolute right-[-6px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-slate-400" />
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-2xl border border-slate-600 text-slate-300"><Icon size={18} /></div>
                    <div className="font-black">{branch.title}</div>
                    <ChevronRight className="ml-auto text-slate-500" size={18} />
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-400"><span className="h-2 w-2 rounded-full bg-emerald-400" /> {branch.subtitle}</div>
                </Link>

                <div className="absolute left-[765px] w-[300px] rounded-3xl border border-slate-700 bg-slate-800/90 p-4" style={{ top: branch.y - 6 }}>
                  <span className="absolute left-[-6px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-slate-400" />
                  <span className="absolute right-[-6px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-slate-400" />
                  <div className="mb-3 text-sm font-black uppercase tracking-wide text-slate-400">Sub Fitur</div>
                  <div className="space-y-2">
                    {branch.features.map((feature, index) => {
                      const FIcon = branch.featureIcons[index];
                      return (
                        <div key={feature} className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm font-bold">
                          <span className="h-2 w-2 rounded-full bg-slate-500" />
                          {FIcon && <FIcon size={14} className="text-slate-400" />}
                          {feature}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 text-right text-xs font-bold text-slate-400">Lihat semua ({branch.features.length}) ›</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 xl:hidden">
          {branches.map((branch) => {
            const Icon = branch.icon;
            return (
              <Link key={branch.title} href={branch.href} className="rounded-3xl border border-slate-700 bg-slate-800/80 p-5">
                <div className="flex items-center gap-3">
                  <Icon className="text-[#6366f1]" />
                  <div>
                    <div className="font-black">{branch.title}</div>
                    <div className="text-sm text-slate-400">{branch.features.join(" • ")}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
