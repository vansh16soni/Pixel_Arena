import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SubmitPage from "./pages/SubmitPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <div className="min-h-screen grid-bg">
      <div className="fixed inset-0 bg-gradient-radial pointer-events-none" 
           style={{background: "radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.05) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,245,196,0.03) 0%, transparent 50%)"}} />
      <Navbar />
      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#13131a",
            color: "#e2e8f0",
            border: "1px solid #1e1e2e",
            fontFamily: "'DM Sans', sans-serif",
          },
          success: { iconTheme: { primary: "#00f5c4", secondary: "#060608" } },
          error: { iconTheme: { primary: "#ff3b5c", secondary: "#060608" } },
        }}
      />
    </div>
  );
}
