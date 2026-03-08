import "@anthropic-ai/sdk/shims/node";
import Anthropic from "@anthropic-ai/sdk";
import type { InterviewData, HeistReport } from "./types";
import { heistReportSchema } from "./schemas";
import { getReportUserMessage } from "./prompts";

let client: Anthropic | null = null;

export function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }
    client = new Anthropic({ apiKey, timeout: 30_000 });
  }
  return client;
}

export function getModel(): string {
  return process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001";
}

export function getReportModel(): string {
  return process.env.CLAUDE_REPORT_MODEL || "claude-haiku-4-5-20251001";
}

export async function sendMessage(
  systemPrompt: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  maxTokens: number = 4096
): Promise<string> {
  const client = getClient();
  const model = getModel();

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  });

  if (response.content.length === 0) {
    throw new Error("Empty response from Claude");
  }

  const firstBlock = response.content[0];
  if (firstBlock.type !== "text") {
    throw new Error("Unexpected response format");
  }

  return firstBlock.text;
}

export async function generateReport(
  systemPrompt: string,
  interviewData: InterviewData
): Promise<HeistReport> {
  const client = getClient();
  const model = getReportModel();

  const userMessage = getReportUserMessage(interviewData);

  const response = await client.messages.create(
    {
      model,
      max_tokens: 8192,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    },
    { timeout: 240_000 }
  );

  if (response.content.length === 0) {
    throw new Error("Empty response from Claude");
  }

  if (response.stop_reason === "max_tokens") {
    console.error("Report generation hit max_tokens limit — output was truncated");
  }

  const firstBlock = response.content[0];
  if (firstBlock.type !== "text") {
    throw new Error("Unexpected response format");
  }

  let jsonText = firstBlock.text.trim();
  if (jsonText.startsWith("```")) {
    const firstNewline = jsonText.indexOf("\n");
    if (firstNewline !== -1) {
      jsonText = jsonText.slice(firstNewline + 1);
    }
  }
  if (jsonText.endsWith("```")) {
    jsonText = jsonText.slice(0, jsonText.lastIndexOf("```"));
  }
  jsonText = jsonText.trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    console.error("Report response is not valid JSON:", jsonText.slice(0, 500));
    throw new Error("Failed to parse report JSON");
  }

  const result = heistReportSchema.safeParse(parsed);
  if (!result.success) {
    console.error("Report schema validation failed:", result.error.issues);
    console.error("Report keys received:", Object.keys(parsed as Record<string, unknown>));
    throw new Error("Failed to parse report JSON");
  }

  return result.data;
}
