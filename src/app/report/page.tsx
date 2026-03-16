"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import ReportView from "@/components/ReportView";
import { decodePayload } from "@/lib/codec";

function ReportContent() {
  const searchParams = useSearchParams();
  const encoded =
    searchParams.get("d") ?? sessionStorage.getItem("reportPayload");

  if (!encoded) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-mono text-accent mb-4">
            NO DATA FOUND
          </h1>
          <p className="text-muted">
            This page requires report data. Please start a new interview.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 px-6 py-2 bg-accent text-light rounded-lg hover:bg-opacity-90 transition-all font-mono"
          >
            START INTERVIEW
          </Link>
        </div>
      </div>
    );
  }

  try {
    const payload = decodePayload(encoded);
    return (
      <div className="flex flex-col min-h-screen">
        <ReportView interviewData={payload.data} report={payload.report} />

        {/* Post-result CTA */}
        <div className="bg-smoke border-t border-fog px-6 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl font-mono text-gold mb-3">Like what you see?</h2>
            <p className="text-muted text-sm leading-relaxed mb-6">
              This is one of several AI tools I&apos;ve built and actually use. If you&apos;re curious about
              the rest — or want to talk shop — check out my full portfolio.
            </p>
            <a
              href="https://nomouthlabs.com"
              className="inline-block px-6 py-3 bg-accent text-light rounded-lg hover:bg-opacity-90 transition-all font-mono text-sm"
            >
              See my other tools →
            </a>
          </div>
        </div>

        <div className="bg-charcoal border-t border-fog px-6 py-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs text-muted mb-2">
              This is a parody. All &ldquo;heist plans&rdquo; and &ldquo;threat levels&rdquo; are
              AI-generated satire, not professional assessments. Powered by Claude (Anthropic).
            </p>
            <div className="flex justify-center gap-4 text-xs text-muted">
              <Link href="/privacy" className="hover:text-light transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-light transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-mono text-accent mb-4">
            INVALID DATA
          </h1>
          <p className="text-muted">
            The report data appears to be corrupted or invalid.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 px-6 py-2 bg-accent text-light rounded-lg hover:bg-opacity-90 transition-all font-mono"
          >
            START NEW INTERVIEW
          </Link>
        </div>
      </div>
    );
  }
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-charcoal flex items-center justify-center">
          <div className="text-gold font-mono text-xl animate-pulse-slow">
            Loading report...
          </div>
        </div>
      }
    >
      <ReportContent />
    </Suspense>
  );
}
