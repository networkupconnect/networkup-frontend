import React from 'react'
import NotificationBell from "../components/NotificationBell.jsx";
import { useAuth } from "../context/AuthContext";
import { NavLink } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────────────────────────
   NAVBAR  — Vibrant gradient, Nunito font, sharp corners
   Colors: Purple #6D28D9 · Pink #DB2777 · Orange #EA580C · White #FFFFFF
   ───────────────────────────────────────────────────────────────────────────── */

if (typeof document !== "undefined" && !document.getElementById("nu-gradient-style")) {
  const style = document.createElement("style");
  style.id = "nu-gradient-style";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

    :root {
      --vp: #6D28D9;
      --pk: #DB2777;
      --or: #EA580C;
      --yw: #D97706;
      --wh: #ffffff;
      --tx: #0F0F23;
    }

    /* ── Page gradient overlay (top wash) ── */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      height: 40vh;
      background: linear-gradient(
        180deg,
        rgba(109, 40, 217, 0.1) 0%,
        rgba(219, 39, 119, 0.05) 60%,
        transparent 100%
      );
      pointer-events: none;
      z-index: 0;
    }

    /* ── Navbar shell ── */
    .nu-nav {
      position: sticky;
      top: 0;
      z-index: 50;
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 35%, #C026D3 65%, #DB2777 100%);
      box-shadow: 0 2px 20px rgba(109, 40, 217, 0.4);
    }

    .nu-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* ── Logo ── */
    .nu-logo {
      font-family: 'Nunito', -apple-system, sans-serif;
      font-size: 19px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.6px;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 6px;
      line-height: 1;
      text-shadow: 0 1px 8px rgba(0,0,0,0.15);
    }

    /* Glowing yellow dot */
    .nu-logo::after {
      content: '';
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #FBBF24;
      margin-left: 2px;
      margin-bottom: 8px;
      flex-shrink: 0;
      box-shadow: 0 0 8px rgba(251,191,36,0.8), 0 0 16px rgba(251,191,36,0.4);
      animation: nu-pulse 2s ease-in-out infinite;
    }

    @keyframes nu-pulse {
      0%, 100% { box-shadow: 0 0 6px rgba(251,191,36,0.8), 0 0 12px rgba(251,191,36,0.4); }
      50% { box-shadow: 0 0 12px rgba(251,191,36,1), 0 0 24px rgba(251,191,36,0.6); }
    }

    /* ── Right actions ── */
    .nu-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* ── Login button — solid white on gradient ── */
    .nu-btn-login {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 6px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 800;
      font-family: 'Nunito', sans-serif;
      letter-spacing: 0.02em;
      background: rgba(255,255,255,0.18);
      color: #ffffff;
      border: 1.5px solid rgba(255,255,255,0.35);
      text-decoration: none;
      cursor: pointer;
      transition: all 0.15s;
      backdrop-filter: blur(8px);
    }
    .nu-btn-login:hover {
      background: rgba(255,255,255,0.28);
      border-color: rgba(255,255,255,0.6);
      transform: translateY(-1px);
      box-shadow: 0 3px 12px rgba(0,0,0,0.15);
    }
    .nu-btn-login:active { transform: scale(0.97); }

    /* ── Signup button — bright yellow filled ── */
    .nu-btn-signup {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 6px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 900;
      font-family: 'Nunito', sans-serif;
      letter-spacing: 0.02em;
      background: #FBBF24;
      color: #1a1200;
      border: none;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.15s;
      box-shadow: 0 2px 12px rgba(251,191,36,0.5);
    }
    .nu-btn-signup:hover {
      background: #FCD34D;
      box-shadow: 0 3px 20px rgba(251,191,36,0.7);
      transform: translateY(-1px) scale(1.03);
    }
    .nu-btn-signup:active { transform: scale(0.97); }

    /* ── Chat icon link ── */
    .nu-chat-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 6px;
      background: rgba(255,255,255,0.15);
      border: 1.5px solid rgba(255,255,255,0.2);
      transition: all 0.15s;
    }
    .nu-chat-link:hover {
      background: rgba(255,255,255,0.28);
      transform: translateY(-1px);
    }

    /* ── Profile avatar ── */
    .nu-avatar {
      width: 34px;
      height: 34px;
      border-radius: 6px;
      object-fit: cover;
      border: 2.5px solid rgba(255,255,255,0.6);
      display: block;
      transition: all 0.15s;
    }
    .nu-avatar:hover {
      border-color: #FBBF24;
      box-shadow: 0 0 0 3px rgba(251,191,36,0.4);
      transform: scale(1.06);
    }

    /* ── Notification bell override (make it white) ── */
    .nu-nav .notification-bell svg,
    .nu-nav .notification-bell path,
    .nu-nav .notification-bell circle {
      stroke: #ffffff !important;
    }

    @media (max-width: 639px) {
      .nu-hide-mobile { display: none !important; }
    }
    @media (min-width: 640px) {
      .nu-hide-desktop { display: none !important; }
    }
  `;
  document.head.appendChild(style);
}

export default function Navbar() {
  const { hasUnreadMessages, user } = useAuth();

  return (
    <nav className="nu-nav" aria-label="Main navigation">
      <div className="nu-inner">

        {/* ── Logo ── */}
        <NavLink to="/" className="nu-logo">
          NetworkUp
        </NavLink>

        {/* ── Right side ── */}
        <div className="nu-actions">
          {user ? (
            <>
              {/* Notification bell */}
              <NotificationBell />

              {/* Chat — mobile only */}
              <NavLink to="/messages" className="nu-chat-link nu-hide-desktop">
                <img src="/images/chat.svg" alt="Chat" style={{ width:20, height:20, filter:"brightness(0) invert(1)" }} />
              </NavLink>

              {/* Profile avatar — desktop only */}
              <NavLink to="/profile" className="nu-hide-mobile">
                <img
                  src={user?.profileImage || "/images/profile.svg"}
                  alt="Profile"
                  className="nu-avatar"
                />
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nu-btn-login">
                Login
              </NavLink>
              <NavLink to="/signup" className="nu-btn-signup">
                Sign Up ✨
              </NavLink>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}