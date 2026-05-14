import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const protectedPrefixes = ["/dashboard", "/admissao", "/movimentacoes", "/usuarios"];
const protectedApiPrefixes = ["/api/submissions", "/api/users"];

function getSecret() {
  return new TextEncoder().encode(process.env.SESSION_SECRET || "dev-secret-change-me");
}

async function hasValidSession(request: NextRequest) {
  const token = request.cookies.get("fif_session")?.value;
  if (!token) {
    return false;
  }

  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedRoute = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  const protectedApi = protectedApiPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!protectedRoute && !protectedApi) {
    return NextResponse.next();
  }

  const validSession = await hasValidSession(request);
  if (validSession) {
    return NextResponse.next();
  }

  if (protectedApi) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const loginUrl = new URL("/", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/admissao/:path*", "/movimentacoes/:path*", "/usuarios/:path*", "/api/submissions/:path*", "/api/users/:path*"],
};
