import { POST } from "@/app/api/report/route";
import * as claude from "@/lib/claude";
import * as rateLimit from "@/lib/rate-limit";
import type { InterviewData, HeistReport } from "@/lib/types";

jest.mock("@/lib/claude");
jest.mock("@/lib/rate-limit");

const mockGenerateReport = claude.generateReport as jest.MockedFunction<
  typeof claude.generateReport
>;
const mockCheckRateLimit = rateLimit.checkRateLimit as jest.MockedFunction<typeof rateLimit.checkRateLimit>;

function createMockRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockInterviewData: InterviewData = {
  jobTitle: "Software Engineer",
  industry: "Technology",
  dailyTasks: [
    { task: "Write code", category: "creative", hoursPerWeek: 20 },
  ],
  toolsUsed: ["VS Code"],
  decisionTypes: ["Technical"],
  humanInteractions: ["Meetings"],
  creativeElements: ["Design"],
  painPoints: ["Bugs"],
  uniqueContext: "Startup",
};

const mockReport: HeistReport = {
  targetProfile: {
    codename: "The Developer",
    summary: "Codes all day",
    vulnerabilities: ["Repetitive tasks"],
    assets: ["Technical expertise"],
  },
  heistPlan: [
    {
      phase: 1,
      title: "Infiltrate",
      description: "Replace coding tasks",
      aiTool: "GitHub Copilot",
      timeToReplace: "6 months",
      difficulty: "moderate",
    },
  ],
  threatLevel: {
    overallScore: 45,
    breakdown: [
      {
        category: "creative",
        label: "Creative Work",
        percentage: 30,
        hoursAtRisk: 20,
        rationale: "AI struggles",
      },
    ],
    verdict: "Moderate threat",
  },
  cantSteal: {
    headline: "What AI can't steal",
    items: [{ title: "Mentorship", description: "Teaching" }],
    closingLine: "Stay human",
  },
  serious: {
    leverageScore: 55,
    opportunities: [
      {
        area: "Code generation",
        action: "Use AI",
        impact: "high",
        effort: "low",
      },
    ],
    priorityMatrix: [{ action: "Adopt AI", quadrant: "quick_win" }],
    executiveSummary: "Leverage AI",
  },
};

describe("/api/report", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckRateLimit.mockReturnValue({ allowed: true });
  });

  it("should return 400 when interview data is missing", async () => {
    const request = createMockRequest({});
    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Invalid request");
  });

  it("should return 400 when tasks are empty", async () => {
    const request = createMockRequest({
      interviewData: { ...mockInterviewData, dailyTasks: [] },
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Invalid request");
  });

  it("should return report for valid request", async () => {
    mockGenerateReport.mockResolvedValue(mockReport);

    const request = createMockRequest({ interviewData: mockInterviewData });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.targetProfile).toBeDefined();
    expect(json.heistPlan).toBeDefined();
  });

  it("should validate scores in response", async () => {
    const invalidReport = {
      ...mockReport,
      threatLevel: {
        ...mockReport.threatLevel,
        overallScore: 200,
        breakdown: [
          {
            category: "creative" as const,
            label: "Creative",
            percentage: 150,
            hoursAtRisk: 20,
            rationale: "Test",
          },
        ],
      },
    };

    mockGenerateReport.mockResolvedValue(invalidReport);

    const request = createMockRequest({ interviewData: mockInterviewData });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.threatLevel.breakdown[0].percentage).toBeLessThanOrEqual(100);
    expect(json.threatLevel.overallScore).toBeLessThanOrEqual(100);
  });

  it("should return 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, retryAfterMs: 45000 });

    const request = createMockRequest({ interviewData: mockInterviewData });
    const response = await POST(request);
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("45");
  });
});
