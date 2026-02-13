import { clampScore, calculateOverallScore, validateScores, BASE_SCORES } from "@/lib/scoring";
import type { HeistReport, ThreatBreakdownEntry } from "@/lib/types";

describe("scoring", () => {
  describe("BASE_SCORES", () => {
    it("should have scores for all task categories", () => {
      expect(BASE_SCORES.data_entry).toBe(87.5);
      expect(BASE_SCORES.communication).toBe(55);
      expect(BASE_SCORES.analysis).toBe(65);
      expect(BASE_SCORES.creative).toBe(30);
      expect(BASE_SCORES.relationship).toBe(20);
      expect(BASE_SCORES.physical).toBe(12.5);
      expect(BASE_SCORES.decision_making).toBe(42.5);
    });
  });

  describe("clampScore", () => {
    it("should return the score if within 0-100", () => {
      expect(clampScore(50)).toBe(50);
      expect(clampScore(0)).toBe(0);
      expect(clampScore(100)).toBe(100);
    });

    it("should clamp scores above 100", () => {
      expect(clampScore(150)).toBe(100);
      expect(clampScore(101)).toBe(100);
    });

    it("should clamp scores below 0", () => {
      expect(clampScore(-10)).toBe(0);
      expect(clampScore(-1)).toBe(0);
    });

    it("should round floats", () => {
      expect(clampScore(45.4)).toBe(45);
      expect(clampScore(45.6)).toBe(46);
    });
  });

  describe("calculateOverallScore", () => {
    it("should calculate weighted average", () => {
      const breakdown: ThreatBreakdownEntry[] = [
        {
          category: "data_entry",
          label: "Data Entry",
          percentage: 80,
          hoursAtRisk: 10,
          rationale: "High automation",
        },
        {
          category: "creative",
          label: "Creative",
          percentage: 20,
          hoursAtRisk: 10,
          rationale: "Low automation",
        },
      ];

      const result = calculateOverallScore(breakdown);
      expect(result).toBe(50);
    });

    it("should handle single category", () => {
      const breakdown: ThreatBreakdownEntry[] = [
        {
          category: "analysis",
          label: "Analysis",
          percentage: 65,
          hoursAtRisk: 40,
          rationale: "Moderate automation",
        },
      ];

      const result = calculateOverallScore(breakdown);
      expect(result).toBe(65);
    });

    it("should return 0 for empty array", () => {
      expect(calculateOverallScore([])).toBe(0);
    });

    it("should return 0 when total hours is 0", () => {
      const breakdown: ThreatBreakdownEntry[] = [
        {
          category: "data_entry",
          label: "Data Entry",
          percentage: 80,
          hoursAtRisk: 0,
          rationale: "No hours",
        },
      ];

      expect(calculateOverallScore(breakdown)).toBe(0);
    });
  });

  describe("validateScores", () => {
    it("should clamp percentages and recalculate overall", () => {
      const report: HeistReport = {
        targetProfile: {
          codename: "Test",
          summary: "Test",
          vulnerabilities: [],
          assets: [],
        },
        heistPlan: [],
        threatLevel: {
          overallScore: 200,
          breakdown: [
            {
              category: "data_entry",
              label: "Data Entry",
              percentage: 150,
              hoursAtRisk: 20,
              rationale: "Test",
            },
            {
              category: "creative",
              label: "Creative",
              percentage: -10,
              hoursAtRisk: 20,
              rationale: "Test",
            },
          ],
          verdict: "Test",
        },
        cantSteal: {
          headline: "Test",
          items: [],
          closingLine: "Test",
        },
        serious: {
          leverageScore: 0,
          opportunities: [],
          priorityMatrix: [],
          executiveSummary: "Test",
        },
      };

      const validated = validateScores(report);

      expect(validated.threatLevel.breakdown[0].percentage).toBe(100);
      expect(validated.threatLevel.breakdown[1].percentage).toBe(0);
      expect(validated.threatLevel.overallScore).toBe(50);
      expect(validated.serious.leverageScore).toBe(50);
    });
  });
});
