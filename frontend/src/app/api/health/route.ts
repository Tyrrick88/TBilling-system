import { NextRequest, NextResponse } from "next/server";
import { logEvent, reportServerError, requestIdFromHeaders } from "@/lib/server-observability";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const backendBaseUrl = process.env.BACKEND_API_URL ?? "http://localhost:8080";

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  const requestId = requestIdFromHeaders(request.headers);
  const timeoutMs = Number(process.env.HEALTH_BACKEND_TIMEOUT_MS ?? 2500);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const backendUrl = new URL("/actuator/health/readiness", backendBaseUrl);
    const backendResponse = await fetch(backendUrl, {
      headers: { "x-request-id": requestId },
      cache: "no-store",
      signal: controller.signal,
    });
    const backendBody = await backendResponse.json().catch(() => null);
    const backendStatus = typeof backendBody?.status === "string" ? backendBody.status : "UNKNOWN";
    const healthy = backendResponse.ok && backendStatus === "UP";
    const status = healthy ? 200 : 503;

    logEvent(healthy ? "info" : "warn", {
      event: "health_check",
      requestId,
      status,
      backendStatus,
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json(
      {
        status: healthy ? "UP" : "DEGRADED",
        frontend: "UP",
        backend: {
          status: backendStatus,
          httpStatus: backendResponse.status,
        },
        checkedAt: new Date().toISOString(),
      },
      {
        status,
        headers: {
          "cache-control": "no-store",
          "x-request-id": requestId,
        },
      },
    );
  } catch (error) {
    await reportServerError(error, {
      event: "health_check_failed",
      requestId,
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json(
      {
        status: "DOWN",
        frontend: "UP",
        backend: {
          status: "DOWN",
          httpStatus: null,
        },
        checkedAt: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          "cache-control": "no-store",
          "x-request-id": requestId,
        },
      },
    );
  } finally {
    clearTimeout(timeout);
  }
}
