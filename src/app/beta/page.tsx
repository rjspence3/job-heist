"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BetaGate() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/beta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      if (response.ok) {
        router.push("/");
      } else {
        setError("Wrong code. Try again.");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-heist-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-6">
          <Link
            href="/"
            aria-label="noMouthLabs — go home"
            className="relative inline-flex items-center justify-center w-9 h-9 bg-black overflow-hidden"
          >
            <span className="font-mono text-light text-sm font-bold z-10">NM</span>
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent" />
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-mono text-heist-gold mb-3">
            AI JOB HEIST PLANNER
          </h1>
          <p className="text-heist-muted text-sm font-mono uppercase tracking-wider">
            Classified — Beta Access Required
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-heist-charcoal border border-heist-fog/20 rounded-lg p-6">
          <label htmlFor="beta-code" className="block text-heist-light text-sm mb-2">
            Enter access code
          </label>
          <input
            id="beta-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code..."
            autoFocus
            className="w-full bg-heist-black border border-heist-fog/30 rounded px-4 py-3 text-heist-light font-mono text-center text-lg tracking-widest placeholder:text-heist-fog focus:outline-none focus:border-heist-gold transition-colors"
          />
          {error && (
            <p className="text-heist-accent text-sm mt-2 text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full mt-4 bg-heist-gold text-heist-black font-mono font-bold py-3 rounded hover:bg-heist-gold/90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? "Verifying..." : "Enter"}
          </button>
        </form>

        <p className="text-heist-fog text-xs text-center mt-6">
          This tool is in beta. Got a code from someone? Enter it above.
        </p>
        <div className="flex justify-center gap-4 text-xs text-heist-fog mt-4">
          <Link href="/privacy" className="hover:text-heist-light transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-heist-light transition-colors">Terms</Link>
        </div>
      </div>
    </div>
  );
}
