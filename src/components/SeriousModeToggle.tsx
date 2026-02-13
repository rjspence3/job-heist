"use client";

interface SeriousModeToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export default function SeriousModeToggle({
  enabled,
  onChange,
}: SeriousModeToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted font-mono">
        {enabled ? "SERIOUS MODE" : "HEIST MODE"}
      </span>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-14 h-7 rounded-full transition-colors ${
          enabled ? "bg-gold" : "bg-fog"
        }`}
        role="switch"
        aria-checked={enabled}
        aria-label="Toggle serious mode"
      >
        <div
          className={`absolute top-1 left-1 w-5 h-5 bg-light rounded-full transition-transform ${
            enabled ? "translate-x-7" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
