import { useState, useEffect } from "react";
import { Trophy, Github, RefreshCw, Clock, Zap } from "lucide-react";
import { submissionsAPI, roundAPI } from "../utils/api";
import ScoreCircle from "../components/ScoreCircle";
import RoundTimer from "../components/RoundTimer";
import DiffViewer from "../components/DiffViewer";
import { adminAPI } from "../utils/api";

const rankStyle = (rank) => {
  if (rank === 1) return { medal: "🥇", color: "text-gold", bg: "bg-gold/5 border-gold/20" };
  if (rank === 2) return { medal: "🥈", color: "text-silver", bg: "bg-silver/5 border-silver/20" };
  if (rank === 3) return { medal: "🥉", color: "text-bronze", bg: "bg-bronze/5 border-bronze/20" };
  return { medal: `#${rank}`, color: "text-slate-500", bg: "" };
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [round, setRound] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [goldenImage, setGoldenImage] = useState(null);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, []);

  async function fetchAll() {
    try {
      const [lb, r, g] = await Promise.all([
        submissionsAPI.getLeaderboard(),
        roundAPI.sync(),
        adminAPI.getGoldenImage(),
      ]);
      setLeaderboard(lb.data.leaderboard);
      setRound(r.data.round);
      setGoldenImage(g.data.goldenImage);
    } catch {}
    finally { setLoading(false); }
  }

  function toggleExpand(id) {
    setExpanded(expanded === id ? null : id);
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display font-extrabold text-4xl text-white mb-1">
            <span className="text-gradient-gold">Leaderboard</span>
          </h1>
          <p className="text-slate-400 font-body">
            {leaderboard.length} team{leaderboard.length !== 1 ? "s" : ""} competing
          </p>
        </div>
        <div className="flex items-center gap-3">
          {round && <RoundTimer round={round} onSync={fetchAll} />}
          <button
            onClick={fetchAll}
            className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-slate-400 hover:text-white hover:border-accent/40 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-20 text-slate-500 font-mono">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
          Loading scores...
        </div>
      )}

      {!loading && leaderboard.length === 0 && (
        <div className="text-center py-20 glass-panel">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="font-display font-bold text-slate-400 text-xl">No submissions yet</p>
          <p className="text-slate-600 text-sm mt-2">Be the first to submit your screenshot!</p>
        </div>
      )}

      <div className="space-y-3">
        {leaderboard.map((team) => {
          const { medal, color, bg } = rankStyle(team.rank);
          const isOpen = expanded === team.id;

          return (
            <div
              key={team.id}
              className={`glass-panel overflow-hidden transition-all duration-300 ${bg} ${isOpen ? "border-accent/30" : "hover:border-border"}`}
            >
              {/* Main row */}
              <button
                className="w-full p-5 flex items-center gap-4 text-left"
                onClick={() => toggleExpand(team.id)}
              >
                <span className={`font-display font-bold text-xl w-10 text-center ${color}`}>
                  {medal}
                </span>
                <ScoreCircle score={team.similarity} size={64} />
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-white text-lg truncate">
                    {team.teamName}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(team.submittedAt).toLocaleTimeString()}
                    </span>
                    {team.githubUrl && (
                      <a
                        href={team.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-mono text-accent-glow flex items-center gap-1 hover:underline"
                      >
                        <Github className="w-3 h-3" />
                        Repo
                      </a>
                    )}
                  </div>
                </div>

                {/* Score bar */}
                <div className="hidden md:flex flex-col items-end gap-1 min-w-[140px]">
                  <span className={`font-mono font-bold text-sm ${color}`}>
                    {team.similarity.toFixed(2)}%
                  </span>
                  <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${team.similarity}%`,
                        background: team.similarity >= 80 ? "#00f5c4" : team.similarity >= 60 ? "#7c3aed" : team.similarity >= 40 ? "#ffd166" : "#ff3b5c",
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-600">
                    {team.diffPixels?.toLocaleString()} diff px
                  </span>
                </div>

                <Zap className={`w-4 h-4 transition-transform duration-200 text-slate-600 ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Expanded diff viewer */}
              {isOpen && goldenImage && (
                <div className="border-t border-border px-5 pb-5 pt-4 animate-fade-in">
                  <DiffViewer
                    goldenUrl={goldenImage.url}
                    submissionUrl={team.screenshotUrl}
                    diffUrl={team.diffUrl}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
