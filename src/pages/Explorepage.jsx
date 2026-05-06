import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* ─────────────────────────────────────────────────────────────────────────────
   EXPLORE PAGE — Vibrant college-student colors
   Purple  → creativity/ambition    Pink    → social/community
   Orange  → action/energy          Teal    → focus/resources
   Lime    → growth/learning        Amber   → warmth/study
   ───────────────────────────────────────────────────────────────────────────── */

const EXPLORE_LINKS = [
  { name: "Attendance", path: "/attendance", desc: "Bunk safe", emoji: "📅" },
  { name: "Rooms", path: "/rooms", desc: "Find PGs & roommates", emoji: "🏠" },
  { name: "Internships", path: "/Internships", desc: "Browse opportunities", emoji: "💼" },
  { name: "Chat", path: "/messages", desc: "Message classmates", emoji: "💬" },
  { name: "Confessions", path: "/confessions", desc: "Anonymous board", emoji: "🤫" },
  { name: "Course", path: "/course", desc: "Explore courses", emoji: "📚" },
  { name: "PYQS & Notes", path: "/resources", desc: "Study resources", emoji: "📝" },
  { name: "Assignments", path: "/assignments", desc: "Track deadlines", emoji: "✅", authType: "profile" },
  { name: "Feedback", path: "/feedback", desc: "Share thoughts", emoji: "💡", authType: "login" },
  { name: "Seller Dashboard", path: "/seller", desc: "Manage your shop", emoji: "🛍️", role: ["seller", "admin"] },
  { name: "Admin Dashboard", path: "/admin", desc: "Platform controls", emoji: "⚙️", role: ["admin"] },
];

// Top 4 hero cards — each with its own vibrant gradient
const TOP_LINKS = [
  {
    name: "Shop",
    path: "/buy-sell",
    desc: "Campus shop",
    emoji: "🛒",
    gradient: "linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)",
    shadow: "rgba(124,58,237,0.45)",
  },
  {
    name: "Rooms",
    path: "/rooms",
    desc: "Find PGs & roommates",
    emoji: "🏠",
    gradient: "linear-gradient(135deg, #0D9488 0%, #0891B2 100%)",
    shadow: "rgba(13,148,136,0.45)",
  },
  {
    name: "Attendance",
    path: "/attendance",
    desc: "Bunk calculator",
    emoji: "📅",
    gradient: "linear-gradient(135deg, #EA580C 0%, #D97706 100%)",
    shadow: "rgba(234,88,12,0.45)",
  },
  {
    name: "Chat",
    path: "/messages",
    desc: "Message classmates",
    emoji: "💬",
    gradient: "linear-gradient(135deg, #DB2777 0%, #EA580C 100%)",
    shadow: "rgba(219,39,119,0.45)",
  },
];

// Color accent palette for remaining grid cards (cycles through)
const CARD_ACCENTS = [
  { border: "#DDD6FE", bg: "#FAF5FF", text: "#6D28D9", dot: "#7C3AED" },
  { border: "#FBCFE8", bg: "#FDF2F8", text: "#BE185D", dot: "#DB2777" },
  { border: "#FED7AA", bg: "#FFF7ED", text: "#C2410C", dot: "#EA580C" },
  { border: "#A7F3D0", bg: "#ECFDF5", text: "#065F46", dot: "#059669" },
  { border: "#BAE6FD", bg: "#F0F9FF", text: "#075985", dot: "#0284C7" },
  { border: "#FEF08A", bg: "#FEFCE8", text: "#854D0E", dot: "#CA8A04" },
  { border: "#DDD6FE", bg: "#FAF5FF", text: "#6D28D9", dot: "#7C3AED" },
];

export default function ExplorePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const visible = EXPLORE_LINKS.filter(link => {
    if (link.role) return user && link.role.includes(user.role);
    return true;
  });

  const topLinkPaths = TOP_LINKS.map(l => l.path);
  const remainingLinks = visible.filter(l => !topLinkPaths.includes(l.path));

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleClick = (link) => {
    if (link.authType === "login" && !user) {
      showToast("Please login first to access this feature 🔒");
      return;
    }
    if (link.authType === "profile") {
      if (!user) { showToast("Please setup your profile first — add Branch, Year & Section 👤"); return; }
      if (!user.branch || !user.year || !user.section) {
        showToast("Please setup your profile first — add Branch, Year & Section 👤");
        return;
      }
    }
    navigate(link.path);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #4F46E5 0%, #7C3AED 22%, #C026D3 50%, #EA580C 78%, #FBBF24 100%)",
      fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
          zIndex: 9999, color: "#fff", fontSize: 13, fontWeight: 800,
          padding: "11px 20px", borderRadius: 6,
          background: "linear-gradient(135deg, #7C3AED, #DB2777)",
          boxShadow: "0 4px 24px rgba(109,40,217,0.5)",
          maxWidth: 320, textAlign: "center",
          border: "1.5px solid rgba(255,255,255,0.2)",
        }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px 100px" }}>

        {/* ── Section label ── */}
        <p style={{
          fontSize: 11, fontWeight: 900, letterSpacing: "0.18em",
          textTransform: "uppercase", marginBottom: 16, paddingLeft: 2,
          color: "rgba(255,255,255,0.7)",
        }}>
          Explore Campus
        </p>

        {/* ── Top Hero Cards ── */}
        <div style={{
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(16px)",
          border: "1.5px solid rgba(255,255,255,0.2)",
          borderRadius: 6,
          padding: 14,
          marginBottom: 20,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {TOP_LINKS.map(link => (
              <button
                key={link.name}
                onClick={() => handleClick(link)}
                style={{
                  background: link.gradient,
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "18px 16px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.18s",
                  boxShadow: `0 4px 20px ${link.shadow}`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 96,
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03) translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${link.shadow}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1) translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 20px ${link.shadow}`; }}
              >
                {/* Decorative circle */}
                <div style={{
                  position: "absolute", right: -16, top: -16,
                  width: 70, height: 70, borderRadius: "50%",
                  background: "rgba(255,255,255,0.12)",
                }} />
                <span style={{ fontSize: 26, lineHeight: 1, position: "relative", zIndex: 1 }}>{link.emoji}</span>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 2 }}>{link.name}</div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", margin: 0, fontWeight: 600 }}>{link.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Remaining Grid ── */}
        <p style={{
          fontSize: 11, fontWeight: 900, letterSpacing: "0.14em",
          textTransform: "uppercase", marginBottom: 12, paddingLeft: 2,
          color: "rgba(255,255,255,0.6)",
        }}>
          More Features
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {remainingLinks.map((link, i) => {
            const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
            return (
              <button
                key={link.name}
                onClick={() => handleClick(link)}
                style={{
                  background: "#ffffff",
                  border: `2px solid ${accent.border}`,
                  borderRadius: 6,
                  padding: "16px 14px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 6px 24px rgba(0,0,0,0.12)`;
                  e.currentTarget.style.borderColor = accent.dot;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
                  e.currentTarget.style.borderColor = accent.border;
                }}
              >
                {/* Colored top accent line */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0,
                  height: 3,
                  background: accent.dot,
                }} />
                <span style={{ fontSize: 22, lineHeight: 1 }}>{link.emoji || "→"}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0F0F23", marginBottom: 2 }}>{link.name}</div>
                  <p style={{ fontSize: 11, color: "#6B7280", margin: 0, fontWeight: 600 }}>{link.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}