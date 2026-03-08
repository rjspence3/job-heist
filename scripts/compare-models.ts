/**
 * Compare report quality between Sonnet and Haiku.
 * Run with: npx tsx scripts/compare-models.ts
 * Requires ANTHROPIC_API_KEY in environment.
 */

import "../src/lib/claude"; // ensure shims loaded
import Anthropic from "@anthropic-ai/sdk";
import { getReportSystemPrompt, getReportUserMessage } from "../src/lib/prompts";
import { heistReportSchema } from "../src/lib/schemas";
import type { InterviewData, HeistReport } from "../src/lib/types";

const SAMPLE: InterviewData = {
  jobTitle: "Marketing Manager",
  industry: "SaaS / B2B Software",
  dailyTasks: [
    { task: "Write and schedule email campaigns in HubSpot", category: "communication", hoursPerWeek: 6 },
    { task: "Analyse campaign performance in Google Analytics and Looker", category: "analysis", hoursPerWeek: 5 },
    { task: "Write blog posts and landing page copy", category: "creative", hoursPerWeek: 6 },
    { task: "Update spreadsheet reports for leadership", category: "data_entry", hoursPerWeek: 4 },
    { task: "Run weekly sync with sales team to align on leads", category: "relationship", hoursPerWeek: 3 },
    { task: "Decide on budget allocation across paid channels", category: "decision_making", hoursPerWeek: 3 },
    { task: "Brief and review design agency for ad creatives", category: "creative", hoursPerWeek: 3 },
  ],
  toolsUsed: ["HubSpot", "Google Analytics", "Looker", "Canva", "Slack", "Notion", "Google Ads", "LinkedIn Ads"],
  decisionTypes: [
    "Which channels to invest more budget in based on CAC trends",
    "Whether to kill underperforming campaigns mid-flight",
    "Tone and messaging decisions for brand voice",
  ],
  humanInteractions: [
    "Weekly pipeline review with sales team",
    "Monthly board reporting",
    "Day-to-day briefing of design contractors",
    "Customer interviews for case studies",
  ],
  creativeElements: [
    "Crafting campaign narratives that resonate with specific personas",
    "Finding angles that differentiate from competitors without being generic",
    "Writing copy that balances SEO requirements with human readability",
  ],
  painPoints: [
    "Compiling the weekly performance spreadsheet from five different sources",
    "Writing first drafts of routine nurture emails",
    "Resizing ad creatives for different placements",
  ],
  uniqueContext:
    "Works at a 60-person Series B SaaS company where she is the only marketer — so she does everything from strategy to pixel-pushing. Close relationship with the CEO means brand decisions often go through her gut feel rather than process.",
};

const MODELS = [
  { id: "claude-sonnet-4-5-20250929", label: "Sonnet 4.5" },
  { id: "claude-haiku-4-5-20251001", label: "Haiku 4.5" },
];

async function runModel(
  client: Anthropic,
  modelId: string
): Promise<{ report: HeistReport; inputTokens: number; outputTokens: number; elapsedMs: number }> {
  const systemPrompt = getReportSystemPrompt(SAMPLE);
  const userMessage = getReportUserMessage(SAMPLE);

  const start = Date.now();
  const response = await client.messages.create(
    {
      model: modelId,
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    },
    { timeout: 120_000 }
  );
  const elapsedMs = Date.now() - start;

  if (response.stop_reason === "max_tokens") {
    console.warn(`  [WARN] ${modelId} hit max_tokens — output was truncated`);
  }

  const firstBlock = response.content[0];
  if (!firstBlock || firstBlock.type !== "text") {
    throw new Error(`Unexpected response format from ${modelId}`);
  }

  let jsonText = firstBlock.text.trim();
  if (jsonText.startsWith("```")) {
    const newline = jsonText.indexOf("\n");
    if (newline !== -1) jsonText = jsonText.slice(newline + 1);
  }
  if (jsonText.endsWith("```")) {
    jsonText = jsonText.slice(0, jsonText.lastIndexOf("```")).trim();
  }

  const parsed = JSON.parse(jsonText);
  const result = heistReportSchema.safeParse(parsed);
  if (!result.success) {
    console.error("Schema validation failed:", result.error.issues);
    throw new Error(`Schema validation failed for ${modelId}`);
  }

  return {
    report: result.data,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    elapsedMs,
  };
}

function printReport(label: string, report: HeistReport, inputTokens: number, outputTokens: number, elapsedMs: number) {
  const divider = "─".repeat(70);
  console.log(`\n${"═".repeat(70)}`);
  console.log(`  ${label}`);
  console.log(`  ${elapsedMs / 1000}s  |  ${inputTokens} in / ${outputTokens} out tokens`);
  console.log(`${"═".repeat(70)}`);

  console.log(`\n[Target Profile]`);
  console.log(`  Codename : ${report.targetProfile.codename}`);
  console.log(`  Summary  : ${report.targetProfile.summary}`);
  console.log(`  Vulns    :`);
  report.targetProfile.vulnerabilities.forEach((v) => console.log(`    • ${v}`));
  console.log(`  Assets   :`);
  report.targetProfile.assets.forEach((a) => console.log(`    • ${a}`));

  console.log(`\n[Heist Plan] (${report.heistPlan.length} phases)`);
  report.heistPlan.forEach((step) => {
    console.log(`  Phase ${step.phase}: ${step.title} [${step.difficulty}] — ${step.timeToReplace}`);
    console.log(`    ${step.description}`);
    console.log(`    Tool: ${step.aiTool}`);
  });

  console.log(`\n[Threat Level]`);
  console.log(`  Overall : ${report.threatLevel.overallScore}%`);
  console.log(`  Verdict : ${report.threatLevel.verdict}`);
  report.threatLevel.breakdown.forEach((b) => {
    console.log(`  ${b.label.padEnd(20)} ${String(b.percentage).padStart(3)}%  (${b.hoursAtRisk}h/wk)  ${b.rationale}`);
  });

  console.log(`\n[Can't Steal]`);
  console.log(`  ${report.cantSteal.headline}`);
  report.cantSteal.items.forEach((item) => {
    console.log(`  • ${item.title}: ${item.description}`);
  });
  console.log(`  Closing: ${report.cantSteal.closingLine}`);

  console.log(`\n[Serious Mode]`);
  console.log(`  Leverage Score : ${report.serious.leverageScore}`);
  console.log(`  Summary        : ${report.serious.executiveSummary}`);
  console.log(`  Opportunities  :`);
  report.serious.opportunities.forEach((o) => {
    console.log(`    • [${o.impact} impact / ${o.effort} effort] ${o.area}: ${o.action}`);
  });
  console.log(`  Priority Matrix:`);
  report.serious.priorityMatrix.forEach((p) => {
    console.log(`    • [${p.quadrant}] ${p.action}`);
  });

  console.log(`\n${divider}`);
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY not set");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  for (const model of MODELS) {
    console.log(`\nRunning ${model.label} (${model.id})...`);
    try {
      const result = await runModel(client, model.id);
      printReport(model.label, result.report, result.inputTokens, result.outputTokens, result.elapsedMs);
    } catch (err) {
      console.error(`FAILED for ${model.label}:`, err instanceof Error ? err.message : err);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
