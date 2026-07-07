import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { pollinationsChat } from "@/lib/pollinations";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const schema = z.object({
  sessionId: z.string().optional(),
  modelId: z.string().min(1),
  message: z.string().min(1).max(64000),
  temperature: z.number().min(0).max(2).optional(),
  reasoningEffort: z.enum(["none", "minimal", "low", "medium", "high"]).optional(),
  systemPrompt: z.string().max(4000).optional()
});

export async function POST(req: Request) {
  const startedAt = Date.now();
  try {
    const user = await requireUser();
    const limit = checkRateLimit(`chat:${user.id}`, 40, 60_000);
    if (!limit.ok) return rateLimitResponse(limit.resetAt);

    const body = schema.parse(await req.json());

    let sessionId = body.sessionId;
    let session = sessionId ? await prisma.aiSession.findFirst({ where: { id: sessionId, userId: user.id } }) : null;

    if (!session) {
      session = await prisma.aiSession.create({
        data: {
          userId: user.id,
          title: body.message.slice(0, 72),
          type: "chat",
          modelId: body.modelId
        }
      });
      sessionId = session.id;
    }

    await prisma.message.create({
      data: {
        userId: user.id,
        sessionId: session.id,
        role: "user",
        content: body.message,
        modelId: body.modelId,
        metadata: JSON.stringify({ temperature: body.temperature, reasoningEffort: body.reasoningEffort })
      }
    });

    const history = await prisma.message.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: "asc" },
      take: 30
    });

    const reply = await pollinationsChat({
      modelId: body.modelId,
      messages: history.map((m) => ({ role: m.role as "system" | "user" | "assistant", content: m.content })),
      temperature: body.temperature,
      reasoningEffort: body.reasoningEffort,
      systemPrompt: body.systemPrompt
    });

    const savedReply = await prisma.message.create({
      data: {
        userId: user.id,
        sessionId: session.id,
        role: "assistant",
        content: reply,
        modelId: body.modelId
      }
    });

    await prisma.aiSession.update({ where: { id: session.id }, data: { updatedAt: new Date(), modelId: body.modelId } });
    await prisma.usageLog.create({
      data: {
        userId: user.id,
        type: "chat",
        modelId: body.modelId,
        inputChars: body.message.length,
        outputChars: reply.length,
        status: "success",
        durationMs: Date.now() - startedAt
      }
    });

    return NextResponse.json({ sessionId, message: savedReply });
  } catch (error: any) {
    if (error instanceof Response) return error;
    try {
      const user = await requireUser();
      await prisma.usageLog.create({
        data: { userId: user.id, type: "chat", status: "failed", durationMs: Date.now() - startedAt, metadata: JSON.stringify({ error: error?.message }) }
      });
    } catch {}
    return NextResponse.json({ error: error?.message || "Chat gagal." }, { status: 500 });
  }
}
