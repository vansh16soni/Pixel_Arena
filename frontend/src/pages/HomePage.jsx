import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Camera, Zap, Trophy, Upload, ArrowRight, Eye, Code2 } from "lucide-react";
import { submissionsAPI, roundAPI } from "../utils/api";
import RoundTimer from "../components/RoundTimer";
import ScoreCircle from "../components/ScoreCircle";

export default function HomePage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [round, setRound] = useState(null);
  const [goldenUrl, setGoldenUrl] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const [lbRes, roundRes] = await Promise.all([
        submissionsAPI.getLeaderboard(),
        roundAPI.sync(),
      ]);
      setLeaderboard(lbRes.data.leaderboard.slice(0, 3));
      setRound(roundRes.data.round);
    } catch {}
  }

  const steps = [
    { icon: Eye, title: "Study", desc: "Admin reveals the golden design. Analyze every pixel.", color: "text-gold" },
    { icon: Code2, title: "Build", desc: "Recreate the design as a webpage — make it pixel-perfect.", color: "text-accent-glow" },
    { icon: Upload, title: "Submit", desc: "Upload your screenshot. Our engine compares instantly.", color: "text-neon" },
    { icon: Trophy, title: "Rank", desc: "Highest similarity score wins the leaderboard.", color: "text-gold" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative px-6 pt-24 pb-20 max-w-7xl mx-auto text-center">
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-neon/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative">
          {round && (
            <div className="flex justify-center mb-8">
              <RoundTimer round={round} onSync={fetchData} />
            </div>
          )}

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent-glow text-sm font-mono mb-8">
            <Zap className="w-3.5 h-3.5" />
            Pixel Perfect Competition Platform
          </div>

          <h1 className="font-display font-extrabold text-6xl md:text-8xl tracking-tight mb-6 leading-none">
            <span className="text-white">Vibe</span>
            <br />
            <span className="text-gradient">Snapshot</span>
          </h1>

          <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10 font-body leading-relaxed">
            The ultimate frontend replication challenge. Study the golden design,
            build it from scratch, and let the AI judge how close you got.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/submit" className="btn-primary flex items-center gap-2 text-base">
              <Upload className="w-4 h-4" />
              Submit Screenshot
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/leaderboard" className="btn-neon flex items-center gap-2 text-base">
              <Trophy className="w-4 h-4" />
              View Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <h2 className="font-display font-bold text-3xl text-center mb-12 text-white">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map(({ icon: Icon, title, desc, color }, i) => (
            <div key={i} className="glass-panel p-6 relative group hover:border-accent/30 transition-all duration-300 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="absolute top-4 right-4 font-display font-bold text-5xl text-white/5">
                {i + 1}
              </div>
              <div className={`w-10 h-10 rounded-xl bg-surface flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className={`font-display font-bold text-xl mb-2 ${color}`}>{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mini leaderboard */}
      {leaderboard.length > 0 && (
        <section className="px-6 py-16 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display font-bold text-3xl text-white">Top Teams</h2>
            <Link to="/leaderboard" className="text-accent-glow font-mono text-sm flex items-center gap-1 hover:gap-2 transition-all">
              Full Leaderboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {leaderboard.map((team, i) => {
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div key={team.id} className="glass-panel p-5 flex items-center gap-5 hover:border-accent/20 transition-all">
                  <span className="text-2xl w-8 text-center">{medals[i]}</span>
                  <ScoreCircle score={team.similarity} size={60} />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-white truncate">{team.teamName}</p>
                    <p className="text-xs font-mono text-slate-500">{new Date(team.submittedAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-8 text-center text-slate-600 font-mono text-xs">
        <div className="flex items-center justify-center gap-2">
          <Camera className="w-4 h-4" />
          Vibe Snapshot — Pixel Perfect Competition Platform
        </div>
      </footer>
    </div>
  );
}
