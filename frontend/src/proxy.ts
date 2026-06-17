import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith("/admin") && path !== "/admin/login" && !request.cookies.has("tbilling_client_session")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (
    path.startsWith("/super-admin") &&
    path !== "/super-admin/login" &&
    !request.cookies.has("tbilling_super_session")
  ) {
    return NextResponse.redirect(new URL("/super-admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/super-admin/:path*"],
};
