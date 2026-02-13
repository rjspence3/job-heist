import { NextRequest, NextResponse } from "next/server";
import { verifySignedValue } from "@/lib/cookie-sign";

const PUBLIC_PATHS = ["/beta", "/api/beta", "/api/health", "/privacy", "/terms"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const betaCookie = request.cookies.get("beta_access");
  if (betaCookie) {
    const verified = await verifySignedValue(betaCookie.value);
    if (verified === "granted") {
      return NextResponse.next();
    }
  }

  const betaUrl = new URL("/beta", request.url);
  return NextResponse.redirect(betaUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
