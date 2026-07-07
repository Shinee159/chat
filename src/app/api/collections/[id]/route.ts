import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  title: z.string().max(120).optional(),
  isFavorite: z.boolean().optional()
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const body = schema.parse(await req.json());
    const updated = await prisma.generation.updateMany({
      where: { id: params.id, userId: user.id },
      data: {
        ...(body.title !== undefined ? { title: body.title || null } : {}),
        ...(body.isFavorite !== undefined ? { isFavorite: body.isFavorite } : {})
      }
    });
    if (!updated.count) return NextResponse.json({ error: "Item tidak ditemukan." }, { status: 404 });
    const generation = await prisma.generation.findFirst({ where: { id: params.id, userId: user.id } });
    return NextResponse.json({ generation });
  } catch (error: any) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error?.message || "Gagal mengubah item." }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    await prisma.generation.deleteMany({ where: { id: params.id, userId: user.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Gagal menghapus item." }, { status: 500 });
  }
}
