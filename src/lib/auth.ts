import { cookies, headers } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const COOKIE_NAME = "kreasi_ai_session";
const DEFAULT_DAYS = 14;

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET wajib diisi minimal 32 karakter.");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createAuthSession(userId: string) {
  const h = headers();
  const userAgent = h.get("user-agent") ?? undefined;
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? undefined;
  const expiresAt = new Date(Date.now() + DEFAULT_DAYS * 24 * 60 * 60 * 1000);

  const session = await prisma.authSession.create({
    data: { userId, userAgent, ip, expiresAt }
  });

  const token = await new SignJWT({ sid: session.id })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${DEFAULT_DAYS}d`)
    .sign(getSecret());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });

  return session;
}

export async function clearAuthSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (token) {
    try {
      const payload = await jwtVerify(token, getSecret());
      const sid = String(payload.payload.sid ?? "");
      if (sid) await prisma.authSession.deleteMany({ where: { id: sid } });
    } catch {
      // Abaikan token rusak/expired.
    }
  }
  cookies().delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const userId = payload.sub;
    const sessionId = String(payload.sid ?? "");
    if (!userId || !sessionId) return null;

    const session = await prisma.authSession.findFirst({
      where: { id: sessionId, userId, expiresAt: { gt: new Date() } },
      include: { user: true }
    });

    if (!session) return null;

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      avatarUrl: session.user.avatarUrl,
      sessionId: session.id
    };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" }
    });
  }
  return user;
}
