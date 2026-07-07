import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  email: z.string().email().transform((v) => v.toLowerCase()).optional(),
  avatarUrl: z.string().url().or(z.literal("")).optional()
});

export async function GET() {
  try {
    const user = await requireUser();
    const row = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true, preference: true }
    });
    return NextResponse.json({ user: row });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Gagal memuat profil." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const body = updateSchema.parse(await req.json());

    if (body.email) {
      const exists = await prisma.user.findFirst({ where: { email: body.email, NOT: { id: user.id } } });
      if (exists) return NextResponse.json({ error: "Email sudah dipakai akun lain." }, { status: 409 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(body.name ? { name: body.name } : {}),
        ...(body.email ? { email: body.email } : {}),
        ...(body.avatarUrl !== undefined ? { avatarUrl: body.avatarUrl || null } : {})
      },
      select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true }
    });

    return NextResponse.json({ user: updated });
  } catch (error: any) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error?.message || "Gagal mengubah profil." }, { status: 400 });
  }
}
