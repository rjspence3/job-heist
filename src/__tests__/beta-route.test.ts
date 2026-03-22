/**
 * @jest-environment node
 */
import { POST } from "@/app/api/beta/route";

jest.mock("@/lib/cookie-sign", () => ({
  signValue: jest.fn().mockResolvedValue("granted.mocksig"),
}));

function createRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/beta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/beta", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, BETA_CODE: "heist2026" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns 500 when BETA_CODE is not configured", async () => {
    delete process.env.BETA_CODE;
    const response = await POST(createRequest({ code: "anything" }));
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("Beta access not configured");
  });

  it("returns 401 for wrong code", async () => {
    const response = await POST(createRequest({ code: "wrongcode" }));
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("Invalid code");
  });

  it("returns 401 for missing code field", async () => {
    const response = await POST(createRequest({}));
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("Invalid code");
  });

  it("returns 401 when code is not a string", async () => {
    const response = await POST(createRequest({ code: 12345 }));
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("Invalid code");
  });

  it("returns 200 and sets cookie for correct code", async () => {
    const response = await POST(createRequest({ code: "heist2026" }));
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.ok).toBe(true);
    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toContain("beta_access=");
  });

  it("accepts code case-insensitively", async () => {
    const response = await POST(createRequest({ code: "HEIST2026" }));
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.ok).toBe(true);
  });

  it("returns 400 for malformed JSON body", async () => {
    const request = new Request("http://localhost:3000/api/beta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Invalid request");
  });
});
