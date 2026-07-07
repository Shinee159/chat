import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { buildMediaRequest } from "@/lib/pollinations";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const schema = z.object({
  type: z.enum(["image", "video", "audio", "music", "model3d"]),
  prompt: z.string().min(1).max(32000),
  negativePrompt: z.string().max(12000).optional(),
  modelId: z.string().min(1),
  sessionId: z.string().optional(),
  width: z.number().int().min(128).max(4096).optional(),
  height: z.number().int().min(128).max(4096).optional(),
  duration: z.number().min(1).max(300).optional(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).optional(),
  voice: z.string().optional(),
  format: z.enum(["mp3", "wav", "flac", "opus", "aac", "pcm"]).optional(),
  seed: z.number().int().optional(),
  instrumental: z.boolean().optional(),
  style: z.string().max(200).optional(),
  enhance: z.boolean().optional(),
  title: z.string().max(120).optional()
});

const limitByType: Record<string, number> = { image: 25, video: 8, audio: 25, music: 10, model3d: 8 };

export async function POST(req: Request) {
  const startedAt = Date.now();
  try {
    const user = await requireUser();
    const body = schema.parse(await req.json());
    const limit = checkRateLimit(`generate:${body.type}:${user.id}`, limitByType[body.type] || 10, 60_000);
    if (!limit.ok) return rateLimitResponse(limit.resetAt);

    let sessionId: string | null = null;
    if (body.sessionId) {
      const session = await prisma.aiSession.findFirst({ where: { id: body.sessionId, userId: user.id } });
      sessionId = session?.id ?? null;
    }
    if (!sessionId) {
      const session = await prisma.aiSession.create({
        data: {
          userId: user.id,
          title: `${body.type}: ${body.prompt.slice(0, 56)}`,
          type: body.type,
          modelId: body.modelId
        }
      });
      sessionId = session.id;
    }

    const media = buildMediaRequest(body);
    const generation = await prisma.generation.create({
      data: {
        userId: user.id,
        sessionId,
        type: body.type,
        title: body.title,
        prompt: body.prompt,
        negativePrompt: body.negativePrompt,
        modelId: body.modelId,
        assetUrl: "pending",
        mimeType: media.mimeType,
        status: "success",
        metadata: JSON.stringify({
          width: body.width,
          height: body.height,
          duration: body.duration,
          aspectRatio: body.aspectRatio,
          voice: body.voice,
          format: body.format,
          seed: body.seed,
          instrumental: body.instrumental,
          style: body.style,
          enhance: body.enhance
        })
      }
    });

    const assetUrl = `/api/media/${generation.id}`;
    const updated = await prisma.generation.update({ where: { id: generation.id }, data: { assetUrl } });
    await prisma.aiSession.update({ where: { id: sessionId }, data: { updatedAt: new Date(), modelId: body.modelId } });
    await prisma.usageLog.create({
      data: {
        userId: user.id,
        type: body.type,
        modelId: body.modelId,
        inputChars: body.prompt.length + (body.negativePrompt?.length || 0),
        status: "success",
        durationMs: Date.now() - startedAt,
        metadata: JSON.stringify({ generationId: generation.id })
      }
    });

    return NextResponse.json({ generation: updated });
  } catch (error: any) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error?.message || "Generate gagal." }, { status: 500 });
  }
}
