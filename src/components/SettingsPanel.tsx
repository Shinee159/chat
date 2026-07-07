"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, LogOut, Save, Shield, UserCircle } from "lucide-react";
import AppShell from "./AppShell";

type User = { id: string; name: string; email: string; avatarUrl?: string; createdAt?: string; sessionId?: string } | null;

export default function SettingsPanel() {
  const router = useRouter();
  const [user, setUser] = useState<User>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      setUser(d.user);
      setName(d.user?.name || "");
      setEmail(d.user?.email || "");
      setAvatarUrl(d.user?.avatarUrl || "");
    });
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, avatarUrl })
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Gagal menyimpan profil.");
      return;
    }
    setUser((prev) => ({ ...(prev || {}), ...data.user } as User));
    setMessage("Profil berhasil disimpan.");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  }

  return (
    <AppShell>
      <div className="card min-h-[calc(100vh-3rem)] rounded-[32px] p-4 md:p-8">
        <h1 className="text-3xl font-black">Pengaturan Akun</h1>
        <p className="mt-2 text-sm text-slate-400">Informasi akun, session login, dan export data workspace.</p>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-700 bg-slate-950/25 p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-[#6366f1]/15 text-[#6366f1]">
                {avatarUrl ? <img src={avatarUrl} alt={name} className="h-full w-full object-cover" /> : <UserCircle />}
              </div>
              <div>
                <h2 className="text-xl font-black">Profil</h2>
                <p className="text-sm text-slate-400">Ubah data dasar akun.</p>
              </div>
            </div>

            <form onSubmit={save} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">Nama</span>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">Email</span>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">Avatar URL</span>
                <input className="input" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
              </label>
              {message && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{message}</div>}
              {error && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}
              <button disabled={saving} className="btn-primary inline-flex items-center gap-2"><Save size={18} /> {saving ? "Menyimpan..." : "Simpan Profil"}</button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-700 bg-slate-950/25 p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#6366f1]/15 text-[#6366f1]"><Shield /></div>
              <div>
                <h2 className="text-xl font-black">Session & Data</h2>
                <p className="text-sm text-slate-400">Cookie httpOnly + record session di database.</p>
              </div>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-700 bg-slate-900/70 p-4 text-sm text-slate-300">
              <div>Session aktif: <span className="font-mono text-xs text-slate-400">{user?.sessionId || "-"}</span></div>
              <div>Akun dibuat: <span className="text-slate-400">{user?.createdAt ? new Date(user.createdAt).toLocaleString("id-ID") : "-"}</span></div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href="/api/export" className="btn-ghost inline-flex items-center gap-2"><Download size={18} /> Export JSON</a>
              <button onClick={logout} className="btn-primary inline-flex items-center gap-2"><LogOut size={18} /> Keluar Akun</button>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
