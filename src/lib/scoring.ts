import type { TaskCategory, HeistReport, ThreatBreakdownEntry } from "./types";

export const BASE_SCORES: Record<TaskCategory, number> = {
  data_entry: 87.5,
  communication: 55,
  analysis: 65,
  creative: 30,
  relationship: 20,
  physical: 12.5,
  decision_making: 42.5,
};

export function clampScore(score: number): number {
  return Math.round(Math.max(0, Math.min(100, score)));
}

export function calculateOverallScore(breakdown: ThreatBreakdownEntry[]): number {
  if (breakdown.length === 0) {
    return 0;
  }

  const totalHours = breakdown.reduce((sum, entry) => sum + entry.hoursAtRisk, 0);

  if (totalHours === 0) {
    return 0;
  }

  const weightedSum = breakdown.reduce(
    (sum, entry) => sum + entry.percentage * entry.hoursAtRisk,
    0
  );

  return Math.round(weightedSum / totalHours);
}

export function validateScores(report: HeistReport): HeistReport {
  const clampedBreakdown = report.threatLevel.breakdown.map((entry) => ({
    ...entry,
    percentage: clampScore(entry.percentage),
  }));

  const recalculatedOverall = calculateOverallScore(clampedBreakdown);

  return {
    ...report,
    threatLevel: {
      ...report.threatLevel,
      breakdown: clampedBreakdown,
      overallScore: recalculatedOverall,
    },
    serious: {
      ...report.serious,
      leverageScore: clampScore(100 - recalculatedOverall),
    },
  };
}
