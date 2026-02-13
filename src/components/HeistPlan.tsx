"use client";

import type { HeistStep } from "@/lib/types";

interface HeistPlanProps {
  steps: HeistStep[];
}

const difficultyColors = {
  trivial: "text-green-400",
  moderate: "text-yellow-400",
  hard: "text-orange-400",
  impossible: "text-accent",
};

export default function HeistPlan({ steps }: HeistPlanProps) {
  return (
    <section className="bg-smoke border border-fog rounded-lg p-6">
      <div className="flex items-baseline gap-3 mb-6">
        <h2 className="text-2xl font-mono text-gold">THE HEIST PLAN</h2>
        <span className="text-sm text-muted font-mono">/ OPERATION DETAILS</span>
      </div>

      <div className="space-y-6">
        {steps.map((step) => (
          <div
            key={step.phase}
            className="border-l-2 border-accent pl-4 pb-4 last:pb-0"
          >
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-accent font-mono text-lg">
                PHASE {step.phase}
              </span>
              <h3 className="text-light font-mono text-lg">{step.title}</h3>
            </div>

            <p className="text-light text-sm mb-3 leading-relaxed">
              {step.description}
            </p>

            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-muted font-mono">AI TOOL: </span>
                <span className="text-light">{step.aiTool}</span>
              </div>
              <div>
                <span className="text-muted font-mono">TIMELINE: </span>
                <span className="text-light">{step.timeToReplace}</span>
              </div>
              <div>
                <span className="text-muted font-mono">DIFFICULTY: </span>
                <span className={`font-mono ${difficultyColors[step.difficulty]}`}>
                  {step.difficulty.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
