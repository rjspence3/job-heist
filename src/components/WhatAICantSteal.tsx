"use client";

import type { CantStealSection, SeriousReport } from "@/lib/types";

interface WhatAICantStealProps {
  cantSteal: CantStealSection;
  serious: SeriousReport;
  seriousMode: boolean;
}

export default function WhatAICantSteal({
  cantSteal,
  serious,
  seriousMode,
}: WhatAICantStealProps) {
  if (seriousMode) {
    return (
      <section className="bg-smoke border border-fog rounded-lg p-6">
        <div className="flex items-baseline gap-3 mb-6">
          <h2 className="text-2xl font-mono text-gold">ACTION PLAN</h2>
          <span className="text-sm text-muted font-mono">/ STRATEGIC PRIORITIES</span>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-mono text-gold mb-4">TOP OPPORTUNITIES</h3>
          <div className="space-y-3">
            {serious.opportunities.map((opp, idx) => (
              <div key={idx} className="border-l-2 border-gold pl-4">
                <div className="flex items-baseline gap-2 mb-1">
                  <h4 className="text-light font-medium">{opp.area}</h4>
                  <span className="text-xs font-mono text-muted">
                    Impact: {opp.impact.toUpperCase()} / Effort: {opp.effort.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-muted">{opp.action}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-mono text-gold mb-4">PRIORITY MATRIX</h3>
          <div className="grid grid-cols-2 gap-4">
            {["quick_win", "strategic", "fill_in", "deprioritize"].map((quad) => {
              const items = serious.priorityMatrix.filter(
                (item) => item.quadrant === quad
              );
              const labels = {
                quick_win: "Quick Wins",
                strategic: "Strategic",
                fill_in: "Fill-In",
                deprioritize: "Deprioritize",
              };
              return (
                <div key={quad} className="bg-charcoal p-3 rounded">
                  <h4 className="text-xs font-mono text-gold mb-2">
                    {labels[quad as keyof typeof labels]}
                  </h4>
                  <ul className="space-y-1">
                    {items.map((item, idx) => (
                      <li key={idx} className="text-xs text-light">
                        • {item.action}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-charcoal p-4 rounded">
          <h3 className="text-sm font-mono text-gold mb-2">EXECUTIVE SUMMARY</h3>
          <p className="text-sm text-light leading-relaxed">
            {serious.executiveSummary}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-smoke border border-fog rounded-lg p-6">
      <div className="flex items-baseline gap-3 mb-6">
        <h2 className="text-2xl font-mono text-gold">{cantSteal.headline}</h2>
        <span className="text-sm text-muted font-mono">/ THE HUMAN ELEMENT</span>
      </div>

      <div className="space-y-6 mb-6">
        {cantSteal.items.map((item, idx) => (
          <div key={idx}>
            <h3 className="text-light font-mono text-lg mb-2">{item.title}</h3>
            <p className="text-muted text-sm leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-fog pt-4">
        <p className="text-light italic">{cantSteal.closingLine}</p>
      </div>
    </section>
  );
}
