import { NextRequest, NextResponse } from "next/server";
import { logEvent, reportServerError, requestIdFromHeaders } from "@/lib/server-observability";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type BackendRouteContext = {
  params: Promise<{ path: string[] }> | { path: string[] };
};

type AdminRole = "client" | "super";

type AuthPayload = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: { role: string };
};

type ProxyLogContext = {
  requestId: string;
  method: string;
  pathKey: string;
  role: AdminRole | null;
  country: string;
  clientIp: string;
  startedAt: number;
};

const backendBaseUrl = process.env.BACKEND_API_URL ?? "http://localhost:8080";
const rateWindows = new Map<string, { count: number; resetAt: number }>();

async function proxyToBackend(request: NextRequest, context: BackendRouteContext) {
  const { path } = await context.params;
  const pathKey = path.join("/");
  const startedAt = Date.now();
  const requestId = requestIdFromHeaders(request.headers);
  const role = roleFromRequest(request);
  const country = countryCode(request);
  const ip = clientIp(request);
  const logContext = {
    requestId,
    method: request.method,
    pathKey,
    role,
    country,
    clientIp: ip,
    startedAt,
  };

  logEvent("info", {
    event: "backend_proxy_start",
    requestId,
    method: request.method,
    path: pathKey,
    role,
    country,
    clientIp: ip,
  });

  try {
    const blocked = enforceEdgeSecurity(request, pathKey);
    if (blocked) return finalizeProxyResponse(blocked, logContext, "backend_proxy_blocked");

    if (pathKey === "auth/logout") {
      return finalizeProxyResponse(logoutResponse(role), logContext);
    }

    const targetUrl = new URL(`/api/v1/${pathKey}`, backendBaseUrl);
    request.nextUrl.searchParams.forEach((value, key) => {
      if (key !== "role") targetUrl.searchParams.append(key, value);
    });

    const headers = new Headers();
    const bearer = request.headers.get("authorization") ?? accessTokenFromCookie(request, role);
    const contentType = request.headers.get("content-type");

    headers.set("accept", request.headers.get("accept") ?? "application/json");
    headers.set("x-request-id", requestId);
    if (bearer) headers.set("authorization", bearer.startsWith("Bearer ") ? bearer : `Bearer ${bearer}`);
    if (contentType) headers.set("content-type", contentType);
    headers.set("x-forwarded-for", ip);

    if (country) headers.set("x-country-code", country);

    const hasBody = !["GET", "HEAD"].includes(request.method);
    const body = hasBody ? await request.arrayBuffer() : undefined;

    const backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      cache: "no-store",
    });

    if (pathKey === "auth/login") {
      return finalizeProxyResponse(await loginResponse(backendResponse, role), logContext);
    }

    if (backendResponse.status === 204) {
      return finalizeProxyResponse(new NextResponse(null, { status: 204 }), logContext);
    }

    const responseHeaders = new Headers();
    const responseContentType = backendResponse.headers.get("content-type");
    if (responseContentType) responseHeaders.set("content-type", responseContentType);

    const response = new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
    return finalizeProxyResponse(response, logContext);
  } catch (error) {
    await reportServerError(error, {
      event: "backend_proxy_failed",
      requestId,
      method: request.method,
      path: pathKey,
      role,
      country,
      clientIp: ip,
      durationMs: Date.now() - startedAt,
    });

    return finalizeProxyResponse(
      NextResponse.json({ message: "Backend unavailable", requestId }, { status: 502 }),
      logContext,
      "backend_proxy_failed_response",
    );
  }
}

