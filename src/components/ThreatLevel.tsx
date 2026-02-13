"use client";

import type { ThreatAssessment } from "@/lib/types";

interface ThreatLevelProps {
  threat: ThreatAssessment;
  seriousMode: boolean;
}

export default function ThreatLevel({ threat, seriousMode }: ThreatLevelProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-accent";
    if (score >= 40) return "text-yellow-400";
    return "text-green-400";
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 70) return "bg-accent";
    if (percentage >= 40) return "bg-yellow-400";
    return "bg-green-400";
  };

  return (
    <section className="bg-smoke border border-fog rounded-lg p-6">
      <div className="flex items-baseline gap-3 mb-6">
        <h2 className="text-2xl font-mono text-gold">
          {seriousMode ? "LEVERAGE ASSESSMENT" : "THREAT LEVEL"}
        </h2>
        <span className="text-sm text-muted font-mono">/ ANALYSIS</span>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-sm font-mono text-muted">
            {seriousMode ? "AI LEVERAGE SCORE:" : "OVERALL THREAT:"}
          </span>
          <span
            className={`text-5xl font-mono ${getScoreColor(
              seriousMode ? 100 - threat.overallScore : threat.overallScore
            )}`}
          >
            {seriousMode ? 100 - threat.overallScore : threat.overallScore}%
          </span>
        </div>
        <p className="text-light text-sm">{threat.verdict}</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-mono text-gold mb-3">
          {seriousMode ? "TASK LEVERAGE BREAKDOWN" : "VULNERABILITY BREAKDOWN"}
        </h3>
        {threat.breakdown.map((entry) => (
          <div key={entry.category}>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-light text-sm">{entry.label}</span>
              <span className="text-muted text-sm font-mono">
                {entry.percentage}% ({entry.hoursAtRisk}h/week)
              </span>
            </div>
            <div className="w-full bg-fog rounded-full h-2 mb-1">
              <div
                className={`h-2 rounded-full transition-all ${getBarColor(
                  entry.percentage
                )}`}
                style={{ width: `${entry.percentage}%` }}
              />
            </div>
            <p className="text-muted text-xs mb-3">{entry.rationale}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
