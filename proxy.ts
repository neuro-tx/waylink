import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "./lib/auth-server";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.redirect(new URL("/not-found", request.url));
  }

  const role = session.user?.role;

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (pathname.startsWith("/provider") && role !== "provider") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/provider/:path*"],
};
