import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const user = await requireUser();
  const data = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      aiSessions: { include: { messages: true, generations: true }, orderBy: { updatedAt: "desc" } },
      promptTemplates: true,
      usageLogs: { orderBy: { createdAt: "desc" }, take: 500 }
    }
  });
  return new Response(JSON.stringify({ exportedAt: new Date().toISOString(), data }, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="kreasi-ai-export-${new Date().toISOString().slice(0, 10)}.json"`
    }
  });
}
