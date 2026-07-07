import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const patchSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  isPinned: z.boolean().optional(),
  modelId: z.string().optional()
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const session = await prisma.aiSession.findFirst({
      where: { id: params.id, userId: user.id },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        generations: { orderBy: { createdAt: "desc" } }
      }
    });
    if (!session) return NextResponse.json({ error: "Session tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ session });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Gagal memuat session." }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const body = patchSchema.parse(await req.json());
    const updated = await prisma.aiSession.updateMany({
      where: { id: params.id, userId: user.id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.isPinned !== undefined ? { isPinned: body.isPinned } : {}),
        ...(body.modelId !== undefined ? { modelId: body.modelId } : {})
      }
    });
    if (!updated.count) return NextResponse.json({ error: "Session tidak ditemukan." }, { status: 404 });
    const session = await prisma.aiSession.findFirst({ where: { id: params.id, userId: user.id } });
    return NextResponse.json({ session });
  } catch (error: any) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error?.message || "Gagal mengubah session." }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    await prisma.aiSession.deleteMany({ where: { id: params.id, userId: user.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Gagal menghapus session." }, { status: 500 });
  }
}
