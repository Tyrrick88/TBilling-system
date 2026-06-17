import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type BackendRouteContext = {
  params: Promise<{ path: string[] }> | { path: string[] };
};

const backendBaseUrl = process.env.BACKEND_API_URL ?? "http://localhost:8080";

async function proxyToBackend(request: NextRequest, context: BackendRouteContext) {
  const { path } = await context.params;
  const targetUrl = new URL(`/api/v1/${path.join("/")}`, backendBaseUrl);

  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  const headers = new Headers();
  const authorization = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");

  headers.set("accept", request.headers.get("accept") ?? "application/json");
  if (authorization) headers.set("authorization", authorization);
  if (contentType) headers.set("content-type", contentType);

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const backendResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: body && body.byteLength > 0 ? body : undefined,
    cache: "no-store",
  });

  if (backendResponse.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const responseHeaders = new Headers();
  const responseContentType = backendResponse.headers.get("content-type");
  if (responseContentType) responseHeaders.set("content-type", responseContentType);

  return new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
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
