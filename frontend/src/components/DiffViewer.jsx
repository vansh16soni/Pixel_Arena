import { useState } from "react";
import { Eye, GitCompare, Layers } from "lucide-react";
import clsx from "clsx";

const modes = [
  { id: "side", label: "Side by Side", icon: GitCompare },
  { id: "diff", label: "Diff View", icon: Layers },
  { id: "overlay", label: "Overlay", icon: Eye },
];

export default function DiffViewer({ goldenUrl, submissionUrl, diffUrl }) {
  const [mode, setMode] = useState("side");
  const [overlayOpacity, setOverlayOpacity] = useState(50);

  const base = import.meta.env.VITE_API_URL || "";

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex gap-2 flex-wrap">
        {modes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={clsx(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono transition-all",
              mode === id
                ? "bg-accent/20 text-accent-glow border border-accent/40"
                : "text-slate-500 hover:text-slate-300 border border-transparent hover:border-border"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Side by Side */}
      {mode === "side" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Golden</p>
            <div className="rounded-xl overflow-hidden border border-border bg-surface">
              <img src={`${base}${goldenUrl}`} alt="Golden" className="w-full object-contain" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Submission</p>
            <div className="rounded-xl overflow-hidden border border-border bg-surface">
              <img src={`${base}${submissionUrl}`} alt="Submission" className="w-full object-contain" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-mono text-danger uppercase tracking-widest">Diff</p>
            <div className="rounded-xl overflow-hidden border border-danger/30 bg-surface">
              <img src={`${base}${diffUrl}`} alt="Diff" className="w-full object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Diff only */}
      {mode === "diff" && (
        <div className="space-y-2">
          <p className="text-xs font-mono text-danger uppercase tracking-widest">
            Difference Map — Red pixels indicate mismatches
          </p>
          <div className="rounded-xl overflow-hidden border border-danger/30 bg-black">
            <img src={`${base}${diffUrl}`} alt="Diff" className="w-full object-contain max-h-[600px]" />
          </div>
        </div>
      )}

      {/* Overlay */}
      {mode === "overlay" && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-slate-500">Golden</span>
            <input
              type="range"
              min={0}
              max={100}
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(Number(e.target.value))}
              className="flex-1 accent-accent"
            />
            <span className="text-xs font-mono text-slate-500">Submission</span>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-border bg-surface">
            <img
              src={`${base}${goldenUrl}`}
              alt="Golden"
              className="w-full object-contain"
              style={{ opacity: 1 - overlayOpacity / 100 }}
            />
            <img
              src={`${base}${submissionUrl}`}
              alt="Submission"
              className="w-full object-contain absolute inset-0"
              style={{ opacity: overlayOpacity / 100 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
