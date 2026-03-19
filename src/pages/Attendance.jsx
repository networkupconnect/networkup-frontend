import { useEffect, useState, useRef, useMemo, useCallback } from "react";

/* ─── Constants ─────────────────────────────────────────────────────────── */
const DAYS      = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_FULL  = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const MONTHS    = ["January","February","March","April","May","June",
                   "July","August","September","October","November","December"];

// Holidays — "YYYY-MM-DD". Feb 28 = Sat (already off), Mar 1 = Sun (already off).
// Listed here so they render visually if navigated to.
const HOLIDAYS  = new Set(["2026-02-28", "2026-03-01"]);

const STORAGE_KEYS = {
  subjects:   "att26_subjects",
  attendance: "att26_data",
  baseline:   "att26_baseline",   // { pct: number }
};

/* ─── Helpers ───────────────────────────────────────────────────────────── */
function fmtKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function pct(p, t) { return t ? Math.round((p / t) * 100) : 0; }

function isWeekend(y, m, d) {
  const w = new Date(y, m, d).getDay();
  return w === 0 || w === 6;
}

function isHoliday(dk) { return HOLIDAYS.has(dk); }

function isWorkday(y, m, d) {
  return !isWeekend(y, m, d) && !isHoliday(fmtKey(y, m, d));
}

function getWeekdayBlanks(y, m) {
  // How many Mon-aligned blank cells before the 1st of month
  const firstDow  = new Date(y, m, 1).getDay(); // 0=Sun
  const monOffset = firstDow === 0 ? 6 : firstDow - 1;
  // Count only Mon–Fri slots in that offset
  let blanks = 0;
  for (let i = 0; i < monOffset; i++) { if (i % 7 < 5) blanks++; }
  return blanks;
}

function fmtDateLong(y, m, d) {
  return new Date(y, m, d).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function fmtDateShort(y, m, d) {
  return new Date(y, m, d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short",
  });
}

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}

function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

/* ─── Sub-components ────────────────────────────────────────────────────── */

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)",
      background: "#1c1b18", color: "#fff", fontSize: 12, fontWeight: 600,
      padding: "8px 18px", borderRadius: 100,
      boxShadow: "0 4px 14px rgba(0,0,0,.18)",
      zIndex: 999, whiteSpace: "nowrap", pointerEvents: "none",
      animation: "att-fadein .15s ease both",
    }}>
      {toast}
    </div>
  );
}

