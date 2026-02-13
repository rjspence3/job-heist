import { checkRateLimit, _resetStore } from "@/lib/rate-limit";

describe("rate-limit", () => {
  beforeEach(() => {
    _resetStore();
  });

  it("should allow requests within the limit", () => {
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit("test-key", {
        windowMs: 60_000,
        maxRequests: 5,
      });
      expect(result.allowed).toBe(true);
    }
  });

  it("should block requests over the limit", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("test-key", { windowMs: 60_000, maxRequests: 5 });
    }

    const result = checkRateLimit("test-key", {
      windowMs: 60_000,
      maxRequests: 5,
    });
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.retryAfterMs).toBeGreaterThan(0);
    }
  });

  it("should track separate keys independently", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("key-a", { windowMs: 60_000, maxRequests: 5 });
    }

    const resultA = checkRateLimit("key-a", {
      windowMs: 60_000,
      maxRequests: 5,
    });
    expect(resultA.allowed).toBe(false);

    const resultB = checkRateLimit("key-b", {
      windowMs: 60_000,
      maxRequests: 5,
    });
    expect(resultB.allowed).toBe(true);
  });
});
