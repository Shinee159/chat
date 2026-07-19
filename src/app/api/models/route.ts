import { NextResponse } from "next/server";
import { FALLBACK_MODELS } from "@/lib/fallback-models";

// Manual model endpoint.
// Sengaja tidak memakai fetch endpoint Pollinations dan tidak membaca database cache,
// supaya model yang tampil di UI selalu sama dengan isi src/lib/fallback-models.ts.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind");
  const models = FALLBACK_MODELS.filter((m) => !kind || kind === "all" || m.kind === kind);

  return NextResponse.json({
    models,
    fallback: false,
    manual: true,
    syncedAt: null
  });
}
