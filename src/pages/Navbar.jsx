import React from 'react'
import NotificationBell from "../components/NotificationBell.jsx";
import { useAuth } from "../context/AuthContext";
import { NavLink } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────────────────────────
   NAVBAR — Solid purple, 44px, no dot, Nunito
   Purple #5B21B6 · Amber active #FBBF24
   ───────────────────────────────────────────────────────────────────────────── */

if (typeof document !== "undefined" && !document.getElementById("nu-gradient-style")) {
  const style = document.createElement("style");
  style.id = "nu-gradient-style";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

    /* ── Navbar shell ── */
    .nu-nav {
      position: sticky;
      top: 0;
      z-index: 50;
      background: #5B21B6;
      box-shadow: 0 2px 16px rgba(91,33,182,0.45);
    }

    .nu-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* ── Logo — no dot ── */
    .nu-logo {
      font-family: 'Nunito', -apple-system, sans-serif;
      font-size: 18px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.5px;
      text-decoration: none;
      display: flex;
      align-items: center;
      line-height: 1;
    }

    /* ── Right actions ── */
    .nu-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ── Login button ── */
    .nu-btn-login {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 5px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 800;
      font-family: 'Nunito', sans-serif;
      background: rgba(255,255,255,0.15);
      color: #ffffff;
      border: 1.5px solid rgba(255,255,255,0.3);
      text-decoration: none;
      cursor: pointer;
      transition: all 0.15s;
      backdrop-filter: blur(8px);
    }
    .nu-btn-login:hover {
      background: rgba(255,255,255,0.25);
      border-color: rgba(255,255,255,0.55);
    }

    /* ── Signup button — amber ── */
    .nu-btn-signup {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 5px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 900;
      font-family: 'Nunito', sans-serif;
      background: #FBBF24;
      color: #1a1200;
      border: none;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.15s;
      box-shadow: 0 2px 10px rgba(251,191,36,0.45);
    }
    .nu-btn-signup:hover {
      background: #FCD34D;
      box-shadow: 0 3px 18px rgba(251,191,36,0.65);
      transform: translateY(-1px);
    }

    /* ── Chat icon ── */
    .nu-chat-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(255,255,255,0.12);
      border: 1.5px solid rgba(255,255,255,0.18);
      transition: all 0.15s;
    }
    .nu-chat-link:hover { background: rgba(255,255,255,0.22); }

    /* ── Profile avatar ── */
    .nu-avatar {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      object-fit: cover;
      border: 2px solid rgba(255,255,255,0.5);
      display: block;
      transition: all 0.15s;
    }
    .nu-avatar:hover {
      border-color: #FBBF24;
      box-shadow: 0 0 0 3px rgba(251,191,36,0.35);
    }

    @media (max-width: 639px) { .nu-hide-mobile { display: none !important; } }
    @media (min-width: 640px) { .nu-hide-desktop { display: none !important; } }
  `;
  document.head.appendChild(style);
}

export default function Navbar() {
  const { hasUnreadMessages, user } = useAuth();

  return (
    <nav className="nu-nav" aria-label="Main navigation">
      <div className="nu-inner">
        <NavLink to="/" className="nu-logo">NetworkUp</NavLink>
        <div className="nu-actions">
          {user ? (
            <>
              <NotificationBell />
              <NavLink to="/messages" className="nu-chat-link nu-hide-desktop">
                <img src="/images/chat.svg" alt="Chat" style={{ width:18, height:18, filter:"brightness(0) invert(1)" }} />
              </NavLink>
              <NavLink to="/profile" className="nu-hide-mobile">
                <img src={user?.profileImage || "/images/profile.svg"} alt="Profile" className="nu-avatar" />
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nu-btn-login">Login</NavLink>
              <NavLink to="/signup" className="nu-btn-signup">Sign Up</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}