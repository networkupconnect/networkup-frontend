import { useEffect, useRef, useState, useMemo, useCallback, memo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { usePosts } from "../context/PostsContext";

/* ─────────────────────────────────────────────────────────────────────────────
   VIBRANT BRUTALIST — College-tuned color psychology
   Purple  #6D28D9 · Pink #DB2777 · Orange #EA580C · Teal #0D9488 · Amber #D97706
   RULE: Rounded cards (16px). Glass effect. Transparent page bg. No emojis in UI.
   ───────────────────────────────────────────────────────────────────────────── */

const ACCENT_CYCLE = ["#7C3AED", "#DB2777", "#EA580C", "#0D9488", "#D97706"];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

  @keyframes spin     { to { transform:rotate(360deg) } }
  @keyframes shimmer  { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
  @keyframes fadeIn   { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
  @keyframes slideUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

  /* ── Page shell — transparent so layout's gradient shows through ── */
  .dh-wrap  { display:flex; min-height:100vh; background:transparent; }
  .dh-feed  { width:100%; overflow-y:auto; padding-bottom:80px; padding-top:8px; }
  @media(min-width:640px){
    .dh-wrap { padding:14px; gap:14px; }
    .dh-feed { width:540px; flex-shrink:0; }
  }

  /* ── Skeleton ── */
  .sk { background:linear-gradient(90deg,rgba(255,255,255,0.18) 25%,rgba(255,255,255,0.32) 50%,rgba(255,255,255,0.18) 75%); background-size:600px 100%; animation:shimmer 1.4s ease infinite; border-radius:8px; }
  .sk-card    { background:rgba(255,255,255,0.18); padding:14px; margin:0 10px 8px; border-radius:16px; backdrop-filter:blur(10px); }
  .sk-compose { background:rgba(255,255,255,0.22); padding:14px; margin:0 10px 8px; border-radius:16px; backdrop-filter:blur(10px); }

  /* ── Compose box — glass card ── */
  .compose {
    background:rgba(255,255,255,0.88);
    backdrop-filter:blur(14px);
    -webkit-backdrop-filter:blur(14px);
    margin:0 10px 8px;
    border-radius:16px;
    border:1.5px solid rgba(255,255,255,0.6);
    border-top:3px solid #7C3AED;
    padding:14px;
    animation:slideUp 0.35s ease;
    box-shadow:0 4px 20px rgba(109,40,217,0.12);
  }
  .compose-ta {
    width:100%; background:#F5F3FF;
    border:1.5px solid #DDD6FE;
    border-radius:10px; outline:none;
    padding:10px 14px; font-size:14px;
    color:#1e1b4b; resize:none; overflow:hidden;
    min-height:40px; box-sizing:border-box;
    font-family:'Nunito',sans-serif; font-weight:600;
  }
  .compose-ta:focus { border-color:#7C3AED; }
  .compose-ta::placeholder { color:#a78bfa; }
  .compose-preview { margin-top:10px; display:flex; align-items:center; gap:10px; padding:8px 10px; background:#F5F3FF; border:1.5px solid #DDD6FE; border-radius:8px; }
  .compose-preview img { width:52px; height:52px; object-fit:cover; border-radius:6px; }
  .compose-preview-rm { font-size:12px; color:#DB2777; background:none; border:none; cursor:pointer; font-weight:800; }
  .compose-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:10px; }
  .compose-img-btn {
    width:34px; height:34px;
    background:#EDE9FE;
    border:1.5px solid #DDD6FE;
    border-radius:10px;
    display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background 0.12s;
  }
  .compose-img-btn:hover { background:#DDD6FE; }
  .compose-send {
    width:34px; height:34px;
    background:#7C3AED;
    border:none; border-radius:10px;
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:background 0.12s;
  }
  .compose-send:hover { background:#6D28D9; }
  .compose-send:disabled { opacity:0.35; cursor:not-allowed; }
  .compose-spinner { width:13px; height:13px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.6s linear infinite; }

  /* ── Feed card — rounded glass ── */
  .fc {
    background:rgba(255,255,255,0.88);
    backdrop-filter:blur(14px);
    -webkit-backdrop-filter:blur(14px);
    margin:0 10px 8px;
    border-radius:16px;
    border:1.5px solid rgba(255,255,255,0.6);
    border-top:3px solid #7C3AED;
    transition:border-top-color 0.15s, box-shadow 0.15s;
    animation:slideUp 0.3s ease;
    box-shadow:0 4px 16px rgba(0,0,0,0.10);
    overflow:hidden;
  }
  .fc:hover { box-shadow:0 8px 28px rgba(0,0,0,0.14); }

  /* ── Post card top: avatar + name row ── */
  .fc-top { display:flex; align-items:center; justify-content:space-between; padding:11px 14px 0; }
  .fc-who { display:flex; align-items:center; gap:9px; cursor:pointer; }
  .fc-av {
    width:28px; height:28px; border-radius:50%;
    object-fit:cover; border:2px solid #7C3AED;
    display:block; flex-shrink:0;
  }
  .fc-av-fb {
    width:28px; height:28px; border-radius:50%;
    background:#7C3AED;
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .fc-av-fb span { color:#fff; font-size:12px; font-weight:900; font-family:'Nunito',sans-serif; }
  .fc-name { font-size:13px; font-weight:800; color:#1e1b4b; font-family:'Nunito',sans-serif; line-height:1.2; }

  /* ── Image: full bleed with top radius clipped ── */
  .fc-img-area { margin-top:10px; overflow:hidden; }
  .fc-img { width:100%; max-height:360px; object-fit:cover; display:block; cursor:zoom-in; }

  /* ── Body ── */
  .fc-body { padding:10px 14px 12px; }
  .fc-caption { font-size:13.5px; color:#1e1b4b; line-height:1.6; margin-bottom:9px; white-space:pre-wrap; font-weight:600; font-family:'Nunito',sans-serif; }
  .fc-actions { display:flex; gap:16px; }
  .fc-act-btn { display:flex; align-items:center; gap:5px; background:none; border:none; cursor:pointer; padding:3px 6px; border-radius:8px; transition:background 0.12s; }
  .fc-act-btn:hover { background:#F5F3FF; }
  .fc-act-btn:disabled { cursor:default; }
  .fc-act-count { font-size:12px; color:#7C3AED; font-weight:700; }
  .fc-act-count.liked { color:#DB2777; }
  .del-btn { font-size:11px; color:#a78bfa; background:none; border:none; cursor:pointer; padding:3px 8px; font-weight:700; border-radius:6px; }
  .del-btn:hover { color:#EA580C; background:#FFF7ED; }

  /* ── Project/Target card header ── */
  .fc-proj-hd { display:flex; align-items:center; justify-content:space-between; padding:11px 14px 0; }
  .fc-proj-who { display:flex; align-items:center; gap:9px; cursor:pointer; }
  .fc-proj-body { padding:10px 14px 12px; }
  .fc-cover { width:100%; max-height:200px; object-fit:cover; display:block; margin-bottom:10px; cursor:zoom-in; border-radius:8px; }
  .fc-proj-title  { font-size:15px; font-weight:900; color:#1e1b4b; margin-bottom:3px; font-family:'Nunito',sans-serif; }
  .fc-proj-tline  { font-size:12px; color:#DB2777; margin-bottom:6px; font-weight:700; }
  .fc-proj-desc   { font-size:13px; color:#374151; line-height:1.55; margin-bottom:8px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; font-weight:600; }
  .fc-tags { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:9px; }
  .fc-tag  { font-size:11px; padding:3px 8px; background:#EDE9FE; border:1.5px solid #DDD6FE; color:#6D28D9; font-family:monospace; font-weight:700; border-radius:6px; }
  .fc-links { display:flex; gap:12px; padding-top:8px; border-top:1.5px solid #F5F3FF; margin-bottom:2px; }
  .fc-link  { font-size:12px; font-weight:700; color:#374151; text-decoration:none; }
  .fc-link.primary { color:#7C3AED; }
  .fc-link:hover { color:#DB2777; }
  .fc-sub  { font-size:11px; color:#a78bfa; font-weight:600; }

  /* ── Badges ── */
  .badge { font-size:10px; font-weight:800; padding:3px 9px; border-radius:20px; font-family:'Nunito',sans-serif; flex-shrink:0; letter-spacing:0.04em; text-transform:uppercase; }
  .badge-completed   { background:#DCFCE7; color:#16A34A; border:1.5px solid #86EFAC; }
  .badge-in-progress { background:#FEF9C3; color:#CA8A04; border:1.5px solid #FDE047; }
  .badge-idea        { background:#EDE9FE; color:#7C3AED; border:1.5px solid #DDD6FE; }
  .badge-done        { background:#DCFCE7; color:#16A34A; border:1.5px solid #86EFAC; }

  /* ── Stars ── */
  .stars { display:flex; align-items:center; gap:3px; margin-top:10px; }
  .star  { background:none; border:none; cursor:pointer; font-size:16px; padding:0; line-height:1; transition:transform 0.1s; }
  .star:hover { transform:scale(1.2); }
  .star.off { color:#EDE9FE; }
  .star.on  { color:#D97706; }
  .star-avg { font-size:11px; color:#a78bfa; margin-left:4px; font-weight:700; }

  /* ── Target card ── */
  .tc-tl-body { flex:1; background:rgba(249,250,251,0.8); border:1.5px solid #EDE9FE; padding:10px 12px; border-left:3px solid #7C3AED; margin-bottom:6px; border-radius:8px; }
  .tc-complete-tag { font-size:10px; font-weight:900; color:#16A34A; font-family:'Nunito',sans-serif; letter-spacing:0.06em; text-transform:uppercase; display:block; margin-bottom:4px; }
  .tc-p-text { font-size:13px; color:#374151; line-height:1.5; font-weight:600; }
  .tc-p-link { font-size:11px; color:#7C3AED; text-decoration:none; word-break:break-all; display:block; margin-top:4px; font-weight:700; }
  .tc-p-img  { max-width:110px; max-height:80px; object-fit:cover; border:1.5px solid #EDE9FE; display:block; margin-top:6px; cursor:zoom-in; border-radius:6px; }
  .tc-toggle-btn { font-size:11px; color:#DB2777; background:none; border:none; cursor:pointer; padding:0; margin-bottom:6px; font-weight:800; font-family:'Nunito',sans-serif; }

  /* ── Comments ── */
  .cmt-wrap { margin-top:10px; background:rgba(249,250,251,0.7); border:1.5px solid #EDE9FE; overflow:hidden; border-radius:10px; }
  .cmt-list { padding:10px 12px; max-height:180px; overflow-y:auto; display:flex; flex-direction:column; gap:7px; }
  .cmt-row  { display:flex; align-items:flex-start; gap:7px; }
  .cmt-mini-av {
    width:22px; height:22px;
    background:#7C3AED; border-radius:50%;
    display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; overflow:hidden;
  }
  .cmt-mini-av span { font-size:9px; font-weight:900; color:#fff; }
  .cmt-mini-av-img { width:22px; height:22px; object-fit:cover; }
  .cmt-bubble { background:rgba(255,255,255,0.9); padding:6px 10px; border:1.5px solid #EDE9FE; max-width:85%; border-radius:10px; }
  .cmt-author { font-size:11px; font-weight:800; color:#7C3AED; margin-right:5px; font-family:'Nunito',sans-serif; }
  .cmt-text   { font-size:11px; color:#4B5563; font-weight:600; }
  .cmt-empty  { text-align:center; font-size:11px; color:#a78bfa; padding:6px 0; font-weight:600; }
  .cmt-form   { display:flex; align-items:center; gap:7px; padding:7px 10px; border-top:1.5px solid #EDE9FE; background:rgba(255,255,255,0.8); }
  .cmt-in {
    flex:1; background:#F5F3FF; border:1.5px solid transparent;
    outline:none; padding:7px 12px; border-radius:20px;
    font-size:12px; color:#1e1b4b; font-family:'Nunito',sans-serif; font-weight:600;
  }
  .cmt-in:focus { border-color:#7C3AED; }
  .cmt-in::placeholder { color:#c4b5fd; }
  .cmt-send {
    width:26px; height:26px;
    background:#7C3AED; border-radius:50%;
    border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0;
    transition:background 0.12s;
  }
  .cmt-send:hover { background:#6D28D9; }
  .cmt-send:disabled { opacity:0.3; cursor:not-allowed; }
  .cmt-login { text-align:center; font-size:11px; color:#a78bfa; padding:8px 0; border-top:1.5px solid #EDE9FE; font-weight:700; }

  /* ── Video ── */
  .fc-video-wrap { margin-bottom:0; overflow:hidden; }
  .fc-video-native { width:100%; height:auto; display:block; background:#0F0F23; }

  /* ── Empty state ── */
  .feed-empty { text-align:center; padding:72px 0; color:rgba(255,255,255,0.75); font-size:14px; font-weight:700; font-family:'Nunito',sans-serif; }

  /* ── Sidebar ── */
  .dh-sidebar {
  display: block;
  flex: 1;
  position: sticky;
  top: 14px;
  height: calc(100vh - 28px);

  background: linear-gradient(
    -45deg,
    #7C3AED,
    #DB2777,
    #EA580C,
    #0D9488
  );

  background-size: 400% 400%;
  animation: gradientMove 12s ease infinite;

  border-radius: 16px;
  border: 1.5px solid rgba(255,255,255,.2);

  backdrop-filter: blur(20px);
  overflow: hidden;
}

  /* ── Lightbox ── */
  .lightbox-overlay {
    position:fixed; inset:0; z-index:9999;
    background:rgba(15,15,35,0.96);
    display:flex; align-items:center; justify-content:center;
    cursor:zoom-out; animation:fadeIn 0.18s ease;
  }
  .lightbox-img { max-width:94vw; max-height:92vh; object-fit:contain; box-shadow:0 12px 60px rgba(109,40,217,0.4); cursor:default; border-radius:12px; }
  .lightbox-close {
    position:fixed; top:18px; right:22px;
    background:#7C3AED; border:none; color:#fff;
    width:38px; height:38px; font-size:18px;
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    font-family:'Nunito',sans-serif; font-weight:900; border-radius:50%;
  }
  .lightbox-close:hover { background:#DB2777; }

  /* ── Birthday Banner ── */
  @keyframes bdaySlideIn { from{opacity:0;transform:translateY(-14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes bdayFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }

  .bday-wrap { margin:0 10px 8px; animation:bdaySlideIn 0.5s cubic-bezier(0.34,1.56,0.64,1); }
  .bday-banner {
    position:relative; overflow:hidden;
    background:#FBBF24;
    border-top:3px solid #D97706; border-radius:16px;
    padding:14px 16px;
    display:flex; align-items:center; gap:14px;
    box-shadow:0 4px 16px rgba(217,119,6,0.2);
  }
  .bday-cake { font-size:30px; animation:bdayFloat 2.2s ease-in-out infinite; flex-shrink:0; }
  .bday-body { flex:1; min-width:0; }
  .bday-label { font-size:9px; font-weight:900; letter-spacing:0.18em; text-transform:uppercase; color:#92400E; font-family:'Nunito',sans-serif; margin-bottom:3px; }
  .bday-names { font-size:15px; font-weight:900; color:#1e1b4b; letter-spacing:-0.02em; font-family:'Nunito',sans-serif; }
  .bday-msg { font-size:12px; color:#78350F; margin-top:3px; font-weight:700; }
  .bday-icons { display:flex; gap:4px; flex-shrink:0; }
  .bday-icons span { font-size:18px; animation:bdayFloat 2s ease-in-out infinite; }
`;

if (typeof document !== "undefined" && !document.getElementById("dh-styles")) {
  const el = document.createElement("style");
  el.id = "dh-styles";
  el.textContent = STYLES;
  document.head.appendChild(el);
}

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
    const EMOJIS = ["*","o","+","x","#"];
    const COLORS = ["#7C3AED","#DB2777","#EA580C","#0D9488","#D97706","#FCD34D"];
    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * (canvas.width || 400),
      y: -20 - Math.random() * 150,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 10,
      vx: (Math.random() - 0.5) * 3.5,
      vy: 1.0 + Math.random() * 3.0,
      gravity: 0.04 + Math.random() * 0.04,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.12,
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
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
        ctx.restore();
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
        <span className="bday-cake">&#127874;</span>
        <div className="bday-body">
          <p className="bday-label">Birthday Shoutout</p>
          <p className="bday-names">{names}</p>
          {shoutout.message && <p className="bday-msg">"{shoutout.message}"</p>}
        </div>
        <div className="bday-icons"><span>&#127882;</span><span>&#127800;</span></div>
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
      <button className="lightbox-close" onClick={onClose}>&#10005;</button>
      <img className="lightbox-img" src={src} alt="Full view" onClick={(e) => e.stopPropagation()} />
    </div>
  );
});

// ── Avatar ────────────────────────────────────────────────────────────────────
const Av = memo(({ src, name, onClick, size = 28 }) =>
  src
    ? <img src={src} alt={name || ""} className="fc-av" onClick={onClick}
        decoding="async" width={size} height={size}
        style={{ width:size, height:size, cursor:onClick ? "pointer" : undefined }} />
    : <div className="fc-av-fb" onClick={onClick}
        style={{ width:size, height:size, cursor:onClick ? "pointer" : undefined }}>
        <span>{(name || "?").charAt(0).toUpperCase()}</span>
      </div>
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
          style={!userId ? { cursor:"default" } : undefined}>&#9733;</button>
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
const ProjectCard = memo(({ project, onRate, onNav, userId, onOpenImage, accentColor }) => {
  const cover = project.coverImages?.[0] || project.coverImage;
  const tags  = project.tags?.length ? project.tags : (project.techStack || []);
  const a     = project.author;
  const goProfile = () => onNav(`/user/${a?._id}`);
  return (
    <article className="fc" style={{ borderTopColor: accentColor || "#0D9488" }}>
      <div className="fc-proj-hd">
        <div className="fc-proj-who" onClick={goProfile}>
          <Av src={a?.profileImage} name={a?.name} />
          <div>
            <p className="fc-name">{a?.name}</p>
            <p className="fc-sub">published a project</p>
          </div>
        </div>
        <span className={badgeClass(project.status)}>{badgeLabel(project.status)}</span>
      </div>
      <div className="fc-proj-body">
        {cover && <img src={cover} alt={project.title} className="fc-cover" loading="lazy" decoding="async" onClick={() => onOpenImage(cover)} />}
        <p className="fc-proj-title">{project.title}</p>
        {project.tagline    && <p className="fc-proj-tline">{project.tagline}</p>}
        {project.description && <p className="fc-proj-desc">{project.description}</p>}
        {tags.length > 0 && <div className="fc-tags">{tags.map((t, i) => <span key={i} className="fc-tag">{t}</span>)}</div>}
        {(project.liveUrl || project.repoUrl) && (
          <div className="fc-links">
            {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" className="fc-link primary">Live</a>}
            {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer" className="fc-link">Repo</a>}
          </div>
        )}
        <Stars ratings={project.ratings || []} itemId={project._id} type="project" onRate={onRate} userId={userId} />
      </div>
    </article>
  );
});

// ── Target Card ───────────────────────────────────────────────────────────────
const TargetCard = memo(({ target, onRate, onNav, userId, onOpenImage, accentColor }) => {
  const [open, setOpen] = useState(false);
  const a    = target.author;
  const prog = target.progress || [];
  const latest = prog[prog.length - 1];
  const goProfile = () => onNav(`/user/${a?._id}`);
  return (
    <article className="fc" style={{ borderTopColor: accentColor || "#DB2777" }}>
      <div className="fc-proj-hd">
        <div className="fc-proj-who" onClick={goProfile}>
          <Av src={a?.profileImage} name={a?.name} />
          <div>
            <p className="fc-name">{a?.name}</p>
            <p className="fc-sub">progress update</p>
          </div>
        </div>
        {target.isCompleted && <span className="badge badge-done">Done</span>}
      </div>
      <div className="fc-proj-body">
        <p className="fc-proj-title">{target.title}</p>
        <p className="fc-sub" style={{ marginBottom:9, color:"#DB2777", fontWeight:700 }}>{prog.length} update{prog.length !== 1 ? "s" : ""}</p>
        {latest && (
          <div className="tc-tl-body">
            {latest.isCompletion && <span className="tc-complete-tag">COMPLETED</span>}
            {latest.text  && <p className="tc-p-text">{latest.text}</p>}
            {latest.link  && <a href={latest.link} target="_blank" rel="noreferrer" className="tc-p-link">{latest.link}</a>}
            {latest.image && <img src={latest.image} alt="" className="tc-p-img" loading="lazy" decoding="async" onClick={() => onOpenImage(latest.image)} />}
          </div>
        )}
        {prog.length > 1 && (
          <button className="tc-toggle-btn" onClick={() => setOpen(o => !o)}>
            {open ? "show less" : `${prog.length - 1} more update${prog.length - 1 !== 1 ? "s" : ""}`}
          </button>
        )}
        {open && prog.slice(0, -1).reverse().map(p => (
          <div key={p._id} className="tc-tl-body">
            {p.isCompletion && <span className="tc-complete-tag">COMPLETED</span>}
            {p.text  && <p className="tc-p-text">{p.text}</p>}
            {p.link  && <a href={p.link} target="_blank" rel="noreferrer" className="tc-p-link">{p.link}</a>}
            {p.image && <img src={p.image} alt="" className="tc-p-img" loading="lazy" decoding="async" onClick={() => onOpenImage(p.image)} />}
          </div>
        ))}
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
      )) : <p className="cmt-empty">No comments yet — be the first</p>}
    </div>
    {user ? (
      <div className="cmt-form">
        <div className="cmt-mini-av">
          {user.profileImage
            ? <img src={user.profileImage} alt="" className="cmt-mini-av-img" decoding="async" />
            : <span>{(user.name || "?").charAt(0).toUpperCase()}</span>}
        </div>
        <input className="cmt-in" placeholder="Write a comment"
          value={commentText}
          onChange={e => onChangeComment(post._id, e.target.value)}
          onKeyDown={e => e.key === "Enter" && onAddComment(post._id)} />
        <button className="cmt-send" onClick={() => onAddComment(post._id)} disabled={!commentText?.trim()}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    ) : <p className="cmt-login">Login to comment</p>}
  </div>
));

// ── Post Card ─────────────────────────────────────────────────────────────────
const PostCard = memo(({ post, user, onLike, onDelete, onToggleComments, showComments,
  commentText, onChangeComment, onAddComment, onProfileClick, onOpenImage, accentColor }) => {
  const pImg  = typeof post.userId === "object" && post.userId?.profileImage ? post.userId.profileImage
    : (user && (post.userId?._id || post.userId)?.toString() === user._id?.toString() ? user.profileImage : null);
  const pName = typeof post.userId === "object" && post.userId?.name ? post.userId.name : post.userName || "Unknown";
  const isOwn = user && (post.userId?._id || post.userId)?.toString() === user._id?.toString();
  const liked = user && (post.likes || []).includes(user._id);

  return (
    <article className="fc" style={{
      opacity: post._isTemp ? 0.65 : 1,
      pointerEvents: post._isTemp ? "none" : undefined,
      borderTopColor: accentColor || "#7C3AED",
    }}>
      <div className="fc-top">
        <div className="fc-who" onClick={() => !post._isTemp && onProfileClick(post)}>
          <Av src={pImg} name={pName} />
          <p className="fc-name">{pName}</p>
          {post._isTemp && <span style={{ fontSize:11, color:"#a78bfa", fontWeight:600, marginLeft:4 }}>Posting…</span>}
        </div>
        {!post._isTemp && isOwn && <button className="del-btn" onClick={() => onDelete(post._id)}>Delete</button>}
      </div>

      {post.image && (
        <div className="fc-img-area">
          <img src={post.image} alt={post.caption || "post"} className="fc-img"
            loading="lazy" decoding="async"
            onClick={() => !post._isTemp && onOpenImage(post.image)} />
        </div>
      )}

      {!post._isTemp && <VideoBlock videoUrl={post.videoUrl} />}

      <div className="fc-body">
        {post.caption && <p className="fc-caption">{post.caption}</p>}
        {!post._isTemp && (
          <div className="fc-actions" style={{ marginBottom: showComments ? 10 : 0 }}>
            <button className="fc-act-btn" onClick={() => onLike(post._id)} disabled={!user}>
              {liked
                ? <img width={15} height={15} src="/images/lheart.svg" alt="" />
                : <img width={15} height={15} src="/images/ulheart.svg" alt="" />}
              <span className={`fc-act-count ${liked ? "liked" : ""}`}>{(post.likes || []).length}</span>
            </button>
            <button className="fc-act-btn" onClick={() => onToggleComments(post._id)}>
              <img width={15} height={15} src="/images/comment.svg" alt="" />
              <span className="fc-act-count">{(post.comments || []).length}</span>
            </button>
          </div>
        )}
        {showComments && !post._isTemp && (
          <CommentSection post={post} commentText={commentText}
            onChangeComment={onChangeComment} onAddComment={onAddComment} user={user} />
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
        <div className="sk-compose"><div className="sk" style={{ height:38 }} /></div>
        {[0,1,2].map(i => (
          <div key={i} className="sk-card">
            <div style={{ display:"flex", gap:9, marginBottom:10, alignItems:"center" }}>
              <div className="sk" style={{ width:28, height:28, flexShrink:0, borderRadius:"50%" }} />
              <div className="sk" style={{ height:12, width:"28%", borderRadius:6 }} />
            </div>
            {i === 0 && <div className="sk" style={{ height:160, marginBottom:10, borderRadius:10 }} />}
            <div className="sk" style={{ height:10, width:"70%", borderRadius:6, marginBottom:5 }} />
            <div className="sk" style={{ height:10, width:"50%", borderRadius:6 }} />
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
              placeholder="What's on your mind?"
              value={caption}
              onChange={e => { setCaption(e.target.value); resize(); }}
              onKeyDown={e => e.key === "Enter" && e.ctrlKey && handleCreatePost()}
              rows={1} />
            {preview && (
              <div className="compose-preview">
                <img src={preview} alt="" decoding="async" />
                <button className="compose-preview-rm" onClick={() => { setImgFile(null); setPreview(null); }}>Remove</button>
              </div>
            )}
            <div className="compose-actions">
              <label className="compose-img-btn" title="Add photo">
                <img src="/images/image.svg" alt="photo" style={{ width:17, height:17 }} />
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
                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>}
              </button>
            </div>
          </div>
        )}

        <BirthdayBanner shoutout={shoutout} />

        {feed.length === 0
          ? <div className="feed-empty">Nothing here yet — be the first to share</div>
          : feed.map((item, idx) => {
              const accent = ACCENT_CYCLE[idx % ACCENT_CYCLE.length];
              if (item._ft === "project") return (
                <ProjectCard key={`proj-${item._id}`} project={item} onRate={handleRate}
                  onNav={navigate} userId={userId} onOpenImage={handleOpenImage} accentColor={accent} />
              );
              if (item._ft === "target") return (
                <TargetCard key={`tgt-${item._id}`} target={item} onRate={handleRate}
                  onNav={navigate} userId={userId} onOpenImage={handleOpenImage} accentColor={accent} />
              );
              return (
                <PostCard key={item._id} post={item} user={user} accentColor={accent}
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