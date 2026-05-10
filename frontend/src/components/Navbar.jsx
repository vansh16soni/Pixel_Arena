import { Link, useLocation } from "react-router-dom";
import { Camera, Trophy, Upload, LayoutDashboard, Zap } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { to: "/", label: "Home", icon: Zap },
  { to: "/submit", label: "Submit", icon: Upload },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/admin", label: "Admin", icon: LayoutDashboard },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-void/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
            <Camera className="w-4 h-4 text-accent-glow" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            <span className="text-white">Vibe</span>
            <span className="text-gradient"> Snapshot</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-display font-medium transition-all duration-200",
                  active
                    ? "bg-accent/20 text-accent-glow border border-accent/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
