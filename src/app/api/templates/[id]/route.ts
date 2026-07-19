import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1).max(80).optional(),
  mode: z.enum(["chat", "image", "video", "audio", "music"]).optional(),
  prompt: z.string().min(1).max(8000).optional(),
  isPinned: z.boolean().optional()
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const body = schema.parse(await req.json());
    const result = await prisma.promptTemplate.updateMany({ where: { id: params.id, userId: user.id }, data: body });
    if (!result.count) return NextResponse.json({ error: "Template tidak ditemukan." }, { status: 404 });
    const template = await prisma.promptTemplate.findFirst({ where: { id: params.id, userId: user.id } });
    return NextResponse.json({ template });
  } catch (error: any) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error?.message || "Gagal mengubah template." }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    await prisma.promptTemplate.deleteMany({ where: { id: params.id, userId: user.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Gagal menghapus template." }, { status: 500 });
  }
}
