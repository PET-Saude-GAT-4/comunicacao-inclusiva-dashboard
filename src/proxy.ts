import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/", "/login", "/sign-up"];

function isValidSession(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  try {
    const payload = JSON.parse(cookieValue);
    return typeof payload?.token === "string";
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("auth-token")?.value;
  const authenticated = isValidSession(sessionCookie);

  const isPublicPath = publicPaths.includes(pathname);

  if (isPublicPath && authenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isPublicPath && !authenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.\\w+$).*)"],
};
