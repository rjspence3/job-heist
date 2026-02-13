import { POST } from "@/app/api/chat/route";
import * as claude from "@/lib/claude";
import * as rateLimit from "@/lib/rate-limit";

jest.mock("@/lib/claude");
jest.mock("@/lib/rate-limit");

const mockSendMessage = claude.sendMessage as jest.MockedFunction<typeof claude.sendMessage>;
const mockCheckRateLimit = rateLimit.checkRateLimit as jest.MockedFunction<typeof rateLimit.checkRateLimit>;

function createMockRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/chat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckRateLimit.mockReturnValue({ allowed: true });
  });

  it("should return 400 when messages field is missing", async () => {
    const request = createMockRequest({});
    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Invalid request");
  });

  it("should return 400 when messages array is empty", async () => {
    const request = createMockRequest({ messages: [] });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Invalid request");
  });

  it("should return 400 when message has invalid role", async () => {
    const request = createMockRequest({
      messages: [{ role: "invalid", content: "test" }],
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Invalid request");
  });

  it("should truncate long messages", async () => {
    mockSendMessage.mockResolvedValue("Test reply");

    const longMessage = "x".repeat(6000);
    const request = createMockRequest({
      messages: [{ role: "user", content: longMessage }],
    });

    await POST(request);

    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.any(String),
      [{ role: "user", content: "x".repeat(5000) }],
      512
    );
  });

  it("should return reply for valid request", async () => {
    mockSendMessage.mockResolvedValue("Test reply");

    const request = createMockRequest({
      messages: [{ role: "user", content: "Hello" }],
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.reply).toBe("Test reply");
    expect(json.interviewComplete).toBe(false);
    expect(json.extractedData).toBeNull();
  });

  it("should detect interview complete", async () => {
    const mockData = {
      jobTitle: "Engineer",
      industry: "Tech",
      dailyTasks: [{ task: "Code", category: "creative", hoursPerWeek: 40 }],
      toolsUsed: ["VS Code"],
      decisionTypes: ["Tech"],
      humanInteractions: ["Meetings"],
      creativeElements: ["Design"],
      painPoints: ["Bugs"],
      uniqueContext: "Startup",
    };

    const mockReply = `Great, I have everything.

:::INTERVIEW_COMPLETE:::
${JSON.stringify(mockData)}
:::END_DATA:::`;

    mockSendMessage.mockResolvedValue(mockReply);

    const request = createMockRequest({
      messages: [{ role: "user", content: "Hello" }],
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.reply).toBe("Great, I have everything.");
    expect(json.interviewComplete).toBe(true);
    expect(json.extractedData).toEqual(mockData);
  });

  it("should return 500 on Claude error", async () => {
    mockSendMessage.mockRejectedValue(new Error("Claude API error"));

    const request = createMockRequest({
      messages: [{ role: "user", content: "Hello" }],
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toContain("Failed to process");
  });

  it("should return 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, retryAfterMs: 30000 });

    const request = createMockRequest({
      messages: [{ role: "user", content: "Hello" }],
    });

    const response = await POST(request);
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("30");
  });
});