function StatCard({ val, label, color }) {
  const colors = {
    default: "#1c1b18",
    green:   "#1a7a52",
    red:     "#b83030",
    amber:   "#a05810",
  };
  return (
    <div style={{
      background: "#fff", border: "1px solid #e0ddd5",
      borderRadius: 10, padding: "11px 8px", textAlign: "center",
      boxShadow: "0 1px 3px rgba(0,0,0,.06)",
    }}>
      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "monospace", lineHeight: 1, color: colors[color] || colors.default }}>{val}</div>
      <div style={{ fontSize: 10, color: "#aaa89e", fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════════════════ */
export default function Attendance() {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);

  /* ── Core state ── */
  const [subjects,   setSubjects]   = useState(() => load(STORAGE_KEYS.subjects,   []));
  const [attendance, setAttendance] = useState(() => load(STORAGE_KEYS.attendance, {}));
  const [baseline,   setBaseline]   = useState(() => load(STORAGE_KEYS.baseline,   null));

  /* ── View state ── */
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedKey, setSelectedKey] = useState(() => {
    if (today.getDay() !== 0 && today.getDay() !== 6) {
      return fmtKey(today.getFullYear(), today.getMonth(), today.getDate());
    }
    return null;
  });

  /* ── UI state ── */
  const [toast,       setToast]       = useState(null);
  const [subjectInput, setSubjectInput] = useState("");
  const [baselineInput, setBaselineInput] = useState("");
  const [showAddSubject, setShowAddSubject] = useState(false);
  const toastRef = useRef(null);

  /* ── Persist on change ── */
  useEffect(() => { save(STORAGE_KEYS.subjects,   subjects);   }, [subjects]);
  useEffect(() => { save(STORAGE_KEYS.attendance, attendance); }, [attendance]);
  useEffect(() => { save(STORAGE_KEYS.baseline,   baseline);   }, [baseline]);

  /* ── Toast helper ── */
  const showToast = useCallback((msg) => {
    clearTimeout(toastRef.current);
    setToast(msg);
    toastRef.current = setTimeout(() => setToast(null), 2200);
  }, []);

  /* ── Derived: today key ── */
  const todayKey = fmtKey(today.getFullYear(), today.getMonth(), today.getDate());

  /* ── Selected date parts ── */
  const selectedParts = useMemo(() => {
    if (!selectedKey) return null;
    const [y, m, d] = selectedKey.split("-").map(Number);
    return { y, m: m - 1, d };
  }, [selectedKey]);

  const isFutureSelected = selectedParts
    ? new Date(selectedParts.y, selectedParts.m, selectedParts.d) > today
    : false;

  /* ── Attendance calculations ── */
  function getDayStats(dk) {
    if (!attendance[dk] || !subjects.length) return null;
    let p = 0, a = 0, b = 0;
    subjects.forEach(s => {
      const v = attendance[dk]?.[s];
      if (v === "p") p++; else if (v === "a") a++; else if (v === "b") b++;
    });
    const marked = p + a;
    if (!marked && !b) return null;
    return { p, a, b, marked, pct: marked ? Math.round(p / marked * 100) : null };
  }

  const overallStats = useMemo(() => {
    let tP = 0, tA = 0, tB = 0;
    Object.keys(attendance).forEach(dk => {
      subjects.forEach(s => {
        const v = attendance[dk]?.[s];
        if (v === "p") tP++; else if (v === "a") tA++; else if (v === "b") tB++;
      });
    });
    // Baseline: student entered a %. We treat it as a virtual 100-class block.
    const bPct = baseline?.pct ?? null;
    let totalP = tP, totalA = tA;
    if (bPct !== null) { totalP += bPct; totalA += (100 - bPct); }
    const marked = totalP + totalA;
    return { totalP, totalA, tB, marked, pct: marked ? Math.round(totalP / marked * 100) : null };
  }, [attendance, subjects, baseline]);

  function getSubjectStats(subj) {
    let p = 0, a = 0, b = 0;
    Object.keys(attendance).forEach(dk => {
      const v = attendance[dk]?.[subj];
      if (v === "p") p++; else if (v === "a") a++; else if (v === "b") b++;
    });
    const marked = p + a;
    return { p, a, b, marked, pct: marked ? Math.round(p / marked * 100) : null };
  }

  /* ── Mark attendance ── */
  const markAttendance = useCallback((subj, val) => {
    if (!selectedKey || isFutureSelected) return;
    setAttendance(prev => {
      const next = { ...prev };
      const day  = { ...(next[selectedKey] || {}) };
      if (day[subj] === val) {
        delete day[subj];
        showToast("Unmarked");
      } else {
        day[subj] = val;
        showToast(val === "p" ? "Present ✓" : val === "a" ? "Absent" : "Bunk 🚪");
      }
      if (!Object.keys(day).length) delete next[selectedKey];
      else next[selectedKey] = day;
      return next;
    });
  }, [selectedKey, isFutureSelected, showToast]);

  /* ── Subject CRUD ── */
  const addSubject = () => {
    const val = subjectInput.trim();
    if (!val) return;
    if (subjects.map(s => s.toLowerCase()).includes(val.toLowerCase())) {
      showToast("Subject already exists"); setSubjectInput(""); return;
    }
    setSubjects(prev => [...prev, val]);
    setSubjectInput("");
    showToast(`"${val}" added`);
  };

  const deleteSubject = (subj) => {
    if (!window.confirm(`Remove "${subj}" and all its data?`)) return;
    setAttendance(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(dk => { if (next[dk]) { delete next[dk][subj]; } });
      return next;
    });
    setSubjects(prev => prev.filter(s => s !== subj));
    showToast(`"${subj}" removed`);
  };

  /* ── Baseline ── */
  const saveBaseline = () => {
    const v = parseFloat(baselineInput);
    if (baselineInput === "" || isNaN(v)) { showToast("Enter your attendance %"); return; }
    if (v < 0 || v > 100) { showToast("Enter a value between 0 and 100"); return; }
    setBaseline({ pct: Math.round(v * 10) / 10 });
    showToast("Baseline saved ✓");
  };

  /* ── Month nav ── */
  const prevMonth = () => {
    setViewMonth(m => { if (m === 0) { setViewYear(y => y - 1); return 11; } return m - 1; });
  };
  const nextMonth = () => {
    setViewMonth(m => { if (m === 11) { setViewYear(y => y + 1); return 0; } return m + 1; });
  };

  /* ── Calendar cells ── */
  const calendarCells = useMemo(() => {
    const blanks   = getWeekdayBlanks(viewYear, viewMonth);
    const daysInMo = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells    = [];

    for (let i = 0; i < blanks; i++) cells.push({ type: "blank" });

    for (let d = 1; d <= daysInMo; d++) {
      if (isWeekend(viewYear, viewMonth, d)) continue;
      const dk  = fmtKey(viewYear, viewMonth, d);
      const hol = isHoliday(dk);
      cells.push({
        type: "day", d, dk,
        isHoliday: hol,
        isToday:   dk === todayKey,
        isFuture:  !hol && new Date(viewYear, viewMonth, d) > today,
        isSelected: dk === selectedKey,
        stats: hol ? null : getDayStats(dk),
      });
    }
    return cells;
  }, [viewYear, viewMonth, attendance, subjects, selectedKey, todayKey, today]);

  /* ── Insight line ── */
  const insight = useMemo(() => {
    const { pct: op, totalP, totalA, marked } = overallStats;
    if (op === null) return null;
    const target = 75;
    if (op >= target) {
      const skip = Math.max(0, Math.floor((100 * totalP - target * marked) / target));
      return { type: "ok", msg: `You're at ${op}% — can skip ${skip} more class${skip !== 1 ? "es" : ""} and stay above ${target}%` };
    } else {
      const need = Math.max(0, Math.ceil((target * marked - 100 * totalP) / (100 - target)));
      return {
        type: op >= 60 ? "warn" : "danger",
        msg: `At ${op}% — need ${need} more present class${need !== 1 ? "es" : ""} to reach ${target}%`,
      };
    }
  }, [overallStats]);

  /* ══════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        .att2026 *, .att2026 *::before, .att2026 *::after { box-sizing: border-box; }
        .att2026 {
          font-family: 'DM Sans', system-ui, sans-serif;
          background: #f5f4f0; min-height: 100vh; color: #1c1b18; font-size: 14px; line-height: 1.5;
        }
        @keyframes att-fadein { from { opacity:0; transform:translateX(-50%) translateY(4px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }

        /* ── Inputs & buttons ── */
        .att2026 .rf {
          width: 100%; padding: 9px 12px; border-radius: 10px;
          border: 1px solid #e0ddd5; background: #fff;
          font-size: 13px; font-family: inherit; color: #1c1b18; outline: none;
          transition: border-color .15s;
        }
        .att2026 .rf:focus { border-color: #c5c2b8; }
        .att2026 .rf::placeholder { color: #aaa89e; }

        .att2026 .btn-dark {
          padding: 9px 16px; border-radius: 10px; border: none;
          background: #1c1b18; color: #fff; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: inherit; transition: background .13s; white-space: nowrap;
        }
        .att2026 .btn-dark:hover { background: #3a3936; }
        .att2026 .btn-dark:disabled { opacity: .4; cursor: not-allowed; }

        .att2026 .btn-ghost {
          background: none; border: none; cursor: pointer;
          font-family: inherit; font-size: 12px; color: #aaa89e; padding: 0;
          transition: color .13s;
        }
        .att2026 .btn-ghost:hover { color: #b83030; }

        /* ── Overlay / modal ── */
        .att2026 .overlay {
          position: fixed; inset: 0; z-index: 80;
          background: rgba(0,0,0,.18);
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .att2026 .modal {
          background: #fff; border-radius: 16px; padding: 22px; width: 100%;
          max-width: 400px; box-shadow: 0 12px 40px rgba(0,0,0,.12);
          max-height: 90vh; overflow-y: auto;
        }

        /* ── Calendar cell ── */
        .att2026 .cc {
          border-right: 1px solid #e0ddd5; border-bottom: 1px solid #e0ddd5;
          min-height: 66px; padding: 7px 6px; cursor: pointer;
          transition: background .12s;
        }
        .att2026 .cc:nth-child(5n) { border-right: none; }
        .att2026 .cc:hover { background: #eeecea; }
        .att2026 .cc.empty   { background: #f5f4f0; cursor: default; opacity: .4; }
        .att2026 .cc.empty:hover { background: #f5f4f0; }
        .att2026 .cc.holiday { background: #fdf5f5; cursor: default; }
        .att2026 .cc.holiday:hover { background: #fdf5f5; }
        .att2026 .cc.future  { opacity: .5; cursor: default; }
        .att2026 .cc.future:hover { background: #fff; }
        .att2026 .cc.selected { background: #1c1b18 !important; }
        .att2026 .cc.selected:hover { background: #3a3936 !important; }

        /* ── Mark buttons ── */
        .att2026 .mbtn {
          flex: 1; padding: 7px 4px; border-radius: 8px; border: 1px solid #e0ddd5;
          background: #fff; color: #6b6860; font-size: 11px; font-weight: 600;
          cursor: pointer; font-family: inherit; transition: all .12s; white-space: nowrap;
        }
        .att2026 .mbtn:hover:not(:disabled) { border-color: #c5c2b8; background: #eeecea; color: #1c1b18; }
        .att2026 .mbtn:disabled { opacity: .3; cursor: not-allowed; }
        .att2026 .mbtn.on-p { background: #e6f4ee; border-color: #a3d9be; color: #1a7a52; }
        .att2026 .mbtn.on-a { background: #faeaea; border-color: #e8aaaa; color: #b83030; }
        .att2026 .mbtn.on-b { background: #fdf0dc; border-color: #e8c878; color: #a05810; }

        /* ── Subject tags ── */
        .att2026 .stag {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 10px 5px 12px; border-radius: 100px;
          background: #fff; border: 1px solid #e0ddd5;
          font-size: 12px; font-weight: 500;
          box-shadow: 0 1px 3px rgba(0,0,0,.06);
        }

        /* ── Progress bar ── */
        .att2026 .prog { height: 3px; background: #e0ddd5; border-radius: 100px; overflow: hidden; }
        .att2026 .prog-f { height: 100%; border-radius: 100px; transition: width .3s; }

        /* ── Spinner ── */
        @keyframes att-spin { to { transform: rotate(360deg); } }
        .att2026 .spin {
          width: 18px; height: 18px; border: 2px solid #e0ddd5;
          border-top-color: #1c1b18; border-radius: 50%;
          animation: att-spin .7s linear infinite;
        }
      `}</style>

      <div className="att2026">
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "22px 16px 80px" }}>

          {/* ── Header ── */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22, gap: 12 }}>
            <div>
              <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.4px" }}>Attendance Tracker</div>
              <div style={{ fontSize: 12, color: "#6b6860", marginTop: 2 }}>2026 · Classes started Mar 2 (Mar 1 = Sunday)</div>
            </div>
            {/* Month nav */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginTop: 4 }}>
              <button onClick={prevMonth} style={{
                width: 30, height: 30, borderRadius: 10, border: "1px solid #e0ddd5",
                background: "#fff", cursor: "pointer", fontSize: 15, color: "#6b6860",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>‹</button>
              <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "monospace", minWidth: 108, textAlign: "center" }}>
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button onClick={nextMonth} style={{
                width: 30, height: 30, borderRadius: 10, border: "1px solid #e0ddd5",
                background: "#fff", cursor: "pointer", fontSize: 15, color: "#6b6860",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>›</button>
            </div>
          </div>

          {/* ── Baseline Banner ── */}
          <div style={{
            background: "#fff", border: "1px solid #e0ddd5", borderRadius: 14,
            padding: "14px 16px", marginBottom: 16,
            boxShadow: "0 1px 3px rgba(0,0,0,.06)",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Your attendance as of Feb 27, 2026</div>
            <div style={{ fontSize: 12, color: "#6b6860", marginBottom: 12, lineHeight: 1.55 }}>
              Feb 28 was a holiday &amp; Mar 1 is Sunday — classes resume Mar 2. Enter your attendance % as of Feb 27 to set your baseline.
            </div>

            {baseline?.pct != null ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #e0ddd5" }}>
                <span style={{ fontSize: 12, color: "#6b6860" }}>
                  Baseline set: <strong style={{ color: "#1c1b18" }}>{baseline.pct}%</strong> as of Feb 27
                </span>
                <button className="btn-ghost" onClick={() => { setBaseline(null); setBaselineInput(""); }}>Edit</button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 10, color: "#aaa89e", fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>
                    Attendance % as of Feb 27
                  </label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      className="rf"
                      type="number"
                      placeholder="e.g. 78"
                      min="0" max="100" step="0.1"
                      value={baselineInput}
                      onChange={e => setBaselineInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && saveBaseline()}
                      style={{ fontSize: 18, fontWeight: 600, fontFamily: "monospace", paddingRight: 36 }}
                    />
                    <span style={{ position: "absolute", right: 13, fontSize: 16, fontWeight: 700, color: "#6b6860", fontFamily: "monospace", pointerEvents: "none" }}>%</span>
                  </div>
                </div>
                <button className="btn-dark" style={{ width: "100%", padding: 10 }} onClick={saveBaseline}>
                  Save Baseline
                </button>
              </>
            )}
          </div>

          {/* ── Summary ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
            <StatCard val={overallStats.pct !== null ? `${overallStats.pct}%` : "—"} label="Overall"
              color={overallStats.pct === null ? "default" : overallStats.pct >= 75 ? "green" : overallStats.pct >= 60 ? "amber" : "red"} />
            <StatCard val={overallStats.totalP} label="Present" color="green" />
            <StatCard val={overallStats.totalA} label="Absent"  color="red" />
            <StatCard val={overallStats.tB}     label="Bunked"  color="amber" />
          </div>

          {/* ── Insight ── */}
          {insight && (
            <div style={{
              borderRadius: 10, padding: "9px 13px", marginBottom: 14,
              fontSize: 12, lineHeight: 1.5,
              background: insight.type === "ok" ? "#e6f4ee" : insight.type === "warn" ? "#fdf0dc" : "#faeaea",
              border: `1px solid ${insight.type === "ok" ? "#a3d9be" : insight.type === "warn" ? "#e8c878" : "#e8aaaa"}`,
              color: insight.type === "ok" ? "#1a7a52" : insight.type === "warn" ? "#a05810" : "#b83030",
            }}>
              {insight.msg}
            </div>
          )}

          {/* ── Add Subjects ── */}
          <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa89e", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>
            Your Subjects
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input
              className="rf"
              placeholder="Type a subject name and press Enter"
              maxLength={50}
              value={subjectInput}
              onChange={e => setSubjectInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addSubject()}
            />
            <button className="btn-dark" onClick={addSubject}>+ Add</button>
          </div>

          {/* Subject tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18, minHeight: 28 }}>
            {subjects.length === 0
              ? <span style={{ fontSize: 12, color: "#aaa89e", fontStyle: "italic" }}>No subjects yet — add your first subject above</span>
              : subjects.map(s => (
                  <div key={s} className="stag">
                    <span>{s}</span>
                    <button className="btn-ghost" style={{ fontSize: 14, lineHeight: 1 }} onClick={() => deleteSubject(s)}>✕</button>
                  </div>
                ))
            }
          </div>

          {/* ── Legend ── */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
            {[["#1a7a52","Present"],["#b83030","Absent"],["#a05810","Bunk"],["#c5c2b8","Unmarked"],["#e8aaaa","Holiday"]].map(([bg,lbl]) => (
              <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6b6860" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: bg, flexShrink: 0 }} />{lbl}
              </div>
            ))}
          </div>

          {/* ── Calendar ── */}
          <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa89e", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>
            {MONTHS[viewMonth]} {viewYear} — click a weekday to mark attendance
          </div>

          <div style={{
            background: "#fff", border: "1px solid #e0ddd5",
            borderRadius: 14, overflow: "hidden", marginBottom: 16,
            boxShadow: "0 1px 3px rgba(0,0,0,.06)",
          }}>
            {/* Day headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", borderBottom: "1px solid #e0ddd5", background: "#eeecea" }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#aaa89e", padding: "8px 4px", textTransform: "uppercase", letterSpacing: ".05em" }}>{d}</div>
              ))}
            </div>

            {/* Cells */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)" }}>
              {calendarCells.map((cell, idx) => {
                if (cell.type === "blank") return <div key={`blank-${idx}`} className="cc empty" />;

                const { d, dk, isHoliday: hol, isToday: todayC, isFuture: future, isSelected: sel, stats } = cell;
                const numStyle = todayC && !sel
                  ? { background: "#1c1b18", color: "#fff", width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }
                  : { fontSize: 13, fontWeight: 700, fontFamily: "monospace", color: sel ? "rgba(255,255,255,.9)" : hol ? "#b83030" : future ? "#aaa89e" : "#1c1b18" };

                return (
                  <div
                    key={dk}
                    className={`cc ${hol ? "holiday" : ""} ${todayC && !sel ? "is-today" : ""} ${sel ? "selected" : ""} ${future ? "future" : ""}`}
                    onClick={() => { if (!future && !hol) { setSelectedKey(dk); } }}
                  >
                    <div style={numStyle}>{d}</div>
                    {hol && <div style={{ fontSize: 9, color: "#b83030", marginTop: 2, fontWeight: 600 }}>holiday</div>}
                    {!hol && subjects.length > 0 && (
                      <div style={{ display: "flex", gap: 2, flexWrap: "wrap", marginTop: 4 }}>
                        {subjects.map(s => {
                          const v = attendance[dk]?.[s];
                          const bg = v === "p" ? "#1a7a52" : v === "a" ? "#b83030" : v === "b" ? "#a05810" : "#c5c2b8";
                          return <div key={s} style={{ width: 5, height: 5, borderRadius: "50%", background: bg, flexShrink: 0 }} />;
                        })}
                      </div>
                    )}
                    {!hol && stats?.pct != null && (
                      <div style={{
                        fontSize: 9, fontWeight: 700, marginTop: 3, fontFamily: "monospace",
                        color: sel ? "rgba(255,255,255,.6)" : stats.pct >= 75 ? "#1a7a52" : stats.pct >= 60 ? "#a05810" : "#b83030",
                      }}>
                        {stats.pct}%
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Day Panel ── */}
          <div style={{
            background: "#fff", border: "1px solid #e0ddd5",
            borderRadius: 14, overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,.06)", marginBottom: 20,
          }}>
            {/* Panel header */}
            <div style={{
              padding: "13px 16px", borderBottom: "1px solid #e0ddd5",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "#eeecea",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>
                {selectedParts
                  ? fmtDateLong(selectedParts.y, selectedParts.m, selectedParts.d)
                  : "Select a day to mark attendance"}
              </div>
              {isFutureSelected && (
                <div style={{
                  fontSize: 11, color: "#aaa89e", background: "#f5f4f0",
                  border: "1px solid #e0ddd5", padding: "3px 10px", borderRadius: 100,
                }}>Future — locked</div>
              )}
            </div>

            {/* Panel body */}
            {!selectedKey ? (
              <div style={{ textAlign: "center", padding: "34px 20px", color: "#aaa89e", fontSize: 13 }}>
                ↑ Click any working day on the calendar above
              </div>
            ) : isHoliday(selectedKey) ? (
              <div style={{ textAlign: "center", padding: "28px 20px" }}>
                <div style={{ fontSize: 13, color: "#b83030", fontWeight: 600 }}>Holiday</div>
                <div style={{ fontSize: 12, color: "#aaa89e", marginTop: 4 }}>No classes scheduled</div>
              </div>
            ) : subjects.length === 0 ? (
              <div style={{ textAlign: "center", padding: "34px 20px", color: "#aaa89e", fontSize: 13 }}>
                Add your subjects above first, then mark attendance here
              </div>
            ) : (
              <div>
                {subjects.map(s => {
                  const cur  = attendance[selectedKey]?.[s] || null;
                  const sts  = getSubjectStats(s);
                  const pColor = sts.pct === null ? "#aaa89e" : sts.pct >= 75 ? "#1a7a52" : sts.pct >= 60 ? "#a05810" : "#b83030";
                  const pBg   = sts.pct === null ? "#eeecea" : sts.pct >= 75 ? "#e6f4ee" : sts.pct >= 60 ? "#fdf0dc" : "#faeaea";

                  return (
                    <div key={s} style={{
                      padding: "12px 16px", borderBottom: "1px solid #e0ddd5",
                      display: "flex", alignItems: "center", gap: 10,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, fontFamily: "monospace",
                            padding: "2px 7px", borderRadius: 100,
                            color: pColor, background: pBg,
                          }}>
                            {sts.pct !== null ? `${sts.pct}%` : "—"}
                          </span>
                          <span style={{ fontSize: 11, color: "#aaa89e", fontFamily: "monospace" }}>
                            {sts.p}P · {sts.a}A · {sts.b}Bk
                          </span>
                        </div>
                        <div className="prog">
                          <div className="prog-f" style={{
                            width: sts.pct !== null ? `${Math.min(sts.pct, 100)}%` : "0%",
                            background: pColor,
                          }} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        {[
                          { v: "p", label: cur === "p" ? "✓ Present" : "Present", cls: cur === "p" ? "on-p" : "" },
                          { v: "a", label: cur === "a" ? "✕ Absent"  : "Absent",  cls: cur === "a" ? "on-a" : "" },
                          { v: "b", label: cur === "b" ? "— Bunk"    : "Bunk",    cls: cur === "b" ? "on-b" : "" },
                        ].map(({ v, label, cls }) => (
                          <button
                            key={v}
                            className={`mbtn ${cls}`}
                            disabled={isFutureSelected}
                            onClick={() => markAttendance(s, v)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ fontSize: 11, color: "#aaa89e", textAlign: "center", lineHeight: 1.8 }}>
            Data saved in your browser &nbsp;·&nbsp; Sat &amp; Sun = no classes &nbsp;·&nbsp; Feb 28 &amp; Mar 1 = holidays<br />
            <strong style={{ color: "#6b6860" }}>Bunk</strong> = voluntary skip — not counted in absence % &nbsp;·&nbsp; % = Present ÷ (Present + Absent)
          </div>
        </div>

        <Toast toast={toast} />
      </div>
    </>
  );
}