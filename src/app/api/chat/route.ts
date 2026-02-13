import { NextResponse } from "next/server";
import { sendMessage } from "@/lib/claude";
import { getInterviewSystemPrompt } from "@/lib/prompts";
import { chatRequestSchema, interviewDataSchema } from "@/lib/schemas";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ChatResponse, InterviewData } from "@/lib/types";

const MAX_MESSAGE_LENGTH = 5000;
const COMPLETION_START = ":::INTERVIEW_COMPLETE:::";
const COMPLETION_END = ":::END_DATA:::";

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const limit = checkRateLimit(`chat:${ip}`, {
      windowMs: 60_000,
      maxRequests: 20,
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
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const { messages } = parsed.data;

    const truncatedMessages = messages.map((msg) => ({
      ...msg,
      content:
        msg.content.length > MAX_MESSAGE_LENGTH
          ? msg.content.slice(0, MAX_MESSAGE_LENGTH)
          : msg.content,
    }));

    const systemPrompt = getInterviewSystemPrompt();
    const rawReply = await sendMessage(systemPrompt, truncatedMessages, 2048);

    const { cleanReply, interviewComplete, extractedData } =
      parseInterviewResponse(rawReply);

    const response: ChatResponse = {
      reply: cleanReply,
      interviewComplete,
      extractedData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(
      "Chat API error:",
      error instanceof Error ? error.message : "Unknown error"
    );

    if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}

function parseInterviewResponse(rawReply: string): {
  cleanReply: string;
  interviewComplete: boolean;
  extractedData: InterviewData | null;
} {
  const startIndex = rawReply.indexOf(COMPLETION_START);

  if (startIndex === -1) {
    return {
      cleanReply: rawReply,
      interviewComplete: false,
      extractedData: null,
    };
  }

  const endIndex = rawReply.indexOf(COMPLETION_END, startIndex);

  if (endIndex === -1) {
    return {
      cleanReply: rawReply,
      interviewComplete: false,
      extractedData: null,
    };
  }

  const cleanReply = rawReply.slice(0, startIndex).trim();

  const jsonStart = startIndex + COMPLETION_START.length;
  const jsonString = rawReply.slice(jsonStart, endIndex).trim();

  try {
    const raw = JSON.parse(jsonString);
    const normalized = normalizeInterviewData(raw);
    const result = interviewDataSchema.safeParse(normalized);

    if (!result.success) {
      console.error("Interview data validation failed:", result.error.issues);
      return {
        cleanReply: rawReply,
        interviewComplete: false,
        extractedData: null,
      };
    }

    return {
      cleanReply,
      interviewComplete: true,
      extractedData: result.data,
    };
  } catch {
    return {
      cleanReply: rawReply,
      interviewComplete: false,
      extractedData: null,
    };
  }
}

const FIELD_ALIASES: Record<string, string> = {
  humanInteraction: "humanInteractions",
  creativeElement: "creativeElements",
  painPoint: "painPoints",
  decisionType: "decisionTypes",
  toolUsed: "toolsUsed",
  tool: "toolsUsed",
  dailyTask: "dailyTasks",
};

function normalizeInterviewData(raw: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    normalized[FIELD_ALIASES[key] ?? key] = value;
  }
  return normalized;
}