async function loginResponse(backendResponse: Response, requestedRole: AdminRole | null) {
  const contentType = backendResponse.headers.get("content-type") ?? "application/json";
  const payload = await backendResponse.json().catch(() => null);

  if (!backendResponse.ok || !payload) {
    return withSecurityHeaders(
      NextResponse.json(payload ?? { message: "Login failed" }, { status: backendResponse.status }),
      "auth/login",
      null,
    );
  }

  const auth = payload as AuthPayload;
  const role = requestedRole ?? roleFromUser(auth.user.role);
  const session = {
    accessTokenExpiresAt: auth.accessTokenExpiresAt,
    refreshTokenExpiresAt: auth.refreshTokenExpiresAt,
    user: auth.user,
  };
  const response = NextResponse.json(session, {
    status: backendResponse.status,
    headers: { "content-type": contentType },
  });

  setAuthCookies(response, role, auth, session);
  return withSecurityHeaders(response, "auth/login", null);
}

function logoutResponse(role: AdminRole | null) {
  const response = new NextResponse(null, { status: 204 });
  if (role) {
    clearAuthCookies(response, role);
  } else {
    clearAuthCookies(response, "client");
    clearAuthCookies(response, "super");
  }
  return withSecurityHeaders(response, "auth/logout", null);
}

function setAuthCookies(
  response: NextResponse,
  role: AdminRole,
  auth: AuthPayload,
  session: Omit<AuthPayload, "accessToken" | "refreshToken">,
) {
  const accessExpires = new Date(auth.accessTokenExpiresAt);
  const refreshExpires = new Date(auth.refreshTokenExpiresAt);
  const sessionValue = Buffer.from(JSON.stringify(session)).toString("base64url");
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set(cookieName(role, "access"), auth.accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure,
    path: "/",
    expires: accessExpires,
  });
  response.cookies.set(cookieName(role, "refresh"), auth.refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure,
    path: "/",
    expires: refreshExpires,
  });
  response.cookies.set(cookieName(role, "session"), sessionValue, {
    httpOnly: false,
    sameSite: "strict",
    secure,
    path: "/",
    expires: accessExpires,
  });
}

