"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import ChatWindow from "@/components/ChatWindow";
import { encodePayload } from "@/lib/codec";
import type { InterviewData, HeistReport } from "@/lib/types";

export default function Home() {
  const router = useRouter();

  const handleInterviewComplete = (
    interviewData: InterviewData,
    report: HeistReport
  ) => {
    const payload = {
      version: 1 as const,
      data: interviewData,
      report,
    };

    const encoded = encodePayload(payload);
    router.push(`/report?d=${encoded}`);
  };

  return (
    <div className="min-h-screen bg-charcoal flex flex-col">
      <header className="bg-smoke border-b border-fog p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-mono text-gold mb-2">
            AI JOB HEIST PLANNER
          </h1>
          <p className="text-muted text-sm">
            Interview in progress. Answer honestly — the vault is already being cased.
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto flex flex-col">
        <ChatWindow onInterviewComplete={handleInterviewComplete} />
      </main>

      <footer className="border-t border-fog px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-muted">
          <span>Parody powered by AI (Claude by Anthropic). Not career advice.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-light transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-light transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
