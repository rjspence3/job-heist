import type { EncodedReportPayload } from "./types";
import { encodedReportPayloadSchema } from "./schemas";

const MAX_PAYLOAD_SIZE = 32768;

export function encodePayload(payload: EncodedReportPayload): string {
  const json = JSON.stringify(payload);

  if (json.length > MAX_PAYLOAD_SIZE) {
    throw new Error("Payload exceeds maximum size");
  }

  return Buffer.from(json, "utf-8").toString("base64url");
}

export function decodePayload(encoded: string): EncodedReportPayload {
  if (!encoded || encoded.trim() === "") {
    throw new Error("Invalid report data");
  }

  let json: string;
  try {
    json = Buffer.from(encoded, "base64url").toString("utf-8");
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
