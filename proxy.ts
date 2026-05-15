import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const protectedPrefixes = ["/dashboard", "/admissao", "/movimentacoes", "/usuarios"];
const protectedApiPrefixes = ["/api/submissions", "/api/users"];

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return null;
  }

  return new TextEncoder().encode(secret);
}

function buildContentSecurityPolicy() {
  const isProduction = process.env.NODE_ENV === "production";
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    "https://www.google.com/recaptcha/",
    "https://www.gstatic.com/recaptcha/",
  ];

  if (!isProduction) {
    scriptSrc.push("'unsafe-eval'");
  }

  const connectSrc = [
    "'self'",
    "https://viacep.com.br",
    "https://servicodados.ibge.gov.br",
    "https://www.google.com/recaptcha/",
  ];

  if (!isProduction) {
    connectSrc.push("ws:", "wss:");
  }

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    "frame-src 'self' https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("Content-Security-Policy", buildContentSecurityPolicy());
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-site");

  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  return response;
}

async function hasValidSession(request: NextRequest) {
  const secret = getSecret();
  if (!secret) {
    return false;
  }

  const token = request.cookies.get("fif_session")?.value;
  if (!token) {
    return false;
  }

  try {
    await jwtVerify(token, secret);
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
    return applySecurityHeaders(NextResponse.next());
  }

  const validSession = await hasValidSession(request);
  if (validSession) {
    return applySecurityHeaders(NextResponse.next());
  }

  if (protectedApi) {
    return applySecurityHeaders(NextResponse.json({ error: "Nao autenticado." }, { status: 401 }));
  }

  const loginUrl = new URL("/", request.url);
  return applySecurityHeaders(NextResponse.redirect(loginUrl));
}

export const config = {
  matcher: ["/dashboard/:path*", "/admissao/:path*", "/movimentacoes/:path*", "/usuarios/:path*", "/api/submissions/:path*", "/api/users/:path*"],
};
