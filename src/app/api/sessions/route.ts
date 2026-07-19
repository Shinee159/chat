import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const createSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  type: z.enum(["chat", "image", "video", "audio", "music"]).default("chat"),
  modelId: z.string().optional()
});

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const url = new URL(req.url);
    const query = url.searchParams.get("q")?.trim();
    const type = url.searchParams.get("type") as any;

    const sessions = await prisma.aiSession.findMany({
      where: {
        userId: user.id,
        ...(query ? { title: { contains: query } } : {}),
        ...(type && type !== "all" ? { type } : {})
      },
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
      take: 80,
      include: {
        _count: { select: { messages: true, generations: true } }
      }
    });
    return NextResponse.json({ sessions });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Gagal memuat session." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = createSchema.parse(await req.json());
    const session = await prisma.aiSession.create({
      data: {
        userId: user.id,
        title: body.title || "Percakapan Baru",
        type: body.type,
        modelId: body.modelId
      }
    });
    return NextResponse.json({ session }, { status: 201 });
  } catch (error: any) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error?.message || "Gagal membuat session." }, { status: 400 });
  }
}
