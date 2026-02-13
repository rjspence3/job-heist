"use client";

import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-charcoal">
      <header className="bg-smoke border-b border-fog p-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-gold font-mono hover:opacity-80 transition-opacity">
            AI JOB HEIST PLANNER
          </Link>
          <Link href="/terms" className="text-muted text-sm hover:text-light transition-colors">
            Terms of Service
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 text-light">
        <h1 className="text-2xl font-mono text-gold mb-6">Privacy Policy</h1>
        <p className="text-muted text-sm mb-8">Last updated: February 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-light/90">
          <section>
            <h2 className="text-lg font-mono text-gold mb-3">What this is</h2>
            <p>
              AI Job Heist Planner is a <strong>parody and entertainment tool</strong>. It
              uses comedic framing (heist movie tropes) to explore how AI intersects with
              your work. It is not a career assessment, employment evaluation, or
              professional advisory service. See our{" "}
              <Link href="/terms" className="text-gold underline">Terms of Service</Link>{" "}
              for full details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-mono text-gold mb-3">What we collect</h2>
            <p className="mb-3">During the interview, you voluntarily provide information about your work, including:</p>
            <ul className="list-disc list-inside space-y-1 text-muted ml-2">
              <li>Job title and industry</li>
              <li>Daily tasks and time allocation</li>
              <li>Tools you use</li>
              <li>Types of decisions you make</li>
              <li>Other professional context you choose to share</li>
            </ul>
            <p className="mt-3">
              We also collect your IP address for rate limiting purposes, and set a
              single functional cookie (<code className="text-gold/80">beta_access</code>) to
              manage access during the beta period.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-mono text-gold mb-3">How we use it</h2>
            <p>
              Your interview responses are sent to our server and forwarded to
              Anthropic&apos;s Claude API to generate your report. We do not store your
              interview data or generated reports on our servers. The application is
              stateless — once your report is generated, the data exists only in your
              browser URL.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-mono text-gold mb-3">Third-party processing</h2>
            <p>
              Your interview responses are processed by <strong>Anthropic</strong> (the
              company behind Claude) via their API. Anthropic&apos;s handling of API data is
              governed by their own privacy policy and data retention terms. We encourage
              you to review{" "}
              <a
                href="https://www.anthropic.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold underline"
              >
                Anthropic&apos;s Privacy Policy
              </a>{" "}
              for details on how they handle data submitted through their API.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-mono text-gold mb-3">Cookies</h2>
            <p>
              We use a single functional cookie (<code className="text-gold/80">beta_access</code>)
              to remember your beta access status. This cookie is httpOnly, cryptographically
              signed, and expires after 30 days. We do not use analytics, tracking, or
              advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-mono text-gold mb-3">Data retention</h2>
            <p>
              We do not store your interview data or reports. Your report is encoded in
              the page URL and exists only in your browser. If you close the tab or clear
              the URL, the data is gone. IP addresses used for rate limiting are held in
              memory only and discarded when the server restarts.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-mono text-gold mb-3">Your rights</h2>
            <p>
              Depending on your jurisdiction, you may have the right to access, correct,
              or delete personal data we hold about you. Because we do not persistently
              store your data, there is typically nothing to delete. If you have questions
              or concerns about your data, contact us at the address below.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-mono text-gold mb-3">Children</h2>
            <p>
              This service is not intended for anyone under the age of 13. We do not
              knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-mono text-gold mb-3">Contact</h2>
            <p>
              For privacy-related questions or requests, contact us at:{" "}
              <span className="text-gold">[your-email@example.com]</span>
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-fog p-6 mt-12">
        <div className="max-w-3xl mx-auto flex gap-4 text-xs text-muted">
          <Link href="/privacy" className="hover:text-light transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-light transition-colors">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
