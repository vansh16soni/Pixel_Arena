// import { useState, useEffect } from "react";
// import { Clock, Zap, Lock, Eye } from "lucide-react";
// import clsx from "clsx";

// function formatTime(ms) {
//   if (ms <= 0) return "00:00";
//   const totalSecs = Math.floor(ms / 1000);
//   const mins = Math.floor(totalSecs / 60);
//   const secs = totalSecs % 60;
//   return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
// }

// export default function RoundTimer({ round, onSync }) {
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [phase, setPhase] = useState(round?.phase || "idle");

//   useEffect(() => {
//     if (!round || !round.active) {
//       setPhase(round?.phase || "idle");
//       return;
//     }

//     const tick = () => {
//       const now = Date.now();
//       const analysisEnd = new Date(round.analysisEndTime).getTime();
//       const buildEnd = new Date(round.endTime).getTime();

//       if (now < analysisEnd) {
//         setPhase("analysis");
//         setTimeLeft(analysisEnd - now);
//       } else if (now < buildEnd) {
//         setPhase("build");
//         setTimeLeft(buildEnd - now);
//         if (round.phase === "analysis" && onSync) onSync();
//       } else {
//         setPhase("locked");
//         setTimeLeft(0);
//         if (onSync) onSync();
//       }
//     };

//     tick();
//     const interval = setInterval(tick, 1000);
//     return () => clearInterval(interval);
//   }, [round]);

//   if (phase === "idle") {
//     return (
//       <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-slate-500 font-mono text-sm">
//         <Clock className="w-4 h-4" />
//         <span>No active round</span>
//       </div>
//     );
//   }

//   if (phase === "locked") {
//     return (
//       <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-danger/10 border border-danger/30 text-danger font-mono text-sm">
//         <Lock className="w-4 h-4" />
//         <span>Submissions Closed</span>
//       </div>
//     );
//   }

//   const isAnalysis = phase === "analysis";

//   return (
//     <div
//       className={clsx(
//         "flex items-center gap-3 px-4 py-2 rounded-xl border font-mono text-sm",
//         isAnalysis
//           ? "bg-gold/10 border-gold/30 text-gold"
//           : "bg-neon/10 border-neon/30 text-neon"
//       )}
//     >
//       {isAnalysis ? <Eye className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
//       <div className="flex flex-col">
//         <span className="text-xs opacity-70 leading-none mb-0.5">
//           {isAnalysis ? "STUDY PHASE" : "BUILD PHASE"}
//         </span>
//         <span className="font-bold text-base leading-none">{formatTime(timeLeft)}</span>
//       </div>
//     </div>
//   );
// }





import { useState, useEffect } from "react";
import { Clock, Zap, Lock, Eye } from "lucide-react";
import clsx from "clsx";

function formatTime(ms) {
  if (ms <= 0) return "00:00";
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function computePhaseAndTime(round) {
  if (!round || !round.active) {
    return { phase: round?.phase || "idle", timeLeft: 0 };
  }
  const now = Date.now();
  const analysisEnd = new Date(round.analysisEndTime).getTime();
  const buildEnd = new Date(round.endTime).getTime();

  if (now < analysisEnd) return { phase: "analysis", timeLeft: analysisEnd - now };
  if (now < buildEnd) return { phase: "build", timeLeft: buildEnd - now };
  return { phase: "locked", timeLeft: 0 };
}

export default function RoundTimer({ round, onSync }) {
  const [tick, setTick] = useState(0);
  const prevPhaseRef = useState(computePhaseAndTime(round).phase);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const { phase, timeLeft } = computePhaseAndTime(round);

  useEffect(() => {
    if (prevPhaseRef[0] !== phase) {
      prevPhaseRef[0] = phase;
      if (onSync) onSync();
    }
  }, [phase]);

  if (phase === "idle") {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-slate-500 font-mono text-sm">
        <Clock className="w-4 h-4" />
        <span>No active round</span>
      </div>
    );
  }

  if (phase === "locked") {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-danger/10 border border-danger/30 text-danger font-mono text-sm">
        <Lock className="w-4 h-4" />
        <span>Submissions Closed</span>
      </div>
    );
  }

  const isAnalysis = phase === "analysis";

  return (
    <div
      className={clsx(
        "flex items-center gap-3 px-4 py-2 rounded-xl border font-mono text-sm",
        isAnalysis
          ? "bg-gold/10 border-gold/30 text-gold"
          : "bg-neon/10 border-neon/30 text-neon"
      )}
    >
      {isAnalysis ? <Eye className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
      <div className="flex flex-col">
        <span className="text-xs opacity-70 leading-none mb-0.5">
          {isAnalysis ? "STUDY PHASE" : "BUILD PHASE"}
        </span>
        <span className="font-bold text-base leading-none">{formatTime(timeLeft)}</span>
      </div>
    </div>
  );
}