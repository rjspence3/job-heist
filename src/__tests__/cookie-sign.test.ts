/**
 * @jest-environment node
 */
import { signValue, verifySignedValue } from "@/lib/cookie-sign";

describe("cookie-sign", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, BETA_SECRET: "test-secret-key-1234567890abcdef" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should round-trip sign and verify", async () => {
    const signed = await signValue("granted");
    const verified = await verifySignedValue(signed);
    expect(verified).toBe("granted");
  });

  it("should reject tampered values", async () => {
    const signed = await signValue("granted");
    const tampered = signed.replace("granted", "admin");
    const verified = await verifySignedValue(tampered);
    expect(verified).toBeNull();
  });

  it("should reject unsigned values", async () => {
    const verified = await verifySignedValue("granted");
    expect(verified).toBeNull();
  });

  it("should throw without BETA_SECRET", async () => {
    delete process.env.BETA_SECRET;
    await expect(signValue("granted")).rejects.toThrow(
      "BETA_SECRET environment variable is required"
    );
  });
});
