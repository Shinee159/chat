import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fetchGeneratedMedia } from "@/lib/pollinations";
import type { GeneratePayload } from "@/lib/types";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const generation = await prisma.generation.findFirst({ where: { id: params.id, userId: user.id } });
    if (!generation) return NextResponse.json({ error: "Media tidak ditemukan." }, { status: 404 });

    const meta = JSON.parse(generation.metadata || "{}") as Record<string, any>;
    const payload: GeneratePayload = {
      type: generation.type as GeneratePayload["type"],
      prompt: generation.prompt,
      negativePrompt: generation.negativePrompt || undefined,
      modelId: generation.modelId,
      width: typeof meta.width === "number" ? meta.width : undefined,
      height: typeof meta.height === "number" ? meta.height : undefined,
      duration: typeof meta.duration === "number" ? meta.duration : undefined,
      aspectRatio: meta.aspectRatio,
      voice: meta.voice,
      format: meta.format,
      seed: typeof meta.seed === "number" ? meta.seed : undefined,
      instrumental: meta.instrumental,
      style: meta.style,
      enhance: Boolean(meta.enhance)
    };

    const { res, mimeType } = await fetchGeneratedMedia(payload);
    const headers = new Headers(res.headers);
    headers.set("content-type", mimeType);
    headers.set("cache-control", "private, max-age=3600");
    headers.set("x-kreasi-ai-generation-id", generation.id);

    return new Response(res.body, { status: 200, headers });
  } catch (error: any) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error?.message || "Media gagal dimuat." }, { status: 500 });
  }
}
