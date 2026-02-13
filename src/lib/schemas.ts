import { z } from "zod";

const taskCategorySchema = z.enum([
  "data_entry",
  "communication",
  "analysis",
  "creative",
  "relationship",
  "physical",
  "decision_making",
]);

const taskEntrySchema = z.object({
  task: z.string(),
  category: taskCategorySchema,
  hoursPerWeek: z.number(),
});

export const interviewDataSchema = z.object({
  jobTitle: z.string(),
  industry: z.string(),
  dailyTasks: z.array(taskEntrySchema).min(1),
  toolsUsed: z.array(z.string()),
  decisionTypes: z.array(z.string()),
  humanInteractions: z.array(z.string()),
  creativeElements: z.array(z.string()),
  painPoints: z.array(z.string()),
  uniqueContext: z.string(),
});

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
});

export const reportRequestSchema = z.object({
  interviewData: interviewDataSchema,
});

const targetProfileSchema = z.object({
  codename: z.string(),
  summary: z.string(),
  vulnerabilities: z.array(z.string()),
  assets: z.array(z.string()),
});

const heistStepSchema = z.object({
  phase: z.number(),
  title: z.string(),
  description: z.string(),
  aiTool: z.string(),
  timeToReplace: z.string(),
  difficulty: z.enum(["trivial", "moderate", "hard", "impossible"]),
});

const threatBreakdownEntrySchema = z.object({
  category: taskCategorySchema,
  label: z.string(),
  percentage: z.number(),
  hoursAtRisk: z.number(),
  rationale: z.string(),
});

const threatAssessmentSchema = z.object({
  overallScore: z.number(),
  breakdown: z.array(threatBreakdownEntrySchema),
  verdict: z.string(),
});

const cantStealItemSchema = z.object({
  title: z.string(),
  description: z.string(),
});

const cantStealSectionSchema = z.object({
  headline: z.string(),
  items: z.array(cantStealItemSchema),
  closingLine: z.string(),
});

const seriousOpportunitySchema = z.object({
  area: z.string(),
  action: z.string(),
  impact: z.enum(["high", "medium", "low"]),
  effort: z.enum(["high", "medium", "low"]),
});

const priorityItemSchema = z.object({
  action: z.string(),
  quadrant: z.enum(["quick_win", "strategic", "fill_in", "deprioritize"]),
});

const seriousReportSchema = z.object({
  leverageScore: z.number(),
  opportunities: z.array(seriousOpportunitySchema),
  priorityMatrix: z.array(priorityItemSchema),
  executiveSummary: z.string(),
});

export const heistReportSchema = z.object({
  targetProfile: targetProfileSchema,
  heistPlan: z.array(heistStepSchema),
  threatLevel: threatAssessmentSchema,
  cantSteal: cantStealSectionSchema,
  serious: seriousReportSchema,
});

export const encodedReportPayloadSchema = z.object({
  version: z.literal(1),
  data: interviewDataSchema,
  report: heistReportSchema,
});
