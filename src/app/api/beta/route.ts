import { NextResponse } from "next/server";
import { signValue } from "@/lib/cookie-sign";

export async function POST(request: Request) {
  try {
    const betaCode = process.env.BETA_CODE;
    if (!betaCode) {
      return NextResponse.json(
        { error: "Beta access not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { code } = body;

    if (typeof code !== "string" || code.trim().toLowerCase() !== betaCode.toLowerCase()) {
      return NextResponse.json({ error: "Invalid code" }, { status: 401 });
    }

    const signedValue = await signValue("granted");
    const response = NextResponse.json({ ok: true });
    response.cookies.set("beta_access", signedValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
