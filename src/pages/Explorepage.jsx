import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* ─────────────────────────────────────────────────────────────────────────────
   EXPLORE — Vibrant Brutalist
   Zero border-radius. Solid vibrant blocks. White borders. No emojis.
   Each card is a bold color slab — college students stop scrolling for this.
   ───────────────────────────────────────────────────────────────────────────── */

const EXPLORE_LINKS = [
  { name: "Attendance", path: "/attendance", desc: "Bunk safe" },
  { name: "Rooms", path: "/rooms", desc: "Find PGs & roommates" },
  { name: "Chat", path: "/messages", desc: "Message classmates" },
  { name: "Confessions", path: "/confessions", desc: "Anonymous board" },
  { name: "Course", path: "/course", desc: "Explore courses" },
  { name: "PYQS & Notes", path: "/resources", desc: "Study resources" },
  { name: "Assignments", path: "/assignments", desc: "Track deadlines", authType: "profile" },
  { name: "Feedback", path: "/feedback", desc: "Share thoughts", authType: "login" },
  { name: "Seller Dashboard", path: "/seller", desc: "Manage your shop", role: ["seller", "admin"] },
  { name: "Admin Dashboard", path: "/admin", desc: "Platform controls", role: ["admin"] },
];

/* Hero cards — solid vibrant fills, zero radius */
const TOP_LINKS = [
  { name: "Shop",        path: "/buy-sell",    desc: "Campus marketplace",  bg: "#7C3AED", fg: "#fff",    border: "#5B21B6" },
  { name: "Rooms",       path: "/rooms",       desc: "PGs and roommates",   bg: "#0D9488", fg: "#fff",    border: "#0F766E" },
  { name: "Attendance",  path: "/attendance",  desc: "Bunk calculator",     bg: "#EA580C", fg: "#fff",    border: "#C2410C" },
  { name: "Chat",        path: "/messages",    desc: "Message classmates",  bg: "#DB2777", fg: "#fff",    border: "#BE185D" },
];

/* Solid color blocks for secondary grid — alternating palette */
const GRID_COLORS = [
  { bg: "#EDE9FE", fg: "#4C1D95", border: "#7C3AED", accent: "#7C3AED" },
  { bg: "#FCE7F3", fg: "#831843", border: "#DB2777", accent: "#DB2777" },
  { bg: "#FFF7ED", fg: "#7C2D12", border: "#EA580C", accent: "#EA580C" },
  { bg: "#F0FDFA", fg: "#134E4A", border: "#0D9488", accent: "#0D9488" },
  { bg: "#FEFCE8", fg: "#713F12", border: "#D97706", accent: "#D97706" },
  { bg: "#F5F3FF", fg: "#3730A3", border: "#4F46E5", accent: "#4F46E5" },
  { bg: "#FDF2F8", fg: "#701A75", border: "#C026D3", accent: "#C026D3" },
];

export default function ExplorePage() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [toast, setToast] = useState(null);

  const visible = EXPLORE_LINKS.filter(link => {
    if (link.role) return user && link.role.includes(user.role);
    return true;
  });

  const topPaths = TOP_LINKS.map(l => l.path);
  const remaining = visible.filter(l => !topPaths.includes(l.path));

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleClick = (link) => {
    if (link.authType === "login" && !user) {
      showToast("Please login first to access this feature");
      return;
    }
    if (link.authType === "profile") {
      if (!user || !user.branch || !user.year || !user.section) {
        showToast("Please setup your profile first — add Branch, Year and Section");
        return;
      }
    }
    navigate(link.path);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #3730A3 0%, #6D28D9 28%, #BE185D 58%, #EA580C 82%, #D97706 100%)",
      fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>

      {/* Toast — solid, zero radius */}
      {toast && (
        <div style={{
          position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
          zIndex: 9999, color: "#fff", fontSize: 13, fontWeight: 800,
          padding: "11px 20px",
          background: "#7C3AED",
          maxWidth: 320, textAlign: "center",
          border: "2px solid rgba(255,255,255,0.3)",
        }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 10px 100px" }}>

        {/* Section label */}
        <p style={{
          fontSize: 10, fontWeight: 900, letterSpacing: "0.22em",
          textTransform: "uppercase", marginBottom: 12, paddingLeft: 2,
          color: "rgba(255,255,255,0.65)",
        }}>
          Campus Features
        </p>

        {/* Hero grid — 2 cols, solid color slabs, zero radius, white borders */}
        <div style={{
          border: "2px solid rgba(255,255,255,0.25)",
          padding: 10,
          marginBottom: 12,
          background: "rgba(0,0,0,0.15)",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {TOP_LINKS.map(link => (
              <button
                key={link.name}
                onClick={() => handleClick(link)}
                style={{
                  background: link.bg,
                  color: link.fg,
                  border: `2px solid ${link.border}`,
                  borderRadius: 0,
                  padding: "20px 16px 16px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "filter 0.12s, transform 0.12s",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  minHeight: 100,
                  position: "relative",
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {/* Top-left label */}
                <div style={{
                  position: "absolute", top: 0, left: 0,
                  background: "rgba(0,0,0,0.18)",
                  padding: "3px 10px",
                  fontSize: 9, fontWeight: 900, letterSpacing: "0.16em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.85)",
                }}>
                  Feature
                </div>
                <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 3, letterSpacing: "-0.02em" }}>{link.name}</div>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", margin: 0, fontWeight: 600 }}>{link.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Section label */}
        <p style={{
          fontSize: 10, fontWeight: 900, letterSpacing: "0.18em",
          textTransform: "uppercase", marginBottom: 10, paddingLeft: 2,
          color: "rgba(255,255,255,0.55)",
        }}>
          More
        </p>

        {/* Secondary grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {remaining.map((link, i) => {
            const c = GRID_COLORS[i % GRID_COLORS.length];
            return (
              <button
                key={link.name}
                onClick={() => handleClick(link)}
                style={{
                  background: "#ffffff",
                  border: `2px solid ${c.border}`,
                  borderRadius: 0,
                  borderLeft: `4px solid ${c.accent}`,
                  padding: "14px 12px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "background 0.12s, transform 0.12s",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = c.bg; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ fontSize: 13, fontWeight: 900, color: "#0F0F23", letterSpacing: "-0.01em" }}>{link.name}</div>
                <p style={{ fontSize: 11, color: "#6B7280", margin: 0, fontWeight: 600 }}>{link.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}