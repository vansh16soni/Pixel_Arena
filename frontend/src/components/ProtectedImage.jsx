import { useEffect, useRef } from "react";

export default function ProtectedImage({ src, alt, className, teamName }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Block right-click on the container
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Block screenshot keyboard shortcuts
    const handleKeyDown = (e) => {
      // Block PrintScreen
      if (e.key === "PrintScreen") {
        e.preventDefault();
        // Clear clipboard
        navigator.clipboard?.writeText("").catch(() => {});
        showWarning();
        return false;
      }

      // Block Ctrl+S (Save)
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        showWarning();
        return false;
      }

      // Block Ctrl+P (Print)
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        showWarning();
        return false;
      }

      // Block Ctrl+Shift+S
      if (e.ctrlKey && e.shiftKey && e.key === "S") {
        e.preventDefault();
        showWarning();
        return false;
      }

      // Block F12 (DevTools - can use screenshot)
      if (e.key === "F12") {
        e.preventDefault();
        showWarning();
        return false;
      }

      // Block Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault();
        showWarning();
        return false;
      }

      // Block Ctrl+U (View Source)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
        return false;
      }
    };

    // Block drag start
    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    const el = containerRef.current;
    if (el) {
      el.addEventListener("contextmenu", handleContextMenu);
      el.addEventListener("dragstart", handleDragStart);
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      if (el) {
        el.removeEventListener("contextmenu", handleContextMenu);
        el.removeEventListener("dragstart", handleDragStart);
      }
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function showWarning() {
    const existing = document.getElementById("screenshot-warning");
    if (existing) return;

    const warning = document.createElement("div");
    warning.id = "screenshot-warning";
    warning.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #ff3b5c;
      color: white;
      padding: 12px 24px;
      border-radius: 12px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      font-weight: bold;
      z-index: 999999;
      box-shadow: 0 0 30px rgba(255,59,92,0.5);
      animation: fadeIn 0.2s ease;
    `;
    warning.textContent = "⚠️ Screenshot protection active";
    document.body.appendChild(warning);
    setTimeout(() => warning.remove(), 2500);
  }

  return (
    <div
      ref={containerRef}
      className="protected-zone relative select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Invisible overlay blocks clicks/drags on image */}
      <div
        className="absolute inset-0 z-10"
        style={{ cursor: "not-allowed" }}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />

      {/* Watermark — shows team name so screenshots are traceable */}
      {teamName && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none select-none"
          style={{ opacity: 0.12 }}
        >
          <span
            className="font-display font-bold text-white text-4xl rotate-[-35deg] whitespace-nowrap"
            style={{
              textShadow: "0 0 10px rgba(255,255,255,0.5)",
              letterSpacing: "0.1em",
            }}
          >
            {teamName} — VIBE SNAPSHOT
          </span>
        </div>
      )}

      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        className={`${className} protected-image select-none`}
        draggable="false"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        style={{ pointerEvents: "none", userSelect: "none" }}
      />
    </div>
  );
}