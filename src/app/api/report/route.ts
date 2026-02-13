import { NextResponse } from "next/server";
import { generateReport } from "@/lib/claude";
import { getReportSystemPrompt } from "@/lib/prompts";
import { validateScores } from "@/lib/scoring";
import { reportRequestSchema } from "@/lib/schemas";
import { checkRateLimit } from "@/lib/rate-limit";
import type { HeistReport } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const limit = checkRateLimit(`report:${ip}`, {
      windowMs: 60_000,
      maxRequests: 5,
    });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)),
          },
        }
      );
    }

    const body = await request.json();
    const parsed = reportRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const { interviewData } = parsed.data;
    const systemPrompt = getReportSystemPrompt(interviewData);

    let report: HeistReport;
    let attemptCount = 0;
    const maxAttempts = 2;

    while (attemptCount < maxAttempts) {
      try {
        report = await generateReport(systemPrompt, interviewData);
        const validatedReport = validateScores(report);
        return NextResponse.json(validatedReport);
      } catch (error) {
        attemptCount++;
        if (attemptCount >= maxAttempts) {
          throw error;
        }
      }
    }

    return NextResponse.json(
      { error: "Failed to generate valid report" },
      { status: 500 }
    );
  } catch (error) {
    console.error(
      "Report API error:",
      error instanceof Error ? error.message : "Unknown error"
    );

    if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
