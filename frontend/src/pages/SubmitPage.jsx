// import { useState, useEffect } from "react";
// import { Upload, Github, Send, CheckCircle, Lock, AlertCircle } from "lucide-react";
// import toast from "react-hot-toast";
// import { submissionsAPI, adminAPI, roundAPI } from "../utils/api";
// import DropZone from "../components/DropZone";
// import ScoreCircle from "../components/ScoreCircle";
// import DiffViewer from "../components/DiffViewer";
// import RoundTimer from "../components/RoundTimer";

// export default function SubmitPage() {
//   const [teamName, setTeamName] = useState("");
//   const [githubUrl, setGithubUrl] = useState("");
//   const [screenshot, setScreenshot] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [round, setRound] = useState(null);
//   const [goldenImage, setGoldenImage] = useState(null);

//   useEffect(() => {
//     Promise.all([roundAPI.sync(), adminAPI.getGoldenImage()])
//       .then(([r, g]) => {
//         setRound(r.data.round);
//         setGoldenImage(g.data.goldenImage);
//       })
//       .catch(() => {});
//   }, []);

//   const isLocked = round?.phase === "locked";
//   const isAnalysis = round?.phase === "analysis";
//   const hasGolden = !!goldenImage;
//   const base = import.meta.env.VITE_API_URL || "";

//   async function handleSubmit() {
//     if (!teamName.trim()) return toast.error("Enter your team name");
//     if (!screenshot) return toast.error("Upload a screenshot first");
//     if (!hasGolden) return toast.error("No golden image set — wait for admin");
//     if (isLocked) return toast.error("Submissions are closed");

//     setLoading(true);
//     try {
//       const fd = new FormData();
//       fd.append("teamName", teamName.trim());
//       fd.append("screenshot", screenshot);
//       if (githubUrl) fd.append("githubUrl", githubUrl);

//       const res = await submissionsAPI.submit(fd);
//       setResult(res.data.submission);
//       toast.success("Submission analyzed! 🎯");
//     } catch (err) {
//       toast.error(err.response?.data?.error || "Submission failed");
//     } finally {
//       setLoading(false);
//     }
//   }

//   if (result) {
//     return (
//       <div className="max-w-5xl mx-auto px-6 py-12 animate-slide-up">
//         {/* Success header */}
//         <div className="text-center mb-10">
//           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon/10 border border-neon/20 text-neon font-mono text-sm mb-6">
//             <CheckCircle className="w-4 h-4" />
//             Submission Analyzed
//           </div>
//           <h1 className="font-display font-extrabold text-4xl text-white mb-2">
//             {result.teamName}
//           </h1>
//           <p className="text-slate-400">Here's how your design compares to the golden image</p>
//         </div>

//         {/* Score */}
//         <div className="glass-panel p-8 flex flex-col md:flex-row items-center gap-8 mb-8">
//           <ScoreCircle score={result.similarity} size={160} />
//           <div className="flex-1 text-center md:text-left">
//             <h2 className="font-display font-bold text-3xl text-white mb-2">
//               {result.similarity >= 80 ? "🔥 Excellent Match!" : result.similarity >= 60 ? "✨ Good Job!" : result.similarity >= 40 ? "⚡ Getting There!" : "💪 Keep Improving!"}
//             </h2>
//             <p className="text-slate-400 font-body mb-4">
//               Your design matched <span className="text-neon font-bold">{result.similarity.toFixed(2)}%</span> of the golden image.
//             </p>
//             <div className="flex flex-wrap gap-4 font-mono text-sm">
//               <span className="px-3 py-1.5 rounded-lg bg-surface border border-border text-slate-400">
//                 {result.matchedPixels?.toLocaleString()} matched px
//               </span>
//               <span className="px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/20 text-danger">
//                 {result.diffPixels?.toLocaleString()} diff px
//               </span>
//             </div>
//             {result.githubUrl && (
//               <a href={result.githubUrl} target="_blank" rel="noopener noreferrer"
//                 className="mt-4 inline-flex items-center gap-2 text-accent-glow text-sm hover:underline font-mono">
//                 <Github className="w-4 h-4" /> {result.githubUrl}
//               </a>
//             )}
//           </div>
//         </div>

