import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireUser();
    const [sessionCount, messageCount, generationCount, favoriteCount, modelCount, usageLogs, byType] = await Promise.all([
      prisma.aiSession.count({ where: { userId: user.id } }),
      prisma.message.count({ where: { userId: user.id } }),
      prisma.generation.count({ where: { userId: user.id } }),
      prisma.generation.count({ where: { userId: user.id, isFavorite: true } }),
      prisma.modelCache.count(),
      prisma.usageLog.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30 }),
      prisma.generation.groupBy({ by: ["type"], where: { userId: user.id }, _count: { _all: true } })
    ]);

    return NextResponse.json({
      stats: {
        sessions: sessionCount,
        messages: messageCount,
        generations: generationCount,
        favorites: favoriteCount,
        models: modelCount,
        usageLast30: usageLogs.length,
        byType: byType.map((r) => ({ type: r.type, count: r._count._all }))
      }
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Gagal memuat statistik." }, { status: 500 });
  }
}
