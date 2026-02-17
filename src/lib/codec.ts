import type { EncodedReportPayload } from "./types";
import { encodedReportPayloadSchema } from "./schemas";

const MAX_PAYLOAD_SIZE = 32768;

export function encodePayload(payload: EncodedReportPayload): string {
  const json = JSON.stringify(payload);

  if (json.length > MAX_PAYLOAD_SIZE) {
    throw new Error("Payload exceeds maximum size");
  }

  return Buffer.from(json, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export function decodePayload(encoded: string): EncodedReportPayload {
  if (!encoded || encoded.trim() === "") {
    throw new Error("Invalid report data");
  }

  let json: string;
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    json = Buffer.from(padded, "base64").toString("utf-8");
  } catch {
    throw new Error("Invalid report data");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Invalid report data");
  }

  const result = encodedReportPayloadSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("Invalid report data");
  }

  return result.data;
}

export function isValidPayload(data: unknown): data is EncodedReportPayload {
  return encodedReportPayloadSchema.safeParse(data).success;
}