//         {/* Diff viewer */}
//         <div className="glass-panel p-6 mb-8">
//           <h3 className="font-display font-bold text-lg text-white mb-4">Visual Comparison</h3>
//           <DiffViewer
//             goldenUrl={goldenImage?.url}
//             submissionUrl={result.screenshotUrl}
//             diffUrl={result.diffUrl}
//           />
//         </div>

//         <button
//           onClick={() => { setResult(null); setScreenshot(null); }}
//           className="btn-primary w-full"
//         >
//           Submit Another
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-2xl mx-auto px-6 py-12 animate-slide-up">
//       <div className="text-center mb-10">
//         <h1 className="font-display font-extrabold text-4xl text-white mb-2">
//           Submit Your <span className="text-gradient">Screenshot</span>
//         </h1>
//         <p className="text-slate-400">Upload your recreated webpage screenshot for scoring</p>
//       </div>

//       {/* Status bar */}
//       <div className="flex items-center justify-between glass-panel p-4 mb-6">
//         <div className="flex items-center gap-2">
//           <div className={`w-2 h-2 rounded-full ${hasGolden ? "bg-neon" : "bg-slate-600"} ${hasGolden ? "shadow-[0_0_8px_rgba(0,245,196,0.8)]" : ""}`} />
//           <span className="font-mono text-sm text-slate-400">
//             {hasGolden ? "Golden image ready" : "Waiting for golden image"}
//           </span>
//         </div>
//         {round && <RoundTimer round={round} onSync={() => roundAPI.sync().then(r => setRound(r.data.round))} />}
//       </div>

//       {/* Golden image preview */}
//       {goldenImage && round?.phase !== "idle" && (
//         <div className="glass-panel p-4 mb-6">
//           <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">Golden Image (Reference)</p>
//           <img
//             src={`${base}${goldenImage.url}`}
//             alt="Golden"
//             className={`w-full rounded-xl object-contain max-h-48 ${isAnalysis ? "" : "blur-sm"}`}
//           />
//           {isAnalysis && (
//             <p className="text-center text-gold font-mono text-xs mt-2">Study phase — memorize this design!</p>
//           )}
//           {!isAnalysis && !isLocked && (
//             <p className="text-center text-slate-500 font-mono text-xs mt-2">Build phase — golden image hidden</p>
//           )}
//         </div>
//       )}

//       {isLocked && (
//         <div className="glass-panel p-5 border-danger/30 flex items-center gap-3 mb-6 bg-danger/5">
//           <Lock className="w-5 h-5 text-danger shrink-0" />
//           <div>
//             <p className="font-display font-semibold text-danger">Submissions Closed</p>
//             <p className="text-sm text-slate-400">The round has ended. Wait for the next round.</p>
//           </div>
//         </div>
//       )}

//       {!hasGolden && (
//         <div className="glass-panel p-5 border-gold/20 flex items-center gap-3 mb-6 bg-gold/5">
//           <AlertCircle className="w-5 h-5 text-gold shrink-0" />
//           <p className="text-sm text-slate-300">No golden image has been set by the admin yet.</p>
//         </div>
//       )}

//       {/* Form */}
//       <div className="glass-panel p-6 space-y-5">
//         <div>
//           <label className="block text-sm font-display font-semibold text-slate-300 mb-2">
//             Team Name *
//           </label>
//           <input
//             type="text"
//             className="input-field"
//             placeholder="e.g. Pixel Ninjas"
//             value={teamName}
//             onChange={(e) => setTeamName(e.target.value)}
//             disabled={isLocked}
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-display font-semibold text-slate-300 mb-2">
//             Screenshot *
//           </label>
//           <DropZone
//             onFile={setScreenshot}
//             label="Drop your webpage screenshot"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-display font-semibold text-slate-300 mb-2">
//             GitHub Repo URL <span className="text-slate-500 font-normal">(optional)</span>
//           </label>
//           <div className="relative">
//             <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
//             <input
//               type="url"
//               className="input-field pl-10"
//               placeholder="https://github.com/your/repo"
//               value={githubUrl}
//               onChange={(e) => setGithubUrl(e.target.value)}
//               disabled={isLocked}
//             />
//           </div>
//         </div>

