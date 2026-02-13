export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
  interviewComplete: boolean;
  extractedData: InterviewData | null;
}

export interface InterviewData {
  jobTitle: string;
  industry: string;
  dailyTasks: TaskEntry[];
  toolsUsed: string[];
  decisionTypes: string[];
  humanInteractions: string[];
  creativeElements: string[];
  painPoints: string[];
  uniqueContext: string;
}

export interface TaskEntry {
  task: string;
  category: TaskCategory;
  hoursPerWeek: number;
}

export type TaskCategory =
  | "data_entry"
  | "communication"
  | "analysis"
  | "creative"
  | "relationship"
  | "physical"
  | "decision_making";

export interface ReportRequest {
  interviewData: InterviewData;
}

export interface HeistReport {
  targetProfile: TargetProfile;
  heistPlan: HeistStep[];
  threatLevel: ThreatAssessment;
  cantSteal: CantStealSection;
  serious: SeriousReport;
}

export interface TargetProfile {
  codename: string;
  summary: string;
  vulnerabilities: string[];
  assets: string[];
}

export interface HeistStep {
  phase: number;
  title: string;
  description: string;
  aiTool: string;
  timeToReplace: string;
  difficulty: "trivial" | "moderate" | "hard" | "impossible";
}

export interface ThreatAssessment {
  overallScore: number;
  breakdown: ThreatBreakdownEntry[];
  verdict: string;
}

export interface ThreatBreakdownEntry {
  category: TaskCategory;
  label: string;
  percentage: number;
  hoursAtRisk: number;
  rationale: string;
}

export interface CantStealSection {
  headline: string;
  items: CantStealItem[];
  closingLine: string;
}

export interface CantStealItem {
  title: string;
  description: string;
}

export interface SeriousReport {
  leverageScore: number;
  opportunities: SeriousOpportunity[];
  priorityMatrix: PriorityItem[];
  executiveSummary: string;
}

export interface SeriousOpportunity {
  area: string;
  action: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
}

export interface PriorityItem {
  action: string;
  quadrant: "quick_win" | "strategic" | "fill_in" | "deprioritize";
}

export interface EncodedReportPayload {
  version: 1;
  data: InterviewData;
  report: HeistReport;
}
