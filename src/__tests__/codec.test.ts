import { encodePayload, decodePayload, isValidPayload } from "@/lib/codec";
import type { EncodedReportPayload, InterviewData, HeistReport } from "@/lib/types";

const mockInterviewData: InterviewData = {
  jobTitle: "Software Engineer",
  industry: "Technology",
  dailyTasks: [
    { task: "Write code", category: "creative", hoursPerWeek: 20 },
    { task: "Review PRs", category: "analysis", hoursPerWeek: 10 },
  ],
  toolsUsed: ["VS Code", "Git"],
  decisionTypes: ["Technical architecture", "Code review"],
  humanInteractions: ["Team meetings", "1:1s"],
  creativeElements: ["System design"],
  painPoints: ["Too many meetings"],
  uniqueContext: "Fast-paced startup",
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
      title: "Infiltrate the codebase",
      description: "Use AI to write code",
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
        rationale: "AI struggles with novel problems",
      },
    ],
    verdict: "Moderate threat",
  },
  cantSteal: {
    headline: "What the machines can't take",
    items: [{ title: "Mentorship", description: "Teaching juniors" }],
    closingLine: "Stay human",
  },
  serious: {
    leverageScore: 55,
    opportunities: [
      {
        area: "Code generation",
        action: "Use AI assistants",
        impact: "high",
        effort: "low",
      },
    ],
    priorityMatrix: [
      { action: "Adopt AI tools", quadrant: "quick_win" },
    ],
    executiveSummary: "Leverage AI for routine tasks",
  },
};

describe("codec", () => {
  describe("encodePayload and decodePayload", () => {
    it("should round-trip encode and decode", () => {
      const payload: EncodedReportPayload = {
        version: 1,
        data: mockInterviewData,
        report: mockReport,
      };

      const encoded = encodePayload(payload);
      const decoded = decodePayload(encoded);

      expect(decoded).toEqual(payload);
    });

    it("should throw on empty string", () => {
      expect(() => decodePayload("")).toThrow("Invalid report data");
    });

    it("should throw on invalid base64", () => {
      expect(() => decodePayload("not-valid-base64!!!")).toThrow("Invalid report data");
    });

    it("should throw on valid base64 but invalid JSON", () => {
      const invalidBase64 = Buffer.from("not json", "utf-8").toString("base64");
      expect(() => decodePayload(invalidBase64)).toThrow("Invalid report data");
    });

    it("should throw on wrong version", () => {
      const wrongVersion = {
        version: 2,
        data: mockInterviewData,
        report: mockReport,
      };
      const encoded = Buffer.from(JSON.stringify(wrongVersion), "utf-8").toString("base64");
      expect(() => decodePayload(encoded)).toThrow("Invalid report data");
    });

    it("should throw on oversized payload", () => {
      const hugeData = {
        version: 1,
        data: {
          ...mockInterviewData,
          uniqueContext: "x".repeat(10000),
        },
        report: mockReport,
      };

      expect(() => encodePayload(hugeData as EncodedReportPayload)).toThrow(
        "Payload exceeds maximum size"
      );
    });
  });

  describe("isValidPayload", () => {
    it("should return true for correct shape", () => {
      const payload: EncodedReportPayload = {
        version: 1,
        data: mockInterviewData,
        report: mockReport,
      };
      expect(isValidPayload(payload)).toBe(true);
    });

    it("should return false for missing version", () => {
      const payload = {
        data: mockInterviewData,
        report: mockReport,
      };
      expect(isValidPayload(payload)).toBe(false);
    });

    it("should return false for null", () => {
      expect(isValidPayload(null)).toBe(false);
    });

    it("should return false for string", () => {
      expect(isValidPayload("not an object")).toBe(false);
    });
  });
});