//         <button
//           onClick={handleSubmit}
//           disabled={loading || isLocked || !hasGolden}
//           className="btn-primary w-full flex items-center justify-center gap-2"
//         >
//           {loading ? (
//             <>
//               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//               Analyzing with AI...
//             </>
//           ) : (
//             <>
//               <Send className="w-4 h-4" />
//               Submit & Analyze
//             </>
//           )}
//         </button>
//       </div>
//     </div>
//   );
// }




import { useState, useEffect } from "react";
import { Github, Send, CheckCircle, Lock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { submissionsAPI, adminAPI, roundAPI } from "../utils/api";
import DropZone from "../components/DropZone";
import ScoreCircle from "../components/ScoreCircle";
import DiffViewer from "../components/DiffViewer";
import RoundTimer from "../components/RoundTimer";
import ProtectedImage from "../components/ProtectedImage";

function computePhase(round) {
  if (!round || !round.active) return round?.phase || "idle";
  const now = Date.now();
  const analysisEnd = new Date(round.analysisEndTime).getTime();
  const buildEnd = new Date(round.endTime).getTime();
  if (now < analysisEnd) return "analysis";
  if (now < buildEnd) return "build";
  return "locked";
}

export default function SubmitPage() {
  const [teamName, setTeamName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [round, setRound] = useState(null);
  const [goldenImage, setGoldenImage] = useState(null);

  const phase = computePhase(round);
  const isLocked = phase === "locked";
  const isAnalysis = phase === "analysis";
  const isBuild = phase === "build";
  const hasGolden = !!goldenImage;
  const showGolden = hasGolden && isAnalysis;

  const base = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, []);

  async function fetchState() {
    try {
      const [rRes, gRes] = await Promise.all([
        roundAPI.sync(),
        adminAPI.getGoldenImage(),
      ]);
      setRound(rRes.data.round);
      setGoldenImage(gRes.data.goldenImage);
    } catch (e) {}
  }

  async function handleSubmit() {
    if (!teamName.trim()) return toast.error("Enter your team name");
    if (!screenshot) return toast.error("Upload a screenshot first");
    if (!hasGolden) return toast.error("No golden image set");
    if (isLocked) return toast.error("Submissions are closed");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("teamName", teamName.trim());
      fd.append("screenshot", screenshot);
      if (githubUrl) fd.append("githubUrl", githubUrl);
      const res = await submissionsAPI.submit(fd);
      setResult(res.data.submission);
      toast.success("Submission analyzed!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  function getScoreMessage(score) {
    if (score >= 80) return "Excellent Match!";
    if (score >= 60) return "Good Job!";
    if (score >= 40) return "Getting There!";
    return "Keep Improving!";
  }

  if (result) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 animate-slide-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon/10 border border-neon/20 text-neon font-mono text-sm mb-6">
            <CheckCircle className="w-4 h-4" />
            Submission Analyzed
          </div>
          <h1 className="font-display font-extrabold text-4xl text-white mb-2">
            {result.teamName}
          </h1>
          <p className="text-slate-400">Here is how your design compares to the golden image</p>
        </div>

        <div className="glass-panel p-8 flex flex-col md:flex-row items-center gap-8 mb-8">
          <ScoreCircle score={result.similarity} size={160} />
          <div className="flex-1 text-center md:text-left">
            <h2 className="font-display font-bold text-3xl text-white mb-2">
              {getScoreMessage(result.similarity)}
            </h2>
            <p className="text-slate-400 font-body mb-4">
              Your design matched
              <span className="text-neon font-bold mx-1">
                {result.similarity.toFixed(2)}%
              </span>
              of the golden image.
            </p>
            <div className="flex flex-wrap gap-4 font-mono text-sm">
              <span className="px-3 py-1.5 rounded-lg bg-surface border border-border text-slate-400">
                {result.matchedPixels?.toLocaleString()} matched px
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/20 text-danger">
                {result.diffPixels?.toLocaleString()} diff px
              </span>
            </div>
            {result.githubUrl && (
              <a
                href={result.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-accent-glow text-sm hover:underline font-mono"
              >
                <Github className="w-4 h-4" />
                {result.githubUrl}
              </a>
            )}
          </div>
        </div>

        {goldenImage && (
          <div className="glass-panel p-6 mb-8">
            <h3 className="font-display font-bold text-lg text-white mb-4">Visual Comparison</h3>
            <DiffViewer
              goldenUrl={goldenImage.url}
              submissionUrl={result.screenshotUrl}
              diffUrl={result.diffUrl}
            />
          </div>
        )}

        <button
          onClick={() => { setResult(null); setScreenshot(null); }}
          className="btn-primary w-full"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 animate-slide-up">
      <div className="text-center mb-10">
        <h1 className="font-display font-extrabold text-4xl text-white mb-2">
          Submit Your <span className="text-gradient">Screenshot</span>
        </h1>
        <p className="text-slate-400">Upload your recreated webpage screenshot for scoring</p>
      </div>

      <div className="flex items-center justify-between glass-panel p-4 mb-6">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full transition-all duration-500 ${hasGolden ? "bg-neon shadow-[0_0_8px_rgba(0,245,196,0.8)]" : "bg-slate-600"}`} />
          <span className="font-mono text-sm text-slate-400">
            {hasGolden ? "Golden image ready" : "Waiting for golden image"}
          </span>
        </div>
        {round && <RoundTimer round={round} onSync={fetchState} />}
      </div>

      {/* {showGolden && (
        <div className="glass-panel p-4 mb-6 border-gold/30 bg-gold/5 animate-fade-in">
          <p className="text-xs font-mono text-gold uppercase tracking-widest mb-3">
            Study Phase — Memorize this design!
          </p>
          <img
            src={`${base}${goldenImage.url}`}
            alt="Golden Reference"
            className="w-full rounded-xl object-contain max-h-64 border border-gold/20"
          />
          <p className="text-center text-gold/60 font-mono text-xs mt-2">
            This image hides the moment build phase starts
          </p>
        </div>
      )} */}


      {showGolden && (
        <div className="glass-panel p-4 mb-6 border-gold/30 bg-gold/5 animate-fade-in no-print">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-mono text-gold uppercase tracking-widest">
              👁️ Study Phase — Memorize this design!
            </p>
            <span className="text-xs font-mono text-danger/70 flex items-center gap-1">
              🔒 Protected
            </span>
          </div>
          <ProtectedImage
            src={`${base}${goldenImage.url}`}
            alt="Golden Reference"
            className="w-full rounded-xl object-contain max-h-64 border border-gold/20"
            teamName={teamName || "PARTICIPANT"}
          />
          <p className="text-center text-gold/60 font-mono text-xs mt-2">
            Screenshot protection is active — image is watermarked
          </p>
        </div>
      )}

      {isBuild && hasGolden && (
        <div className="glass-panel p-4 mb-6 border-neon/20 bg-neon/5 animate-fade-in">
          <p className="text-xs font-mono text-neon uppercase tracking-widest">
            Build Phase — Golden image is now hidden. Go build!
          </p>
        </div>
      )}

      {isLocked && (
        <div className="glass-panel p-5 border-danger/30 flex items-center gap-3 mb-6 bg-danger/5">
          <Lock className="w-5 h-5 text-danger shrink-0" />
          <div>
            <p className="font-display font-semibold text-danger">Submissions Closed</p>
            <p className="text-sm text-slate-400">The round has ended. Wait for the next round.</p>
          </div>
        </div>
      )}

      {!hasGolden && (
        <div className="glass-panel p-5 border-gold/20 flex items-center gap-3 mb-6 bg-gold/5">
          <AlertCircle className="w-5 h-5 text-gold shrink-0" />
          <p className="text-sm text-slate-300">No golden image has been set by the admin yet.</p>
        </div>
      )}

      <div className="glass-panel p-6 space-y-5">
        <div>
          <label className="block text-sm font-display font-semibold text-slate-300 mb-2">Team Name *</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Pixel Ninjas"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            disabled={isLocked}
          />
        </div>

        <div>
          <label className="block text-sm font-display font-semibold text-slate-300 mb-2">Screenshot *</label>
          <DropZone onFile={setScreenshot} label="Drop your webpage screenshot" />
        </div>

        <div>
          <label className="block text-sm font-display font-semibold text-slate-300 mb-2">
            GitHub Repo URL <span className="text-slate-500 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="url"
              className="input-field pl-10"
              placeholder="https://github.com/your/repo"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              disabled={isLocked}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || isLocked || !hasGolden}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit and Analyze
            </>
          )}
        </button>
      </div>
    </div>
  );
}
