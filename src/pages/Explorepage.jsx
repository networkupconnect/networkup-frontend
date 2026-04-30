import React, { useEffect, useState } from "react";
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

const MOBILE_TOP_LINKS = [
  { name: "Resources", path: "/resources", desc: "Study resources" },
  { name: "Rooms", path: "/rooms", desc: "Find PGs & roommates" },
  { name: "Attendance", path: "/attendance", desc: "Bunk safe" },
  { name: "Chat", path: "/messages", desc: "Message classmates" },
];

export default function ExplorePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const visible = EXPLORE_LINKS.filter(link => {
    if (link.role) return user && link.role.includes(user.role);
    return true;
  });

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

      <div className="rounded-[26px] border border-gray-200 bg-gray-50 p-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          {(isMobile ? MOBILE_TOP_LINKS : TOP_LINKS).map((link) => (
            <button
              key={link.name}
              onClick={() => handleClick(link)}
              className="group flex flex-col justify-between rounded-3xl border border-transparent bg-white p-4 text-left transition hover:border-gray-200 active:scale-95"
            >
              <div className="text-sm font-semibold text-gray-900">{link.name}</div>
              <p className="text-xs text-gray-500 mt-2">{link.desc}</p>
              {link.name === "Resources" && (
                <span className="mt-3 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-gray-100">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 4H19C20.1046 4 21 4.89543 21 6V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V6C3 4.89543 3.89543 4 5 4Z" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 10H16" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M8 14H14" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {visible.map((link) => (
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