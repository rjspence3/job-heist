function getSecret(): string {
  const secret = process.env.BETA_SECRET;
  if (!secret) {
    throw new Error("BETA_SECRET environment variable is required");
  }
  return secret;
}

async function getKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

export async function signValue(value: string): Promise<string> {
  const secret = getSecret();
  const key = await getKey(secret);
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return `${value}.${toHex(signature)}`;
}

export async function verifySignedValue(
  signedValue: string
): Promise<string | null> {
  const dotIndex = signedValue.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const value = signedValue.substring(0, dotIndex);
  const providedSigHex = signedValue.substring(dotIndex + 1);

  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return null;
  }

  const key = await getKey(secret);
  const encoder = new TextEncoder();
  const expectedSig = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(value)
  );

  const expectedBytes = new Uint8Array(expectedSig);
  let providedBytes: Uint8Array;
  try {
    providedBytes = fromHex(providedSigHex);
  } catch {
    return null;
  }

  if (constantTimeEqual(expectedBytes, providedBytes)) {
    return value;
  }

  return null;
}
