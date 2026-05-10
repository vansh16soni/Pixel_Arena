import { useState, useEffect } from "react";
import {
  LayoutDashboard, Upload, Play, Lock, Trash2, RefreshCw,
  Image, Trophy, Clock, Settings, AlertTriangle, CheckCircle, Github
} from "lucide-react";
import toast from "react-hot-toast";
import { adminAPI, roundAPI, submissionsAPI } from "../utils/api";
import DropZone from "../components/DropZone";
import ScoreCircle from "../components/ScoreCircle";
import RoundTimer from "../components/RoundTimer";
import DiffViewer from "../components/DiffViewer";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [goldenFile, setGoldenFile] = useState(null);
  const [goldenImage, setGoldenImage] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [round, setRound] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [buildDuration, setBuildDuration] = useState(30);
  const [analysisDuration, setAnalysisDuration] = useState(2);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSub, setExpandedSub] = useState(null);

  const base = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    if (authed) fetchAll();
  }, [authed]);

  useEffect(() => {
    if (!authed) return;
    const interval = setInterval(fetchAll, 10000);
    return () => clearInterval(interval);
  }, [authed]);

  async function fetchAll() {
    try {
      const [g, subs, r] = await Promise.all([
        adminAPI.getGoldenImage(),
        adminAPI.getSubmissions(),
        roundAPI.sync(),
      ]);
      setGoldenImage(g.data.goldenImage);
      setSubmissions(subs.data.submissions);
      setRound(r.data.round);
    } catch {}
  }

  async function deleteGolden() {
  if (!confirm("Delete the golden image? This cannot be undone.")) return;
  try {
    await adminAPI.deleteGoldenImage();
    toast.success("Golden image deleted");
    fetchAll();
  } catch (err) {
    toast.error(err.response?.data?.error || "Delete failed");
  }
}

  async function uploadGolden() {
    if (!goldenFile) return toast.error("Select an image first");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", goldenFile);
      await adminAPI.uploadGoldenImage(fd);
      toast.success("Golden image uploaded!");
      setGoldenFile(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || "Upload failed");
    } finally { setUploading(false); }
  }

  async function startRound() {
    try {
      await roundAPI.start({ buildDuration, analysisDuration });
      toast.success("Round started! ⚡");
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to start round");
    }
  }

  async function lockRound() {
    try {
      await roundAPI.lock();
      toast.success("Round locked — submissions closed");
      fetchAll();
    } catch {}
  }

  async function deleteSubmission(id) {
    try {
      await adminAPI.deleteSubmission(id);
      toast.success("Submission removed");
      fetchAll();
    } catch {}
  }

  async function resetAll() {
    if (!confirm("Reset ALL submissions and round? This cannot be undone.")) return;
    try {
      await adminAPI.reset();
      toast.success("Reset complete");
      fetchAll();
    } catch {}
  }

  // Auth gate
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass-panel p-8 w-full max-w-sm animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-accent-glow" />
            </div>
            <div>
              <h1 className="font-display font-bold text-white">Admin Access</h1>
              <p className="text-slate-500 text-sm font-mono">Vibe Snapshot</p>
            </div>
          </div>
          <input
            type="password"
            className="input-field mb-4"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && password === ADMIN_PASSWORD && setAuthed(true)}
          />
          <button
            className="btn-primary w-full"
            onClick={() => {
              if (password === ADMIN_PASSWORD) setAuthed(true);
              else toast.error("Incorrect password");
            }}
          >
            Enter Dashboard
          </button>
          <p className="text-xs text-slate-600 text-center mt-4 font-mono">
            Default: admin123 (set VITE_ADMIN_PASSWORD)
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "golden", label: "Golden Image", icon: Image },
    { id: "submissions", label: `Submissions (${submissions.length})`, icon: Trophy },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-white">Admin Dashboard</h1>
          <p className="text-slate-500 font-mono text-sm">Vibe Snapshot Control Panel</p>
        </div>
        <div className="flex items-center gap-3">
          {round && <RoundTimer round={round} onSync={fetchAll} />}
          <button onClick={fetchAll} className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-border">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 font-display font-medium text-sm border-b-2 transition-all -mb-px ${
              activeTab === id
                ? "border-accent text-accent-glow"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fade-in">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Teams", value: submissions.length, color: "text-neon" },
              { label: "Top Score", value: submissions.length ? `${Math.max(...submissions.map(s => s.similarity)).toFixed(1)}%` : "—", color: "text-gold" },
              { label: "Avg Score", value: submissions.length ? `${(submissions.reduce((a, s) => a + s.similarity, 0) / submissions.length).toFixed(1)}%` : "—", color: "text-accent-glow" },
              { label: "Phase", value: round?.phase?.toUpperCase() || "IDLE", color: round?.phase === "build" ? "text-neon" : round?.phase === "analysis" ? "text-gold" : round?.phase === "locked" ? "text-danger" : "text-slate-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-panel p-5 text-center">
                <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
                <p className="text-slate-500 text-xs font-mono mt-1 uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>

          {/* Round controls */}
          <div className="glass-panel p-6">
            <h2 className="font-display font-bold text-white text-lg mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-neon" /> Round Control
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-mono text-slate-500 mb-2">ANALYSIS PHASE (minutes)</label>
                <input type="number" min={1} max={10} value={analysisDuration}
                  onChange={(e) => setAnalysisDuration(Number(e.target.value))}
                  className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-500 mb-2">BUILD PHASE (minutes)</label>
                <input type="number" min={5} max={120} value={buildDuration}
                  onChange={(e) => setBuildDuration(Number(e.target.value))}
                  className="input-field" />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={startRound}
                disabled={!goldenImage || round?.active}
                className="btn-primary flex items-center gap-2 flex-1"
              >
                <Play className="w-4 h-4" />
                {round?.active ? "Round Active" : "Start Round"}
              </button>
              <button
                onClick={lockRound}
                disabled={!round?.active}
                className="btn-danger flex items-center gap-2 flex-1"
              >
                <Lock className="w-4 h-4" />
                Lock Submissions
              </button>
            </div>
            {!goldenImage && (
              <p className="text-xs text-gold font-mono mt-3 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Upload a golden image before starting a round
              </p>
            )}
          </div>

          {/* Top 3 */}
          {submissions.length > 0 && (
            <div className="glass-panel p-6">
              <h2 className="font-display font-bold text-white text-lg mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-gold" /> Top Teams
              </h2>
              {submissions.slice(0, 3).map((s, i) => (
                <div key={s.id} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
                  <span className="text-xl">{["🥇","🥈","🥉"][i]}</span>
                  <ScoreCircle score={s.similarity} size={50} />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-white truncate">{s.teamName}</p>
                    <p className="text-xs font-mono text-slate-500">{new Date(s.submittedAt).toLocaleTimeString()}</p>
                  </div>
                  <span className="font-mono text-neon font-bold">{s.similarity.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* GOLDEN IMAGE TAB */}
      {activeTab === "golden" && (
        <div className="space-y-6 animate-fade-in">
          {/* {goldenImage && (
            <div className="glass-panel p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-4 h-4 text-neon" />
                <h2 className="font-display font-bold text-white">Current Golden Image</h2>
              </div>
              <img
                src={`${base}${goldenImage.url}`}
                alt="Golden"
                className="w-full max-h-72 object-contain rounded-xl border border-border bg-surface"
              />
              <p className="text-xs font-mono text-slate-500 mt-3">
                Uploaded: {new Date(goldenImage.uploadedAt).toLocaleString()} · {goldenImage.originalName}
              </p>
            </div>
          )} */}

          {goldenImage && (
            <div className="glass-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-neon" />
                  <h2 className="font-display font-bold text-white">Current Golden Image</h2>
                </div>
                <button
                  onClick={deleteGolden}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm font-mono hover:bg-danger/20 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Image
                </button>
              </div>
              <img
                src={`${base}${goldenImage.url}`}
                alt="Golden"
                className="w-full max-h-72 object-contain rounded-xl border border-border bg-surface"
              />
              <p className="text-xs font-mono text-slate-500 mt-3">
                Uploaded: {new Date(goldenImage.uploadedAt).toLocaleString()} · {goldenImage.originalName}
              </p>
            </div>
          )}

          
          <div className="glass-panel p-6">
            <h2 className="font-display font-bold text-white mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-accent-glow" />
              {goldenImage ? "Replace" : "Upload"} Golden Image
            </h2>
            <DropZone onFile={setGoldenFile} label="Drop golden reference image" />
            <button
              onClick={uploadGolden}
              disabled={uploading || !goldenFile}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Uploading...</>
              ) : (
                <><Upload className="w-4 h-4" />Upload Golden Image</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* SUBMISSIONS TAB */}
      {activeTab === "submissions" && (
        <div className="space-y-4 animate-fade-in">
          {submissions.length === 0 && (
            <div className="text-center py-16 glass-panel">
              <Trophy className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 font-display">No submissions yet</p>
            </div>
          )}

          {submissions.map((s, i) => {
            const isOpen = expandedSub === s.id;
            return (
              <div key={s.id} className={`glass-panel overflow-hidden transition-all ${isOpen ? "border-accent/30" : ""}`}>
                <div
                  className="p-4 flex items-center gap-4 cursor-pointer hover:bg-white/[0.01]"
                  onClick={() => setExpandedSub(isOpen ? null : s.id)}
                >
                  <span className="font-mono text-slate-600 text-sm w-6">#{i + 1}</span>
                  <ScoreCircle score={s.similarity} size={52} />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-white truncate">{s.teamName}</p>
                    <p className="text-xs font-mono text-slate-500">{new Date(s.submittedAt).toLocaleString()}</p>
                  </div>
                  {s.githubUrl && (
                    <a href={s.githubUrl} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-accent-glow hover:underline text-xs font-mono flex items-center gap-1">
                      <Github className="w-3 h-3" /> Repo
                    </a>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSubmission(s.id); }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-danger hover:bg-danger/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {isOpen && goldenImage && (
                  <div className="border-t border-border p-4 animate-fade-in">
                    <DiffViewer
                      goldenUrl={goldenImage.url}
                      submissionUrl={s.screenshotUrl}
                      diffUrl={s.diffUrl}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className="space-y-6 animate-fade-in max-w-lg">
          <div className="glass-panel p-6 border-danger/20">
            <h2 className="font-display font-bold text-white text-lg mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-danger" /> Danger Zone
            </h2>
            <p className="text-slate-400 text-sm mb-4 font-body">
              This will delete all submissions, clear the leaderboard, and reset the round. The golden image is preserved.
            </p>
            <button onClick={resetAll} className="btn-danger flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Reset All Submissions & Round
            </button>
          </div>

          <div className="glass-panel p-6">
            <h2 className="font-display font-bold text-white text-lg mb-4">Environment Info</h2>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Admin Password</span>
                <span className="text-accent-glow">{ADMIN_PASSWORD === "admin123" ? "⚠️ Default" : "✅ Custom"}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>API URL</span>
                <span className="text-slate-300">{base || "proxy (dev)"}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Golden Image</span>
                <span className={goldenImage ? "text-neon" : "text-danger"}>{goldenImage ? "Set" : "Not set"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
