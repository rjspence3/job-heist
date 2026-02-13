"use client";

export default function InterviewComplete() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block animate-pulse-slow">
            <div className="text-gold text-4xl font-mono">[ COMPILING ]</div>
          </div>
        </div>
        <p className="text-muted text-sm font-mono">
          Drawing up the blueprints...
        </p>
      </div>
    </div>
  );
}
