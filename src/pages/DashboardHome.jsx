import { useEffect, useRef, useState, useMemo, useCallback, memo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { usePosts } from "../context/PostsContext";

/* ─────────────────────────────────────────────────────────────────────────────
   COLOR SYSTEM  (Psychology-tuned for college students)
   Purple  #6D28D9 → ambition, creativity, innovation
   Pink    #DB2777 → social energy, excitement, connection
   Orange  #EA580C → confidence, action, CTA punch
   Teal    #0D9488 → clarity, focus, trust
   Lime    #65A30D → growth, progress, success
   Amber   #D97706 → warmth, stars, celebration
   ───────────────────────────────────────────────────────────────────────────── */

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

  @keyframes spin     { to { transform:rotate(360deg) } }
  @keyframes shimmer  { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
  @keyframes fadeIn   { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
  @keyframes slideUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(219,39,119,0.35)} 70%{box-shadow:0 0 0 10px rgba(219,39,119,0)} 100%{box-shadow:0 0 0 0 rgba(219,39,119,0)} }

  /* ── Page shell ── */
  .dh-wrap  { display:flex; min-height:100vh; background: linear-gradient(160deg,#4F46E5 0%,#7C3AED 22%,#C026D3 50%,#EA580C 78%,#FBBF24 100%); }
  .dh-feed  { width:100%; overflow-y:auto; padding-bottom:80px; }
  @media(min-width:640px){
    .dh-wrap { padding:16px; gap:14px; }
    .dh-feed { width:530px; flex-shrink:0; }
  }

  /* ── Skeleton ── */
  .sk { background:linear-gradient(90deg,rgba(255,255,255,0.15) 25%,rgba(255,255,255,0.3) 50%,rgba(255,255,255,0.15) 75%); background-size:600px 100%; animation:shimmer 1.4s ease infinite; border-radius:4px; }
  .sk-card { background:rgba(255,255,255,0.12); border-bottom:1.5px solid rgba(255,255,255,0.15); padding:16px 14px; }
  .sk-compose { background:rgba(255,255,255,0.15); border-radius:6px; padding:14px; margin:10px 10px 6px; }

  /* ── Compose box ── */
  .compose {
    background:#ffffff; border-radius:6px; padding:14px;
    margin:10px 10px 6px;
    border-left:4px solid #7C3AED;
    box-shadow:0 4px 24px rgba(109,40,217,0.2);
    animation:slideUp 0.4s ease;
  }
  .compose-ta {
    width:100%; background:#FAF5FF; border:1.5px solid #DDD6FE;
    outline:none; border-radius:6px; padding:10px 16px;
    font-size:14px; color:#1e1b4b; resize:none; overflow:hidden;
    min-height:40px; box-sizing:border-box; font-family:'Nunito',sans-serif; font-weight:600;
  }
  .compose-ta:focus { border-color:#7C3AED; box-shadow:0 0 0 3px rgba(124,58,237,0.12); }
  .compose-ta::placeholder { color:#a78bfa; }
  .compose-preview { margin-top:10px; display:flex; align-items:center; gap:10px; padding:8px 10px; background:#FAF5FF; border-radius:6px; border:1px solid #DDD6FE; }
  .compose-preview img,.compose-preview video { width:58px; height:58px; object-fit:cover; border-radius:4px; }
  .compose-preview-rm { font-size:12px; color:#DB2777; background:none; border:none; cursor:pointer; font-weight:700; }
  .compose-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:10px; }
  .compose-img-btn {
    width:36px; height:36px; border-radius:6px;
    background:linear-gradient(135deg,#EDE9FE,#FCE7F3);
    border:1.5px solid #DDD6FE;
    display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.15s;
  }
  .compose-img-btn:hover { transform:scale(1.08); box-shadow:0 2px 10px rgba(124,58,237,0.25); }
  .compose-send {
    width:36px; height:36px; border-radius:6px;
    background:linear-gradient(135deg,#7C3AED,#DB2777);
    border:none; display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:all 0.15s;
    box-shadow:0 2px 12px rgba(109,40,217,0.4);
  }
  .compose-send:hover { transform:scale(1.08) translateY(-1px); box-shadow:0 4px 20px rgba(109,40,217,0.5); }
  .compose-send:disabled { opacity:0.35; cursor:not-allowed; transform:none; }
  .compose-spinner { width:13px; height:13px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.6s linear infinite; }

  /* ── Feed card (post) — SHARP CORNERS ── */
  .fc {
    background:#ffffff; border-bottom:1.5px solid rgba(109,40,217,0.08);
    padding:16px 14px 14px;
    transition:transform 0.15s;
    border-left:3px solid transparent;
  }
  .fc:hover { border-left-color:#7C3AED; }

  .fc-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:11px; }
  .fc-who { display:flex; align-items:center; gap:12px; flex:1; min-width:0; }
  .fc-clk { display:flex; align-items:center; gap:12px; cursor:pointer; }
  .fc-av { width:42px; height:42px; border-radius:6px; object-fit:cover; border:2px solid #7C3AED; flex-shrink:0; display:block; }
  .fc-av-fb {
    width:42px; height:42px; border-radius:6px;
    background:linear-gradient(135deg,#7C3AED,#DB2777);
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .fc-av-fb span { color:#fff; font-size:14px; font-weight:800; font-family:'Nunito',sans-serif; }
  .fc-name { font-size:13px; font-weight:800; color:#1e1b4b; line-height:1.2; font-family:'Nunito',sans-serif; }
  .fc-sub  { font-size:11px; color:#a78bfa; margin-top:1px; font-weight:600; }

  .fc-img-wrap { padding-left:54px; margin-bottom:10px; }
  .fc-img  { max-width:100%; max-height:320px; object-fit:contain; border-radius:6px; display:block; cursor:zoom-in; background:#FAF5FF; border:1.5px solid #EDE9FE; }
  .fc-body { padding-left:54px; }
  .fc-caption { font-size:13.5px; color:#1e1b4b; line-height:1.6; margin-bottom:10px; white-space:pre-wrap; font-weight:600; font-family:'Nunito',sans-serif; }
  .fc-actions { display:flex; gap:18px; }
  .fc-act-btn { display:flex; align-items:center; gap:6px; background:none; border:none; cursor:pointer; padding:4px 8px; border-radius:6px; transition:background 0.15s; }
  .fc-act-btn:hover { background:rgba(109,40,217,0.07); }
  .fc-act-btn:disabled { cursor:default; }
  .fc-act-count { font-size:12px; color:#7C3AED; font-weight:700; }
  .fc-act-count.liked { color:#DB2777; }
  .del-btn { font-size:11px; color:#a78bfa; background:none; border:none; cursor:pointer; padding:4px 8px; border-radius:4px; flex-shrink:0; font-weight:700; }
  .del-btn:hover { color:#EA580C; background:#FFF7ED; }

  /* ── Comments ── */
  .cmt-wrap { margin-top:11px; background:#FAF5FF; border-radius:6px; overflow:hidden; border:1.5px solid #EDE9FE; }
  .cmt-list { padding:10px 12px; max-height:180px; overflow-y:auto; display:flex; flex-direction:column; gap:7px; }
  .cmt-row  { display:flex; align-items:flex-start; gap:7px; }
  .cmt-mini-av {
    width:24px; height:24px; border-radius:4px;
    background:linear-gradient(135deg,#7C3AED,#DB2777);
    display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; overflow:hidden;
  }
  .cmt-mini-av span { font-size:10px; font-weight:800; color:#fff; }
  .cmt-mini-av-img { width:24px; height:24px; object-fit:cover; }
  .cmt-bubble { background:#fff; border-radius:4px; border-top-left-radius:2px; padding:6px 11px; border:1.5px solid #EDE9FE; max-width:85%; }
  .cmt-author { font-size:11px; font-weight:800; color:#7C3AED; margin-right:5px; font-family:'Nunito',sans-serif; }
  .cmt-text   { font-size:11px; color:#4B5563; font-weight:600; }
  .cmt-empty  { text-align:center; font-size:11px; color:#a78bfa; padding:6px 0; font-weight:600; }
  .cmt-form   { display:flex; align-items:center; gap:7px; padding:8px 11px; border-top:1.5px solid #EDE9FE; background:#fff; }
  .cmt-in {
    flex:1; background:#FAF5FF; border:1.5px solid transparent;
    outline:none; border-radius:4px; padding:7px 13px;
    font-size:12px; color:#1e1b4b; font-family:'Nunito',sans-serif; font-weight:600;
  }
  .cmt-in:focus { border-color:#7C3AED; }
  .cmt-in::placeholder { color:#c4b5fd; }
  .cmt-send {
    width:28px; height:28px; border-radius:6px;
    background:linear-gradient(135deg,#7C3AED,#DB2777);
    border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0;
    transition:all 0.15s;
  }
  .cmt-send:hover { transform:scale(1.1); box-shadow:0 2px 10px rgba(109,40,217,0.4); }
  .cmt-send:disabled { opacity:0.3; cursor:not-allowed; }
  .cmt-login { text-align:center; font-size:11px; color:#a78bfa; padding:8px 0; border-top:1.5px solid #EDE9FE; font-weight:700; }

  /* ── Project card ── */
  .fc-cover { width:100%; max-height:220px; object-fit:contain; border-radius:6px; display:block; margin-bottom:10px; cursor:zoom-in; background:#FAF5FF; border:1.5px solid #EDE9FE; }
  .fc-proj-title  { font-size:15px; font-weight:800; color:#1e1b4b; margin-bottom:3px; font-family:'Nunito',sans-serif; }
  .fc-proj-tline  { font-size:12px; color:#DB2777; margin-bottom:6px; font-weight:700; }
  .fc-proj-desc   { font-size:13px; color:#4B5563; line-height:1.55; margin-bottom:8px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; font-weight:600; }
  .fc-tags { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:9px; }
  .fc-tag  { font-size:11px; padding:3px 9px; border-radius:4px; background:linear-gradient(135deg,#EDE9FE,#FCE7F3); border:1.5px solid #DDD6FE; color:#7C3AED; font-family:monospace; font-weight:700; }
  .fc-links { display:flex; gap:14px; padding-top:9px; border-top:1.5px solid #F5F3FF; margin-bottom:3px; }
  .fc-link  { font-size:12px; font-weight:700; color:#4B5563; text-decoration:none; font-family:'Nunito',sans-serif; }
  .fc-link.primary { color:#7C3AED; }
  .fc-link:hover { color:#DB2777; }

  /* ── Badges ── */
  .badge { font-size:10px; font-weight:800; padding:3px 10px; border-radius:4px; font-family:'Nunito',sans-serif; flex-shrink:0; letter-spacing:0.04em; text-transform:uppercase; }
  .badge-completed   { background:#DCFCE7; color:#16A34A; border:1.5px solid #86EFAC; }
  .badge-in-progress { background:#FEF9C3; color:#CA8A04; border:1.5px solid #FDE047; }
  .badge-idea        { background:#EDE9FE; color:#7C3AED; border:1.5px solid #DDD6FE; }
  .badge-done        { background:#DCFCE7; color:#16A34A; border:1.5px solid #86EFAC; }

  /* ── Stars ── */
  .stars { display:flex; align-items:center; gap:4px; margin-top:10px; }
  .star  { background:none; border:none; cursor:pointer; font-size:17px; padding:0; line-height:1; transition:transform 0.1s; }
  .star:hover { transform:scale(1.2); }
  .star.off { color:#EDE9FE; }
  .star.on  { color:#D97706; filter:drop-shadow(0 0 4px rgba(217,119,6,0.5)); }
  .star-avg { font-size:11px; color:#a78bfa; margin-left:4px; font-weight:700; }

  /* ── Target card ── */
  .tc-tl-body { flex:1; background:#fff; border:1.5px solid #EDE9FE; border-radius:6px; padding:10px 12px; border-left:3px solid #7C3AED; }
  .tc-complete-tag { font-size:10px; font-weight:800; color:#16A34A; font-family:'Nunito',sans-serif; letter-spacing:0.06em; text-transform:uppercase; display:block; margin-bottom:4px; }
  .tc-p-text { font-size:13px; color:#374151; line-height:1.5; font-weight:600; }
  .tc-p-link { font-size:11px; color:#7C3AED; text-decoration:none; word-break:break-all; display:block; margin-top:4px; font-weight:700; }
  .tc-p-img  { max-width:110px; max-height:80px; object-fit:cover; border-radius:4px; border:1.5px solid #EDE9FE; display:block; margin-top:6px; cursor:zoom-in; }
  .tc-toggle-btn { font-size:11px; color:#DB2777; background:none; border:none; cursor:pointer; padding:0; margin-bottom:6px; font-weight:800; font-family:'Nunito',sans-serif; }
  .tc-expand-list { display:flex; flex-direction:column; gap:6px; margin-bottom:7px; }

  /* ── Video ── */
  .fc-video-wrap { margin-bottom:10px; }
  .fc-video-native { width:100%; height:auto; display:block; border-radius:6px; background:#0F0F23; }

  /* ── Empty state ── */
  .feed-empty { text-align:center; padding:72px 0; color:rgba(255,255,255,0.7); font-size:14px; font-weight:700; font-family:'Nunito',sans-serif; }

  /* ── Sidebar ── */
  .dh-sidebar { display:none; }
  @media(min-width:640px){
    .dh-sidebar {
      display:block; flex:1;
      background:rgba(255,255,255,0.12);
      backdrop-filter:blur(20px);
      border-radius:6px;
      height:calc(100vh - 32px);
      position:sticky; top:16px;
      border:1.5px solid rgba(255,255,255,0.2);
    }
  }

  /* ── Lightbox ── */
  .lightbox-overlay {
    position:fixed; inset:0; z-index:9999;
    background:rgba(15,15,35,0.96);
    display:flex; align-items:center; justify-content:center;
    cursor:zoom-out; animation:fadeIn 0.18s ease;
  }
  .lightbox-img { max-width:94vw; max-height:92vh; object-fit:contain; border-radius:6px; box-shadow:0 12px 60px rgba(109,40,217,0.4); cursor:default; }
  .lightbox-close {
    position:fixed; top:18px; right:22px;
    background:rgba(109,40,217,0.5); border:none; color:#fff;
    width:40px; height:40px; border-radius:6px; font-size:20px;
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    backdrop-filter:blur(8px); font-family:'Nunito',sans-serif; font-weight:800;
  }
  .lightbox-close:hover { background:rgba(219,39,119,0.7); }

  /* ── Birthday Banner ── */
  @keyframes bdaySlideIn { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes bdayFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes bdayShimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }

  .bday-wrap { margin:10px 10px 0; animation:bdaySlideIn 0.55s cubic-bezier(0.34,1.56,0.64,1); }
  .bday-banner {
    position:relative; overflow:hidden;
    background:linear-gradient(135deg,#FEF9C3 0%,#FCE7F3 45%,#EDE9FE 100%);
    border:2px solid #FBBF24;
    border-radius:6px;
    padding:16px 18px;
    display:flex; align-items:center; gap:14px;
    box-shadow:0 6px 28px rgba(217,119,6,0.25), 0 2px 8px rgba(109,40,217,0.15);
  }
  .bday-banner::after {
    content:''; position:absolute; top:0; left:-60%; width:40%; height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent);
    animation:bdayShimmer 3.5s ease-in-out infinite;
    background-size:400px 100%;
  }
  .bday-cake { font-size:36px; animation:bdayFloat 2.2s ease-in-out infinite; flex-shrink:0; position:relative; z-index:1; filter:drop-shadow(0 3px 8px rgba(217,119,6,0.5)); }
  .bday-body { flex:1; min-width:0; position:relative; z-index:1; }
  .bday-label { font-size:9px; font-weight:900; letter-spacing:0.15em; text-transform:uppercase; color:#7C3AED; font-family:'Nunito',sans-serif; margin-bottom:4px; }
  .bday-names { font-size:16px; font-weight:900; color:#1e1b4b; letter-spacing:-0.03em; line-height:1.25; font-family:'Nunito',sans-serif; }
  .bday-msg { font-size:12px; color:#DB2777; margin-top:4px; font-style:italic; line-height:1.4; font-weight:700; }
  .bday-icons { display:flex; flex-direction:column; gap:3px; flex-shrink:0; position:relative; z-index:1; }
  .bday-icons span:nth-child(1) { font-size:20px; animation:bdayFloat 1.9s ease-in-out infinite; }
  .bday-icons span:nth-child(2) { font-size:18px; animation:bdayFloat 2.4s ease-in-out infinite 0.5s; }
  .bday-icons span:nth-child(3) { font-size:16px; animation:bdayFloat 2s ease-in-out infinite 0.25s; }
`;

if (typeof document !== "undefined" && !document.getElementById("dh-styles")) {
  const el = document.createElement("style");
  el.id = "dh-styles";
  el.textContent = STYLES;
  document.head.appendChild(el);
}

const fmtDate = (d) => {
  const ms = Date.now() - new Date(d);
  const m = Math.floor(ms / 6e4), h = Math.floor(ms / 36e5), dy = Math.floor(ms / 864e5);
  if (m < 1) return "now"; if (m < 60) return `${m}m`; if (h < 24) return `${h}h`; if (dy < 7) return `${dy}d`;
  return new Date(d).toLocaleDateString();
};

const badgeClass = (s) => `badge ${s === "completed" ? "badge-completed" : s === "in-progress" ? "badge-in-progress" : "badge-idea"}`;
const badgeLabel = (s) => s === "in-progress" ? "In Progress" : s === "completed" ? "Completed" : "Idea";

// ── Confetti Canvas ───────────────────────────────────────────────────────────
const ConfettiCanvas = memo(({ running }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const setSize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    setSize();
    const EMOJIS = ["🎉","🎊","⭐","🌸","🌺","🎈","✨","🎀","💫","🎁","🌼","🎶"];
    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * (canvas.width || 400),
      y: -20 - Math.random() * 150,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      size: 14 + Math.random() * 22,
      vx: (Math.random() - 0.5) * 3.5,
      vy: 1.0 + Math.random() * 3.0,
      gravity: 0.04 + Math.random() * 0.04,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.13,
    }));
    const startTime = Date.now();
    const HOLD = 3500, FADE = 1000;
    let raf;
    window.addEventListener("resize", setSize);
    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > HOLD + FADE + 200) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const globalAlpha = elapsed > HOLD ? Math.max(0, 1 - (elapsed - HOLD) / FADE) : 1;
      particles.forEach(p => {
        p.vy += p.gravity; p.x += p.vx; p.y += p.vy; p.rotation += p.rotSpeed;
        if (p.y > canvas.height + 30 && elapsed < HOLD) { p.y = -20; p.x = Math.random() * canvas.width; p.vy = 1.0 + Math.random() * 3.0; }
        ctx.save(); ctx.globalAlpha = globalAlpha; ctx.translate(p.x, p.y); ctx.rotate(p.rotation);
        ctx.font = `${p.size}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(p.emoji, 0, 0); ctx.restore();
      });
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", setSize); };
  }, [running]);

  if (!running) return null;
  return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:9998, width:"100%", height:"100%" }} />;
});

// ── Birthday Banner ───────────────────────────────────────────────────────────
const BirthdayBanner = memo(({ shoutout }) => {
  if (!shoutout) return null;
  const names = Array.isArray(shoutout.names) ? shoutout.names.join(" & ") : shoutout.names;
  return (
    <div className="bday-wrap">
      <div className="bday-banner">
        <span className="bday-cake">🎂</span>
        <div className="bday-body">
          <p className="bday-label">🎉 Birthday Shoutout!</p>
          <p className="bday-names">{names}</p>
          {shoutout.message && <p className="bday-msg">"{shoutout.message}"</p>}
        </div>
        <div className="bday-icons"><span>🎊</span><span>🌸</span><span>⭐</span></div>
      </div>
    </div>
  );
});

// ── Lightbox ──────────────────────────────────────────────────────────────────
const Lightbox = memo(({ src, onClose }) => {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);
  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>✕</button>
      <img className="lightbox-img" src={src} alt="Full view" onClick={(e) => e.stopPropagation()} />
    </div>
  );
});

// ── Avatar ────────────────────────────────────────────────────────────────────
const Av = memo(({ src, name, onClick }) =>
  src
    ? <img src={src} alt={name || ""} className="fc-av" onClick={onClick} decoding="async" width={42} height={42} style={onClick ? { cursor:"pointer" } : undefined} />
    : <div className="fc-av-fb" onClick={onClick} style={onClick ? { cursor:"pointer" } : undefined}><span>{(name || "?").charAt(0).toUpperCase()}</span></div>
);

// ── Stars ─────────────────────────────────────────────────────────────────────
const Stars = memo(({ ratings, itemId, type, onRate, userId }) => {
  const mine = userId ? (ratings.find(r => r.userId?.toString() === userId)?.stars || 0) : 0;
  const avg  = ratings.length ? (ratings.reduce((s, r) => s + r.stars, 0) / ratings.length).toFixed(1) : null;
  return (
    <div className="stars">
      {[1,2,3,4,5].map(s => (
        <button key={s} className={`star ${s <= mine ? "on" : "off"}`}
          onClick={() => userId && onRate(itemId, type, s)}
          style={!userId ? { cursor:"default" } : undefined}>★</button>
      ))}
      {avg && <span className="star-avg">{avg} ({ratings.length})</span>}
    </div>
  );
});

// ── Video Block ───────────────────────────────────────────────────────────────
const VideoBlock = memo(({ videoUrl }) => {
  const nativeRef = useRef(null);
  useEffect(() => {
    const el = nativeRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.play().catch(() => {}); else el.pause(); },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [videoUrl]);
  if (!videoUrl) return null;
  return (
    <div className="fc-video-wrap">
      <video ref={nativeRef} className="fc-video-native" loop playsInline controls src={videoUrl} />
    </div>
  );
});

// ── Project Card ──────────────────────────────────────────────────────────────
const ProjectCard = memo(({ project, onRate, onNav, userId, onOpenImage }) => {
  const cover = project.coverImages?.[0] || project.coverImage;
  const tags  = project.tags?.length ? project.tags : (project.techStack || []);
  const a     = project.author;
  const goProfile = () => onNav(`/user/${a?._id}`);
  return (
    <article className="fc">
      <div className="fc-hd">
        <div className="fc-who">
          <div className="fc-clk" onClick={goProfile}>
            <Av src={a?.profileImage} name={a?.name} />
            <div><p className="fc-name">{a?.name}</p><p className="fc-sub">published a project ✨</p></div>
          </div>
        </div>
        <span className={badgeClass(project.status)}>{badgeLabel(project.status)}</span>
      </div>
      <div className="fc-body">
        {cover && <img src={cover} alt={project.title} className="fc-cover" loading="lazy" decoding="async" width={480} height={220} onClick={() => onOpenImage(cover)} />}
        <p className="fc-proj-title">{project.title}</p>
        {project.tagline    && <p className="fc-proj-tline">{project.tagline}</p>}
        {project.description && <p className="fc-proj-desc">{project.description}</p>}
        {tags.length > 0 && <div className="fc-tags">{tags.map((t, i) => <span key={i} className="fc-tag">{t}</span>)}</div>}
        {(project.liveUrl || project.repoUrl) && (
          <div className="fc-links">
            {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" className="fc-link primary">Live ↗</a>}
            {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer" className="fc-link">Repo ↗</a>}
          </div>
        )}
        <Stars ratings={project.ratings || []} itemId={project._id} type="project" onRate={onRate} userId={userId} />
      </div>
    </article>
  );
});

// ── Target Card ───────────────────────────────────────────────────────────────
const TargetCard = memo(({ target, onRate, onNav, userId, onOpenImage }) => {
  const [open, setOpen] = useState(false);
  const a    = target.author;
  const prog = target.progress || [];
  const latest = prog[prog.length - 1];
  const goProfile = () => onNav(`/user/${a?._id}`);
  return (
    <article className="fc">
      <div className="fc-hd">
        <div className="fc-who">
          <div className="fc-clk" onClick={goProfile}>
            <Av src={a?.profileImage} name={a?.name} />
            <div><p className="fc-name">{a?.name}</p><p className="fc-sub">progress update 🎯</p></div>
          </div>
        </div>
        {target.isCompleted && <span className="badge badge-done">Done ✓</span>}
      </div>
      <div className="fc-body">
        <p className="fc-proj-title">🎯 {target.title}</p>
        <p className="fc-sub" style={{ marginBottom:9, color:"#DB2777", fontWeight:700 }}>{prog.length} update{prog.length !== 1 ? "s" : ""}</p>
        {latest && (
          <div className="tc-tl-body" style={{ marginBottom:7 }}>
            {latest.isCompletion && <span className="tc-complete-tag">✓ COMPLETION</span>}
            {latest.text  && <p className="tc-p-text">{latest.text}</p>}
            {latest.link  && <a href={latest.link} target="_blank" rel="noreferrer" className="tc-p-link">{latest.link}</a>}
            {latest.image && <img src={latest.image} alt="" className="tc-p-img" loading="lazy" decoding="async" onClick={() => onOpenImage(latest.image)} />}
          </div>
        )}
        {prog.length > 1 && (
          <button className="tc-toggle-btn" onClick={() => setOpen(o => !o)}>
            {open ? "▲ less" : `▼ ${prog.length - 1} more update${prog.length - 1 !== 1 ? "s" : ""}`}
          </button>
        )}
        {open && (
          <div className="tc-expand-list">
            {prog.slice(0, -1).reverse().map(p => (
              <div key={p._id} className="tc-tl-body">
                {p.isCompletion && <span className="tc-complete-tag">✓ COMPLETION</span>}
                {p.text  && <p className="tc-p-text">{p.text}</p>}
                {p.link  && <a href={p.link} target="_blank" rel="noreferrer" className="tc-p-link">{p.link}</a>}
                {p.image && <img src={p.image} alt="" className="tc-p-img" loading="lazy" decoding="async" onClick={() => onOpenImage(p.image)} />}
              </div>
            ))}
          </div>
        )}
        <Stars ratings={target.ratings || []} itemId={target._id} type="target" onRate={onRate} userId={userId} />
      </div>
    </article>
  );
});

// ── Comment Section ───────────────────────────────────────────────────────────
const CommentSection = memo(({ post, commentText, onChangeComment, onAddComment, user }) => (
  <div className="cmt-wrap">
    <div className="cmt-list">
      {post.comments?.length > 0 ? post.comments.map(c => (
        <div key={c._id} className="cmt-row">
          <div className="cmt-mini-av"><span>{(c.userName || "?").charAt(0).toUpperCase()}</span></div>
          <div className="cmt-bubble">
            <span className="cmt-author">{c.userName}</span>
            <span className="cmt-text">{c.text}</span>
          </div>
        </div>
      )) : <p className="cmt-empty">No comments yet — be the first! 💬</p>}
    </div>
    {user ? (
      <div className="cmt-form">
        <div className="cmt-mini-av">
          {user.profileImage
            ? <img src={user.profileImage} alt="" className="cmt-mini-av-img" decoding="async" />
            : <span>{(user.name || "?").charAt(0).toUpperCase()}</span>}
        </div>
        <input className="cmt-in" placeholder="Write a comment…"
          value={commentText}
          onChange={e => onChangeComment(post._id, e.target.value)}
          onKeyDown={e => e.key === "Enter" && onAddComment(post._id)} />
        <button className="cmt-send" onClick={() => onAddComment(post._id)} disabled={!commentText?.trim()}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    ) : <p className="cmt-login">Login to comment 🔒</p>}
  </div>
));

// ── Post Card — SHARP CORNERS ─────────────────────────────────────────────────
const PostCard = memo(({ post, user, onLike, onDelete, onToggleComments, showComments, commentText, onChangeComment, onAddComment, onProfileClick, onOpenImage }) => {
  const pImg  = typeof post.userId === "object" && post.userId?.profileImage ? post.userId.profileImage
    : (user && (post.userId?._id || post.userId)?.toString() === user._id?.toString() ? user.profileImage : null);
  const pName = typeof post.userId === "object" && post.userId?.name ? post.userId.name : post.userName || "Unknown";
  const isOwn = user && (post.userId?._id || post.userId)?.toString() === user._id?.toString();
  const liked = user && (post.likes || []).includes(user._id);

  return (
    <article className="fc" style={post._isTemp ? { opacity:0.65, pointerEvents:"none" } : undefined}>
      <div className="fc-hd">
        <div className="fc-who">
          <div className="fc-clk" onClick={() => !post._isTemp && onProfileClick(post)}>
            <Av src={pImg} name={pName} />
            <div>
              <p className="fc-name">{pName}</p>
              <p className="fc-sub">{post._isTemp ? "Posting…" : fmtDate(post.createdAt)}</p>
            </div>
          </div>
        </div>
        {!post._isTemp && isOwn && <button className="del-btn" onClick={() => onDelete(post._id)}>Delete</button>}
      </div>

      {post.image && (
        <div className="fc-img-wrap">
          <img src={post.image} alt={post.caption || "post"} className="fc-img"
            loading="lazy" decoding="async" width={468} height={300}
            onClick={() => !post._isTemp && onOpenImage(post.image)} />
        </div>
      )}

      {!post._isTemp && <VideoBlock videoUrl={post.videoUrl} />}

      <div className="fc-body">
        {post.caption && <p className="fc-caption">{post.caption}</p>}
        {!post._isTemp && (
          <div className="fc-actions" style={{ marginBottom: showComments ? 11 : 0 }}>
            <button className="fc-act-btn" onClick={() => onLike(post._id)} disabled={!user}>
              {liked
                ? <img width={16} height={16} src="/images/lheart.svg" alt="" />
                : <img width={16} height={16} src="/images/ulheart.svg" alt="" />}
              <span className={`fc-act-count ${liked ? "liked" : ""}`}>{(post.likes || []).length}</span>
            </button>
            <button className="fc-act-btn" onClick={() => onToggleComments(post._id)}>
              <img width={16} height={16} src="/images/comment.svg" alt="" />
              <span className="fc-act-count">{(post.comments || []).length}</span>
            </button>
          </div>
        )}
        {showComments && !post._isTemp && (
          <CommentSection post={post} commentText={commentText} onChangeComment={onChangeComment} onAddComment={onAddComment} user={user} />
        )}
      </div>
    </article>
  );
});

// ── Dashboard Home ────────────────────────────────────────────────────────────
const DashboardHome = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const { posts, setPosts, loading, fetchPosts } = usePosts();

  const [caption,     setCaption]     = useState("");
  const [imgFile,     setImgFile]     = useState(null);
  const [preview,     setPreview]     = useState(null);
  const [creating,    setCreating]    = useState(false);
  const [comments,    setComments]    = useState({});
  const [openCmts,    setOpenCmts]    = useState({});
  const [projects,    setProjects]    = useState([]);
  const [targets,     setTargets]     = useState([]);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [shoutout,    setShoutout]    = useState(null);
  const [confettiRun, setConfettiRun] = useState(false);
  const taRef = useRef(null);

  const resize = useCallback(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, []);

  useEffect(() => {
    fetchPosts();
    (async () => {
      try {
        const [pr, tr, sd] = await Promise.all([
          api.get("/api/projects/recent"),
          api.get("/api/targets/recent"),
          api.get("/api/admin/shoutout"),
        ]);
        setProjects(Array.isArray(pr.data) ? pr.data : []);
        setTargets(Array.isArray(tr.data) ? tr.data : []);
        if (sd.data?.shoutout) {
          setShoutout(sd.data.shoutout);
          setConfettiRun(true);
          setTimeout(() => setConfettiRun(false), 4800);
        }
      } catch { /* ignore */ }
    })();
  }, []);

  const feed = useMemo(() => [
    ...posts.map(p => ({ ...p, _ft:"post" })),
    ...projects.map(p => ({ ...p, _ft:"project" })),
    ...targets.map(t => ({ ...t, _ft:"target" })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [posts, projects, targets]);

  const handleRate = useCallback(async (id, type, stars) => {
    try {
      if (type === "project") {
        const r = await api.post(`/api/projects/${id}/rate`, { stars });
        setProjects(p => p.map(x => x._id === id ? { ...x, ratings:r.data.ratings } : x));
      } else {
        const r = await api.post(`/api/targets/${id}/rate`, { stars });
        setTargets(t => t.map(x => x._id === id ? { ...x, ratings:r.data.ratings } : x));
      }
    } catch { /* ignore */ }
  }, []);

  const handleProfileClick = useCallback((post) => {
    const pid = post.userId?._id || post.userId;
    if (!pid) return;
    if (user && pid.toString() === user._id.toString()) navigate("/profile");
    else navigate(`/user/${pid}`);
  }, [user, navigate]);

  const handleCreatePost = useCallback(async () => {
    if (!caption.trim() && !imgFile) { alert("Add a photo or write something"); return; }
    const savedCaption = caption.trim(), savedImgFile = imgFile, savedPreview = preview;
    const tempId   = `temp_${Date.now()}`;
    const tempPost = {
      _id:tempId, _ft:"post", _isTemp:true,
      userId:{ _id:user._id, name:user.name, profileImage:user.profileImage },
      userName:user.name, caption:savedCaption, image:savedPreview||"", videoUrl:"",
      likes:[], comments:[], createdAt:new Date().toISOString(),
    };
    setPosts(p => [tempPost, ...p]);
    setCaption(""); setImgFile(null); setPreview(null);
    if (taRef.current) taRef.current.style.height = "40px";
    const fd = new FormData();
    if (savedImgFile) fd.append("image", savedImgFile);
    if (savedCaption) fd.append("caption", savedCaption);
    try {
      setCreating(true);
      const res = await api.post("/api/feed/post", fd);
      setPosts(p => p.map(x => x._id === tempId ? { ...res.data, _ft:"post" } : x));
    } catch (e) {
      setPosts(p => p.filter(x => x._id !== tempId));
      setCaption(savedCaption); setImgFile(savedImgFile); setPreview(savedPreview);
      if (taRef.current) { taRef.current.style.height = "auto"; resize(); }
      alert(e.response?.data?.message || "Failed to post. Please try again.");
    } finally { setCreating(false); }
  }, [caption, imgFile, preview, user, setPosts, resize]);

  const handleDeletePost = useCallback(async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try { await api.delete(`/api/feed/post/${id}`); setPosts(p => p.filter(x => x._id !== id)); }
    catch { alert("Failed"); }
  }, [setPosts]);

  const handleLikePost = useCallback(async (id) => {
    if (!user) return;
    try {
      const r = await api.post(`/api/feed/post/${id}/like`);
      setPosts(p => p.map(x => x._id === id ? {
        ...x,
        likes: r.data.liked ? [...(x.likes||[]), user._id] : (x.likes||[]).filter(l => l !== user._id),
      } : x));
    } catch { /* ignore */ }
  }, [user, setPosts]);

  const handleToggleComments = useCallback((id) => setOpenCmts(c => ({ ...c, [id]:!c[id] })), []);
  const handleChangeComment  = useCallback((id, val) => setComments(c => ({ ...c, [id]:val })), []);

  const handleAddComment = useCallback(async (id) => {
    const text = comments[id]?.trim();
    if (!text || !user) return;
    try {
      const r = await api.post(`/api/feed/post/${id}/comment`, { text });
      setPosts(p => p.map(x => x._id === id ? { ...x, comments:[...(x.comments||[]), r.data] } : x));
      setComments(c => ({ ...c, [id]:"" }));
    } catch { alert("Failed to comment"); }
  }, [comments, user, setPosts]);

  const handleOpenImage     = useCallback((src) => setLightboxSrc(src), []);
  const handleCloseLightbox = useCallback(() => setLightboxSrc(null), []);

  const userId = user?._id?.toString();

  if (loading && posts.length === 0) return (
    <div className="dh-wrap">
      <div className="dh-feed">
        <div className="sk-compose"><div className="sk" style={{ height:40, borderRadius:6 }} /></div>
        {[0,1,2].map(i => (
          <div key={i} className="sk-card">
            <div style={{ display:"flex", gap:12, marginBottom:11, alignItems:"center" }}>
              <div className="sk" style={{ width:42, height:42, borderRadius:6, flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div className="sk" style={{ height:12, width:"35%", marginBottom:6, borderRadius:4 }} />
                <div className="sk" style={{ height:10, width:"22%", borderRadius:4 }} />
              </div>
            </div>
            {i === 0 && <div className="sk" style={{ height:180, borderRadius:6, marginBottom:10, marginLeft:54 }} />}
            <div style={{ marginLeft:54 }}>
              <div className="sk" style={{ height:10, width:"65%", marginBottom:5, borderRadius:4 }} />
              <div className="sk" style={{ height:10, width:"45%", borderRadius:4 }} />
            </div>
          </div>
        ))}
      </div>
      <div className="dh-sidebar" />
    </div>
  );

  return (
    <div className="dh-wrap">
      <ConfettiCanvas running={confettiRun} />
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={handleCloseLightbox} />}

      <div className="dh-feed">
        {user && (
          <div className="compose">
            <textarea ref={taRef} className="compose-ta"
              placeholder="What's on your mind? ✍️"
              value={caption}
              onChange={e => { setCaption(e.target.value); resize(); }}
              onKeyDown={e => e.key === "Enter" && e.ctrlKey && handleCreatePost()}
              rows={1} />
            {preview && (
              <div className="compose-preview">
                <img src={preview} alt="" decoding="async" />
                <button className="compose-preview-rm" onClick={() => { setImgFile(null); setPreview(null); }}>✕ Remove</button>
              </div>
            )}
            <div className="compose-actions">
              <label className="compose-img-btn" title="Add photo">
                <img src="/images/image.svg" alt="photo" style={{ width:18, height:18 }} />
                <input type="file" accept="image/*" style={{ display:"none" }}
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) { setImgFile(f); setPreview(URL.createObjectURL(f)); }
                    e.target.value = "";
                  }} />
              </label>
              <button className="compose-send" onClick={handleCreatePost} disabled={creating || (!caption.trim() && !imgFile)}>
                {creating
                  ? <div className="compose-spinner" />
                  : <img src="/images/send.svg" alt="" style={{ width:15, height:15 }} />}
              </button>
            </div>
          </div>
        )}

        <BirthdayBanner shoutout={shoutout} />

        {feed.length === 0
          ? <div className="feed-empty">✨ Nothing here yet — be the first to share!</div>
          : feed.map(item => {
            if (item._ft === "project") return (
              <ProjectCard key={`proj-${item._id}`} project={item} onRate={handleRate} onNav={navigate} userId={userId} onOpenImage={handleOpenImage} />
            );
            if (item._ft === "target") return (
              <TargetCard key={`tgt-${item._id}`} target={item} onRate={handleRate} onNav={navigate} userId={userId} onOpenImage={handleOpenImage} />
            );
            return (
              <PostCard key={item._id} post={item} user={user}
                onLike={handleLikePost} onDelete={handleDeletePost}
                onToggleComments={handleToggleComments} showComments={!!openCmts[item._id]}
                commentText={comments[item._id]||""} onChangeComment={handleChangeComment}
                onAddComment={handleAddComment} onProfileClick={handleProfileClick}
                onOpenImage={handleOpenImage} />
            );
          })}
      </div>
      <div className="dh-sidebar" />
    </div>
  );
};

export default DashboardHome;