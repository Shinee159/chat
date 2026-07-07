"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bot, Library, LogOut, Menu, Settings, Sparkles, UserCircle, X } from "lucide-react";
import clsx from "clsx";

type User = { id: string; name: string; email: string; avatarUrl?: string } | null;

const nav = [
  { href: "/dashboard", label: "Peta Fitur", icon: Sparkles },
  { href: "/chat", label: "Chat & Kreasi", icon: Bot },
  { href: "/collection", label: "Koleksi Saya", icon: Library },
  { href: "/settings", label: "Pengaturan", icon: Settings }
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) router.replace("/");
        setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  }

  if (loading) {
    return (
      <main className="grid-bg flex min-h-screen items-center justify-center">
        <div className="card rounded-3xl px-7 py-5 text-slate-300">Memuat session...</div>
      </main>
    );
  }

  const sidebar = (
    <aside className="card flex h-full w-72 shrink-0 flex-col rounded-[28px] p-4">
      <Link href="/dashboard" className="mb-6 flex items-center gap-3 rounded-2xl bg-slate-950/40 p-3" onClick={() => setOpen(false)}>
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#6366f1]/15 text-[#6366f1]">
          <Sparkles size={22} />
        </div>
        <div>
          <div className="text-lg font-black">Kreasi AI</div>
          <div className="text-xs text-slate-400">AI production suite</div>
        </div>
      </Link>

      <nav className="space-y-2">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={clsx(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition",
                active ? "bg-[#6366f1] text-white shadow-glow" : "text-slate-300 hover:bg-slate-800/80"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-slate-700/70 bg-slate-950/35 p-4">
        <div className="flex items-center gap-3">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 rounded-2xl object-cover" />
          ) : (
            <UserCircle className="text-slate-300" />
          )}
          <div className="min-w-0">
            <div className="truncate text-sm font-bold">{user?.name}</div>
            <div className="truncate text-xs text-slate-400">{user?.email}</div>
          </div>
        </div>
        <button onClick={logout} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-sm font-bold text-slate-200 hover:bg-slate-700">
          <LogOut size={16} /> Keluar
        </button>
      </div>
    </aside>
  );

  return (
    <main className="grid-bg min-h-screen">
      <button onClick={() => setOpen(true)} className="fixed left-4 top-4 z-40 grid h-11 w-11 place-items-center rounded-2xl border border-slate-700 bg-slate-900/95 text-slate-200 md:hidden">
        <Menu size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 p-4 md:hidden">
          <button onClick={() => setOpen(false)} className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-2xl bg-slate-800 text-slate-200"><X size={18} /></button>
          {sidebar}
        </div>
      )}

      <div className="mx-auto flex min-h-screen w-full max-w-[1580px] gap-5 p-4 pt-16 md:p-6">
        <div className="hidden md:block">{sidebar}</div>
        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </main>
  );
}
