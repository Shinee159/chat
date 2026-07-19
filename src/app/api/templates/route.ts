import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { DEFAULT_TEMPLATES } from "@/lib/prompt-templates";

const schema = z.object({
  name: z.string().min(1).max(80),
  mode: z.enum(["chat", "image", "video", "audio", "music"]),
  prompt: z.string().min(1).max(8000),
  isPinned: z.boolean().optional()
});

async function ensureDefaultTemplates(userId: string) {
  const count = await prisma.promptTemplate.count({ where: { userId } });
  if (count > 0) return;
  await prisma.promptTemplate.createMany({
    data: DEFAULT_TEMPLATES.map((t) => ({
      userId,
      name: t.name,
      mode: t.mode as any,
      prompt: t.prompt,
      isPinned: Boolean(t.isPinned)
    }))
  });
}

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    await ensureDefaultTemplates(user.id);
    const url = new URL(req.url);
    const mode = url.searchParams.get("mode");
    const templates = await prisma.promptTemplate.findMany({
      where: { userId: user.id, ...(mode && mode !== "all" ? { mode: mode as any } : {}) },
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }]
    });
    return NextResponse.json({ templates });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Gagal memuat template." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = schema.parse(await req.json());
    const template = await prisma.promptTemplate.create({ data: { ...body, userId: user.id } });
    return NextResponse.json({ template }, { status: 201 });
  } catch (error: any) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error?.message || "Gagal membuat template." }, { status: 400 });
  }
}
