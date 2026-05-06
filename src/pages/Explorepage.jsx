import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const EXPLORE_LINKS = [
  { name: "Attendance", path: "/attendance", desc: "Bunk safe" },
  { name: "Rooms", path: "/rooms", desc: "Find PGs & roommates" },
  { name: "Internships", path: "/Internships", desc: "Browse opportunities" },
  { name: "Chat", path: "/messages", desc: "Message classmates" },
  { name: "Confessions", path: "/confessions", desc: "Anonymous board" },
  { name: "Course", path: "/course", desc: "Explore courses" },
  { name: "PYQS & Notes", path: "/resources", desc: "Study resources" },
  { name: "Assignments", path: "/assignments", desc: "Track deadlines", authType: "profile" },
  { name: "Feedback", path: "/feedback", desc: "Share thoughts", authType: "login" },
  { name: "Seller Dashboard", path: "/seller", desc: "Manage your shop", role: ["seller", "admin"] },
  { name: "Admin Dashboard", path: "/admin", desc: "Platform controls", role: ["admin"] },
];

const TOP_LINKS = [
  { name: "Shop", path: "/buy-sell", desc: "Campus shop" },
  { name: "Rooms", path: "/rooms", desc: "Find PGs & roommates" },
  { name: "Attendance", path: "/attendance", desc: "Bunk safe" },
  { name: "Chat", path: "/messages", desc: "Message classmates" },
];

export default function ExplorePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const visible = EXPLORE_LINKS.filter(link => {
    if (link.role) return user && link.role.includes(user.role);
    return true;
  });

  const topLinkPaths = TOP_LINKS.map((link) => link.path);
  const remainingLinks = visible.filter((link) => !topLinkPaths.includes(link.path));

  const handleClick = (link) => {
    if (link.authType === "login" && !user) {
      setToast("Please login first to access this feature");
      setTimeout(() => setToast(null), 3000);
      return;
    }
    if (link.authType === "profile") {
      if (!user) {
        setToast("Please setup your profile first — add Branch, Year & Section");
        setTimeout(() => setToast(null), 3000);
        return;
      }
      if (!user.branch || !user.year || !user.section) {
        setToast("Please setup your profile first — add Branch, Year & Section");
        setTimeout(() => setToast(null), 3000);
        return;
      }
    }
    navigate(link.path);
  };

  return (
    <div className="min-h-full bg-white px-4 pt-6 pb-24 sm:pb-6">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl max-w-xs text-center"
          style={{ background: "#1D4ED8" }}>
          {toast}
        </div>
      )}

      <p className="text-xs font-semibold tracking-widest uppercase mb-5 px-1"
        style={{ color: "#1D4ED8" }}>
        Explore
      </p>

      {/* ── Top feature cards ── */}
      <div className="rounded-[26px] p-4 mb-6"
        style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe" }}>
        <div className="grid grid-cols-2 gap-3">
          {TOP_LINKS.map((link, i) => (
            <button
              key={link.name}
              onClick={() => handleClick(link)}
              className="group flex flex-col justify-between rounded-3xl p-4 text-left transition active:scale-95"
              style={{
                background: i % 2 === 0 ? "#1D4ED8" : "#FACC15",
                color: i % 2 === 0 ? "#fff" : "#111",
                border: "none",
                boxShadow: i % 2 === 0
                  ? "0 2px 12px rgba(29,78,216,0.25)"
                  : "0 2px 12px rgba(250,204,21,0.3)",
              }}
            >
              <div className="text-sm font-semibold">{link.name}</div>
              <p className="text-xs mt-2"
                style={{ color: i % 2 === 0 ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.55)" }}>
                {link.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Remaining links ── */}
      <div className="grid gap-3 sm:grid-cols-2">
        {remainingLinks.map((link) => (
          <button
            key={link.name}
            onClick={() => handleClick(link)}
            className="group flex flex-col justify-between rounded-3xl p-4 text-left transition active:scale-95"
            style={{
              background: "#fff",
              border: "1.5px solid #e0e7ff",
              boxShadow: "none",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "#1D4ED8";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(29,78,216,0.08)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "#e0e7ff";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div className="text-sm font-semibold" style={{ color: "#111" }}>{link.name}</div>
            <p className="text-xs mt-2" style={{ color: "#6b7280" }}>{link.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}