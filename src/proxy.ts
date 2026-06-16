import { NextRequest, NextResponse } from "next/server";
import { isRouteAuthorized } from "@/config/route-access";
import type { SessionPayload } from "@/utils/definitions";

const publicPaths = ["/", "/login", "/sign-up"];

function parseSession(cookieValue: string | undefined): SessionPayload | null {
  if (!cookieValue) return null;
  try {
    const payload = JSON.parse(cookieValue);
    return typeof payload?.token === "string"
      ? (payload as SessionPayload)
      : null;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = parseSession(request.cookies.get("auth-token")?.value);
  const isPublicPath = publicPaths.includes(pathname);

  if (isPublicPath && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isPublicPath && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && !isPublicPath && !isRouteAuthorized(pathname, session.role)) {
    return NextResponse.rewrite(new URL("/_not-found", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.\\w+$).*)"],
};
