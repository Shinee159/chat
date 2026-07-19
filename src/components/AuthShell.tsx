"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Bot, ImageIcon, LockKeyhole, Sparkles, Video } from "lucide-react";

export default function AuthShell() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) router.replace("/dashboard");
      });
  }, [router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload = mode === "login" ? { email, password } : { name, email, password };

    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Proses gagal.");
      return;
    }
    router.replace("/dashboard");
  }

  return (
    <main className="grid-bg flex min-h-screen items-center justify-center p-4">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="card relative overflow-hidden rounded-[32px] p-8 md:p-12">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#6366f1]/20 blur-3xl" />
          <div className="relative z-10">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#6366f1]/30 bg-[#6366f1]/10 px-4 py-2 text-sm font-bold text-[#c7d2fe]">
              <Sparkles size={16} /> Struktur Kreasi AI
            </div>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
              Website chat AI dengan generator gambar, video, musik, audio.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              Satu akun menyimpan session percakapan, riwayat prompt, model yang dipakai, dan koleksi hasil generate.
            </p>

            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              {[
                [Bot, "Obrolan AI", "Multi model chat"],
                [ImageIcon, "Pembuat Gambar", "Prompt ke visual"],
                [Video, "Video & Musik", "Media generation"]
              ].map(([Icon, title, desc]: any) => (
                <div key={title} className="rounded-2xl border border-slate-700/70 bg-slate-950/35 p-4">
                  <Icon className="mb-3 text-[#6366f1]" />
                  <div className="font-black">{title}</div>
                  <div className="mt-1 text-sm text-slate-400">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card rounded-[32px] p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#6366f1]/15 text-[#6366f1]">
              <LockKeyhole />
            </div>
            <div>
              <h2 className="text-2xl font-black">{mode === "login" ? "Masuk Akun" : "Daftar Akun"}</h2>
              <p className="text-sm text-slate-400">Session tersimpan per user/account.</p>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 rounded-2xl bg-slate-950/40 p-1">
            <button onClick={() => setMode("login")} className={`rounded-xl px-4 py-2 text-sm font-bold ${mode === "login" ? "bg-[#6366f1] text-white" : "text-slate-400"}`}>Masuk</button>
            <button onClick={() => setMode("register")} className={`rounded-xl px-4 py-2 text-sm font-bold ${mode === "register" ? "bg-[#6366f1] text-white" : "text-slate-400"}`}>Daftar</button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-300">Nama</span>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama pengguna" />
              </label>
            )}
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-300">Email</span>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@domain.com" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-300">Password</span>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 8 karakter" />
            </label>

            {error && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}
            <button disabled={loading} className="btn-primary w-full" type="submit">
              {loading ? "Memproses..." : mode === "login" ? "Masuk" : "Buat Akun"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
