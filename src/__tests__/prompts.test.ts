import { getInterviewSystemPrompt, getReportSystemPrompt, getReportUserMessage } from "@/lib/prompts";
import type { InterviewData } from "@/lib/types";

const mockInterviewData: InterviewData = {
  jobTitle: "Software Engineer",
  industry: "Technology",
  dailyTasks: [
    { task: "Write code", category: "creative", hoursPerWeek: 20 },
  ],
  toolsUsed: ["VS Code"],
  decisionTypes: ["Technical decisions"],
  humanInteractions: ["Team meetings"],
  creativeElements: ["System design"],
  painPoints: ["Too many meetings"],
  uniqueContext: "Startup environment",
};

describe("prompts", () => {
  describe("getInterviewSystemPrompt", () => {
    const prompt = getInterviewSystemPrompt();

    it("should contain persona", () => {
      expect(prompt).toContain("The Architect");
      expect(prompt).toContain("heist planner");
    });

    it("should contain terse answer handling", () => {
      expect(prompt).toContain("Handling Terse Answers");
      expect(prompt).toContain("I'm going to need more than that");
    });

    it("should contain jailbreak guard", () => {
      expect(prompt).toContain("Handling Jailbreak Attempts");
      expect(prompt).toContain("Nice try");
    });

    it("should contain completion marker", () => {
      expect(prompt).toContain(":::INTERVIEW_COMPLETE:::");
      expect(prompt).toContain(":::END_DATA:::");
    });

    it("should contain sensitive job handling", () => {
      expect(prompt).toContain("illegal");
      expect(prompt).toContain("professional standards");
    });

    it("should contain opening message", () => {
      expect(prompt).toContain("*adjusts blueprints*");
      expect(prompt).toContain("Either way, we end up in the same place");
    });

    it("should contain interview structure guidance", () => {
      expect(prompt).toContain("5-7 questions");
      expect(prompt).toContain("one at a time");
    });
  });

  describe("getReportSystemPrompt", () => {
    const prompt = getReportSystemPrompt(mockInterviewData);

    it("should contain JSON instruction", () => {
      expect(prompt).toContain("JSON");
      expect(prompt).toContain("HeistReport");
    });

    it("should contain scoring rubric", () => {
      expect(prompt).toContain("Scoring Rubric");
      expect(prompt).toContain("data_entry: 80-95%");
      expect(prompt).toContain("communication: 40-70%");
      expect(prompt).toContain("analysis: 50-80%");
      expect(prompt).toContain("creative: 15-45%");
      expect(prompt).toContain("relationship: 10-30%");
      expect(prompt).toContain("physical: 5-20%");
      expect(prompt).toContain("decision_making: 25-60%");
    });

    it("should contain tone guidelines", () => {
      expect(prompt).toContain("Heist sections");
      expect(prompt).toContain("Deadpan");
      expect(prompt).toContain("serious");
      expect(prompt).toContain("McKinsey");
    });

    it("should contain weighted average formula", () => {
      expect(prompt).toContain("weighted average");
      expect(prompt).toContain("overallScore");
    });

    it("should contain leverage score formula", () => {
      expect(prompt).toContain("leverageScore = 100 - overallScore");
    });
  });

  describe("getReportUserMessage", () => {
    it("should return JSON string of interview data", () => {
      const message = getReportUserMessage(mockInterviewData);
      expect(() => JSON.parse(message)).not.toThrow();

      const parsed = JSON.parse(message);
      expect(parsed.jobTitle).toBe("Software Engineer");
      expect(parsed.industry).toBe("Technology");
    });
  });
});