function clearAuthCookies(response: NextResponse, role: AdminRole) {
  for (const kind of ["access", "refresh", "session"] as const) {
    response.cookies.set(cookieName(role, kind), "", {
      httpOnly: kind !== "session",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
  }
}

function withSecurityHeaders(response: NextResponse, pathKey: string, request: { method: string } | null) {
  response.headers.set("x-content-type-options", "nosniff");
  response.headers.set("referrer-policy", "strict-origin-when-cross-origin");

  if (request?.method === "GET" && pathKey.startsWith("portal/")) {
    response.headers.set("cache-control", "public, max-age=15, stale-while-revalidate=60");
  } else {
    response.headers.set("cache-control", "no-store");
    response.headers.set("vary", "authorization, cookie, x-tbilling-role");
  }

  return response;
}

function finalizeProxyResponse(response: NextResponse, context: ProxyLogContext, event = "backend_proxy_done") {
  const responseWithHeaders = withSecurityHeaders(response, context.pathKey, {
    method: context.method,
  });
  responseWithHeaders.headers.set("x-request-id", context.requestId);

  const level = responseWithHeaders.status >= 500 ? "error" : responseWithHeaders.status >= 400 ? "warn" : "info";
  logEvent(level, {
    event,
    requestId: context.requestId,
    method: context.method,
    path: context.pathKey,
    role: context.role,
    status: responseWithHeaders.status,
    country: context.country,
    clientIp: context.clientIp,
    durationMs: Date.now() - context.startedAt,
  });

  return responseWithHeaders;
}

function enforceEdgeSecurity(request: NextRequest, pathKey: string) {
  const countryBlocked = geofenceBlocked(request);
  if (countryBlocked) {
    return NextResponse.json({ message: "Request blocked by geofence" }, { status: 403 });
  }

  const policy = ratePolicy(pathKey);
  if (!policy) return null;

  const now = Date.now();
  const key = `${policy.name}:${clientIp(request)}`;
  const current = rateWindows.get(key);
  const resetAt = current && now < current.resetAt ? current.resetAt : now + policy.windowSeconds * 1000;
  const count = current && now < current.resetAt ? current.count + 1 : 1;
  rateWindows.set(key, { count, resetAt });

  if (count > policy.limit) {
    return NextResponse.json(
      { message: "Too many requests" },
      {
        status: 429,
        headers: {
          "x-ratelimit-limit": String(policy.limit),
          "x-ratelimit-remaining": "0",
          "x-ratelimit-reset": String(Math.ceil(resetAt / 1000)),
        },
      },
    );
  }

  return null;
}

function geofenceBlocked(request: NextRequest) {
  if ((process.env.NEXT_GEOFENCE_ENABLED ?? process.env.GEOFENCE_ENABLED) !== "true") return false;

  const allowed = parseCsv(process.env.NEXT_GEOFENCE_ALLOWED_COUNTRIES ?? process.env.GEOFENCE_ALLOWED_COUNTRIES ?? "KE,US");
  const blockUnknown = (process.env.NEXT_GEOFENCE_BLOCK_UNKNOWN ?? process.env.GEOFENCE_BLOCK_UNKNOWN) === "true";
  const country = countryCode(request);

  if (!country) return blockUnknown;
  return !allowed.has(country);
}

function ratePolicy(pathKey: string) {
  if ((process.env.NEXT_RATE_LIMIT_ENABLED ?? process.env.RATE_LIMIT_ENABLED ?? "true") === "false") return null;
  const windowSeconds = Number(process.env.NEXT_RATE_LIMIT_WINDOW_SECONDS ?? process.env.RATE_LIMIT_WINDOW_SECONDS ?? 60);

  if (pathKey.startsWith("auth/")) {
    return {
      name: "auth",
      limit: Number(process.env.NEXT_RATE_LIMIT_AUTH_PER_MINUTE ?? process.env.RATE_LIMIT_AUTH_PER_MINUTE ?? 10),
      windowSeconds,
    };
  }
  if (pathKey.includes("/payments/") || pathKey.startsWith("payments/")) {
    return {
      name: "payment",
      limit: Number(process.env.NEXT_RATE_LIMIT_PAYMENT_PER_MINUTE ?? process.env.RATE_LIMIT_PAYMENT_PER_MINUTE ?? 30),
      windowSeconds,
    };
  }
  return {
    name: "api",
    limit: Number(process.env.NEXT_RATE_LIMIT_API_PER_MINUTE ?? process.env.RATE_LIMIT_API_PER_MINUTE ?? 240),
    windowSeconds,
  };
}

function accessTokenFromCookie(request: NextRequest, role: AdminRole | null) {
  if (!role) return null;
  return request.cookies.get(cookieName(role, "access"))?.value ?? null;
}

function roleFromRequest(request: NextRequest): AdminRole | null {
  const value = request.nextUrl.searchParams.get("role") ?? request.headers.get("x-tbilling-role");
  return value === "client" || value === "super" ? value : null;
}

function roleFromUser(userRole: string): AdminRole {
  return userRole === "ROLE_SUPER_ADMIN" ? "super" : "client";
}

function cookieName(role: AdminRole, kind: "access" | "refresh" | "session") {
  return `tbilling_${role}_${kind}`;
}

function countryCode(request: NextRequest) {
  return (
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    request.headers.get("cloudfront-viewer-country") ??
    request.headers.get("x-country-code") ??
    ""
  )
    .trim()
    .toUpperCase();
}

function clientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

function parseCsv(value: string) {
  return new Set(
    value
      .split(",")
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean),
  );
}

export async function GET(request: NextRequest, context: BackendRouteContext) {
  return proxyToBackend(request, context);
}

export async function POST(request: NextRequest, context: BackendRouteContext) {
  return proxyToBackend(request, context);
}

export async function PUT(request: NextRequest, context: BackendRouteContext) {
  return proxyToBackend(request, context);
}

export async function PATCH(request: NextRequest, context: BackendRouteContext) {
  return proxyToBackend(request, context);
}

export async function DELETE(request: NextRequest, context: BackendRouteContext) {
  return proxyToBackend(request, context);
}
