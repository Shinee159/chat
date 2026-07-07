import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createAuthSession, verifyPassword } from "@/lib/auth";

const schema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase()),
  password: z.string().min(1)
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });

    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });

    await createAuthSession(user.id);
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Login gagal." }, { status: 400 });
  }
}
