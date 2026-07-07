import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const favorite = url.searchParams.get("favorite") === "1";
    const q = url.searchParams.get("q")?.trim();

    const generations = await prisma.generation.findMany({
      where: {
        userId: user.id,
        ...(type && type !== "all" ? { type: type as any } : {}),
        ...(favorite ? { isFavorite: true } : {}),
        ...(q ? { OR: [{ prompt: { contains: q } }, { modelId: { contains: q } }, { title: { contains: q } }] } : {})
      },
      orderBy: { createdAt: "desc" },
      take: 200
    });
    return NextResponse.json({ generations });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Gagal memuat koleksi." }, { status: 500 });
  }
}
