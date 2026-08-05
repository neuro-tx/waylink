import { NextRequest, NextResponse } from "next/server";
import { decode } from "./lib/preference";
import { auth } from "./lib/auth";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isProtected =
    pathname.startsWith("/admin") || pathname.startsWith("/provider");

  if (!session) {
    if (isProtected) {
      return NextResponse.redirect(new URL("/not-found", request.url));
    }

    return NextResponse.next();
  }

  const role = session.user?.role;

  if (pathname === "/") {
    const checker = decode(
      request.cookies.get("wl_auto_open_dashboard")?.value,
    );

    if (checker && role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (checker && role === "provider") {
      return NextResponse.redirect(new URL("/provider", request.url));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (pathname.startsWith("/provider") && role !== "provider") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/provider/:path*"],
};
