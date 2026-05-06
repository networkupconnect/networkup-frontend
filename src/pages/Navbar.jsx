import React from 'react'
import NotificationBell from "../components/NotificationBell.jsx";
import { useAuth } from "../context/AuthContext";
import { NavLink } from 'react-router-dom';

// ── Blue-to-transparent gradient overlay injected once into <head> ────────────
if (typeof document !== "undefined" && !document.getElementById("nu-gradient-style")) {
  const style = document.createElement("style");
  style.id = "nu-gradient-style";
  style.textContent = `
    /* 60:30:10 — white : #1D4ED8 blue : #FACC15 yellow */
    :root {
      --nu-blue:   #1D4ED8;
      --nu-yellow: #FACC15;
      --nu-white:  #ffffff;
    }

    /* Page-level blue gradient — covers top 30% of every page */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      height: 30vh;
      background: linear-gradient(
        180deg,
        rgba(29, 78, 216, 0.13) 0%,
        rgba(29, 78, 216, 0.07) 60%,
        transparent 100%
      );
      pointer-events: none;
      z-index: 0;
    }

    /* Navbar shell */
    .nu-nav {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-bottom: 1.5px solid rgba(29, 78, 216, 0.12);
      box-shadow: 0 1px 8px rgba(29, 78, 216, 0.08);
    }

    .nu-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* Logo */
    .nu-logo {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 17px;
      font-weight: 800;
      color: var(--nu-blue);
      letter-spacing: -0.5px;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 5px;
      line-height: 1;
    }

    /* Small accent dot after logo */
    .nu-logo::after {
      content: '';
      display: inline-block;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--nu-yellow);
      margin-left: 1px;
      margin-bottom: 6px;
      flex-shrink: 0;
    }

    /* Right actions row */
    .nu-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* Login button — yellow filled */
    .nu-btn-login {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 5px 14px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      font-family: inherit;
      letter-spacing: 0.01em;
      background: var(--nu-yellow);
      color: #1a1a00;
      border: 1.5px solid rgba(0,0,0,0.08);
      text-decoration: none;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
      box-shadow: 0 1px 4px rgba(250, 204, 21, 0.35);
    }
    .nu-btn-login:hover {
      background: #fbbf24;
      box-shadow: 0 2px 10px rgba(250, 204, 21, 0.45);
      transform: translateY(-1px);
    }
    .nu-btn-login:active { transform: scale(0.97); }

    /* Signup button — yellow outlined */
    .nu-btn-signup {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 5px 14px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      font-family: inherit;
      letter-spacing: 0.01em;
      background: var(--nu-yellow);
      color: #1a1a00;
      border: 1.5px solid rgba(0,0,0,0.08);
      text-decoration: none;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
      box-shadow: 0 1px 4px rgba(250, 204, 21, 0.35);
    }
    .nu-btn-signup:hover {
      background: #fbbf24;
      box-shadow: 0 2px 10px rgba(250, 204, 21, 0.45);
      transform: translateY(-1px);
    }
    .nu-btn-signup:active { transform: scale(0.97); }

    /* Chat icon link */
    .nu-chat-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      transition: background 0.15s;
    }
    .nu-chat-link:hover { background: rgba(29, 78, 216, 0.08); }

    /* Profile avatar */
    .nu-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--nu-blue);
      display: block;
      transition: box-shadow 0.15s, transform 0.15s;
    }
    .nu-avatar:hover {
      box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.2);
      transform: scale(1.05);
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
              {/* Notification bell (unchanged — uses its own styles) */}
              <NotificationBell />

              {/* Chat — mobile only */}
              <NavLink to="/messages" className="nu-chat-link nu-hide-desktop">
                <img src="/images/chat.svg" alt="Chat" style={{ width: 20, height: 20 }} />
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
                Sign Up
              </NavLink>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}