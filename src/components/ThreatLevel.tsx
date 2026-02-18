"use client";

import { useState, useEffect } from "react";
import type { ThreatAssessment } from "@/lib/types";

interface ThreatLevelProps {
  threat: ThreatAssessment;
  seriousMode: boolean;
}

// Section reveal delay in ms — must stay in sync with animate-reveal-4 in globals.css
const SECTION_REVEAL_DELAY_MS = 1100;
const COUNT_UP_DURATION_MS = 1500;

export default function ThreatLevel({ threat, seriousMode }: ThreatLevelProps) {
  const targetScore = seriousMode ? 100 - threat.overallScore : threat.overallScore;
  const [displayedScore, setDisplayedScore] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const startCountUp = () => {
      const tick = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / COUNT_UP_DURATION_MS, 1);
        // Ease out: fast start, slow finish
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayedScore(Math.round(eased * targetScore));
        if (progress < 1) {
          animationFrame = requestAnimationFrame(tick);
        }
      };
      animationFrame = requestAnimationFrame(tick);
    };

    const timer = setTimeout(startCountUp, SECTION_REVEAL_DELAY_MS);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animationFrame);
    };
  }, [targetScore]);

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
            className={`text-5xl font-mono ${getScoreColor(targetScore)}`}
          >
            {displayedScore}%
          </span>
        </div>
        <p className="text-light text-sm">{threat.verdict}</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-mono text-gold mb-3">
          {seriousMode ? "TASK LEVERAGE BREAKDOWN" : "VULNERABILITY BREAKDOWN"}
        </h3>
        {threat.breakdown.map((entry, index) => (
          <div key={entry.category}>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-light text-sm">{entry.label}</span>
              <span className="text-muted text-sm font-mono">
                {entry.percentage}% ({entry.hoursAtRisk}h/week)
              </span>
            </div>
            <div className="w-full bg-fog rounded-full h-2 mb-1">
              <div
                className={`h-2 rounded-full ${getBarColor(entry.percentage)}`}
                style={{
                  "--bar-width": `${entry.percentage}%`,
                  animation: `fillBar 0.8s ease-out ${SECTION_REVEAL_DELAY_MS + 200 + index * 150}ms forwards`,
                  width: 0,
                } as React.CSSProperties}
              />
            </div>
            <p className="text-muted text-xs mb-3">{entry.rationale}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
