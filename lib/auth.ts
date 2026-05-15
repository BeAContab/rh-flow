import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

import type { AppRole } from "@/lib/roles";
import { findUserById } from "@/lib/users";

const SESSION_COOKIE = "fif_session";
const encoder = new TextEncoder();

export type SessionPayload = {
  userId: string;
  name: string;
  email: string;
  role: AppRole;
  status: string;
};

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET nao configurado.");
  }
  return encoder.encode(secret);
}

export async function createSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setNotBefore("0s")
    .setExpirationTime("7d")
    .sign(getSessionSecret());
}

export async function verifySession(token: string) {
  const verified = await jwtVerify(token, getSessionSecret());
  return verified.payload as unknown as SessionPayload;
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    const session = await verifySession(token);
    const currentUser = await findUserById(session.userId);

    // Revalidate the session against the database so deletions revoke access promptly.
    if (!currentUser || currentUser.status !== "approved") {
      return null;
    }

    return {
      ...session,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role as AppRole,
      status: currentUser.status,
    };
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/");
  }
  return session;
}

export async function requireAdminSession() {
  const session = await requireSession();
  if (session.role !== "admin") {
    redirect("/dashboard");
  }
  return session;
}

export async function requireUserManagementSession() {
  const session = await requireSession();
  if (session.role !== "admin" && session.role !== "super_user") {
    redirect("/dashboard");
  }
  return session;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
