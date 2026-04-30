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
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl border border-zinc-700 max-w-xs text-center">
          {toast}
        </div>
      )}

      <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-5 px-1">
        Explore
      </p>

      <div className="rounded-[26px] border border-sky-200 bg-sky-50 p-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          {TOP_LINKS.map((link) => (
            <button
              key={link.name}
              onClick={() => handleClick(link)}
              className="group flex flex-col justify-between rounded-3xl bg-sky-600 p-4 text-left text-white transition hover:bg-sky-700 active:scale-95"
            >
              <div className="text-sm font-semibold">{link.name}</div>
              <p className="text-xs text-sky-100 mt-2">{link.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {remainingLinks.map((link) => (
          <button
            key={link.name}
            onClick={() => handleClick(link)}
            className="group flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-4 text-left transition hover:border-gray-300 active:scale-95"
          >
            <div className="text-sm font-semibold text-gray-900">{link.name}</div>
            <p className="text-xs text-gray-500 mt-2">{link.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}