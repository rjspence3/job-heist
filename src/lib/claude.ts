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
  return process.env.CLAUDE_REPORT_MODEL || "claude-sonnet-4-5-20250929";
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
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    },
    { timeout: 55_000 }
  );

  if (response.content.length === 0) {
    throw new Error("Empty response from Claude");
  }

  const firstBlock = response.content[0];
  if (firstBlock.type !== "text") {
    throw new Error("Unexpected response format");
  }

  try {
    const report = heistReportSchema.parse(JSON.parse(firstBlock.text));
    return report;
  } catch {
    throw new Error("Failed to parse report JSON");
  }
}
