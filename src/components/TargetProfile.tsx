"use client";

import type { TargetProfile as TargetProfileType } from "@/lib/types";

interface TargetProfileProps {
  profile: TargetProfileType;
}

export default function TargetProfile({ profile }: TargetProfileProps) {
  return (
    <section className="bg-smoke border border-fog rounded-lg p-6">
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="text-2xl font-mono text-gold">TARGET PROFILE</h2>
        <span className="text-sm text-muted font-mono">/ CLASSIFIED</span>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-mono text-accent mb-2">
          CODENAME: {profile.codename}
        </h3>
        <p className="text-light leading-relaxed">{profile.summary}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-mono text-gold mb-3">VULNERABILITIES</h4>
          <ul className="space-y-2">
            {profile.vulnerabilities.map((vuln, idx) => (
              <li key={idx} className="text-light text-sm flex items-start">
                <span className="text-accent mr-2">▸</span>
                <span>{vuln}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-mono text-gold mb-3">ASSETS</h4>
          <ul className="space-y-2">
            {profile.assets.map((asset, idx) => (
              <li key={idx} className="text-light text-sm flex items-start">
                <span className="text-accent mr-2">▸</span>
                <span>{asset}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
