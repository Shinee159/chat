import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { FALLBACK_MODELS } from "@/lib/fallback-models";
import { fetchProviderModels } from "@/lib/pollinations";

function cleanJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const refresh = url.searchParams.get("refresh") === "1";
  const kind = url.searchParams.get("kind");

  try {
    const cached = await prisma.modelCache.findMany({ orderBy: [{ type: "asc" }, { modelId: "asc" }] });
    const latestUpdate = cached[0]?.updatedAt?.getTime() ?? 0;
    const stale = Date.now() - latestUpdate > 24 * 60 * 60 * 1000;

    if (refresh || cached.length === 0 || stale) {
      const models = await fetchProviderModels();
      if (models.length) {
        await prisma.$transaction(
          models.map((m) =>
            prisma.modelCache.upsert({
              where: { source_modelId: { source: m.provider, modelId: m.id } },
              update: {
                type: m.kind,
                name: m.name,
                capabilities: JSON.stringify(cleanJson({
                  inputModalities: m.inputModalities,
                  outputModalities: m.outputModalities,
                  supportedEndpoints: m.supportedEndpoints,
                  reasoning: m.reasoning,
                  tools: m.tools,
                  contextLength: m.contextLength
                })),
                raw: JSON.stringify(cleanJson(m))
              },
              create: {
                source: m.provider,
                modelId: m.id,
                type: m.kind,
                name: m.name,
                capabilities: JSON.stringify(cleanJson({
                  inputModalities: m.inputModalities,
                  outputModalities: m.outputModalities,
                  supportedEndpoints: m.supportedEndpoints,
                  reasoning: m.reasoning,
                  tools: m.tools,
                  contextLength: m.contextLength
                })),
                raw: JSON.stringify(cleanJson(m))
              }
            })
          )
        );
      }
    }

    const rows = await prisma.modelCache.findMany({
      where: kind && kind !== "all" ? { type: kind } : {},
      orderBy: [{ type: "asc" }, { modelId: "asc" }]
    });
    const models = rows.length
      ? rows.map((r) => ({
          id: r.modelId,
          name: r.name,
          kind: r.type,
          provider: r.source,
          ...(r.raw ? JSON.parse(r.raw) : {})
        }))
      : FALLBACK_MODELS.filter((m) => !kind || kind === "all" || m.kind === kind);

    return NextResponse.json({ models, fallback: rows.length === 0, syncedAt: rows[0]?.updatedAt ?? null });
  } catch {
    return NextResponse.json({ models: FALLBACK_MODELS.filter((m) => !kind || kind === "all" || m.kind === kind), fallback: true });
  }
}
