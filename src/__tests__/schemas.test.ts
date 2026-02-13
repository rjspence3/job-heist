import {
  chatRequestSchema,
  interviewDataSchema,
  reportRequestSchema,
} from "@/lib/schemas";

describe("schemas", () => {
  describe("chatRequestSchema", () => {
    it("should accept valid chat request", () => {
      const result = chatRequestSchema.safeParse({
        messages: [{ role: "user", content: "Hello" }],
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty messages array", () => {
      const result = chatRequestSchema.safeParse({ messages: [] });
      expect(result.success).toBe(false);
    });

    it("should reject missing messages", () => {
      const result = chatRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should reject invalid role", () => {
      const result = chatRequestSchema.safeParse({
        messages: [{ role: "system", content: "Hello" }],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("interviewDataSchema", () => {
    const validData = {
      jobTitle: "Engineer",
      industry: "Tech",
      dailyTasks: [{ task: "Code", category: "creative", hoursPerWeek: 20 }],
      toolsUsed: ["VS Code"],
      decisionTypes: ["Technical"],
      humanInteractions: ["Meetings"],
      creativeElements: ["Design"],
      painPoints: ["Bugs"],
      uniqueContext: "Startup",
    };

    it("should accept valid interview data", () => {
      const result = interviewDataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty dailyTasks", () => {
      const result = interviewDataSchema.safeParse({
        ...validData,
        dailyTasks: [],
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing jobTitle", () => {
      const { jobTitle, ...rest } = validData;
      const result = interviewDataSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("should reject invalid task category", () => {
      const result = interviewDataSchema.safeParse({
        ...validData,
        dailyTasks: [{ task: "Code", category: "invalid", hoursPerWeek: 20 }],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("reportRequestSchema", () => {
    it("should accept valid report request", () => {
      const result = reportRequestSchema.safeParse({
        interviewData: {
          jobTitle: "Engineer",
          industry: "Tech",
          dailyTasks: [
            { task: "Code", category: "creative", hoursPerWeek: 20 },
          ],
          toolsUsed: ["VS Code"],
          decisionTypes: ["Technical"],
          humanInteractions: ["Meetings"],
          creativeElements: ["Design"],
          painPoints: ["Bugs"],
          uniqueContext: "Startup",
        },
      });
      expect(result.success).toBe(true);
    });

    it("should reject missing interviewData", () => {
      const result = reportRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
