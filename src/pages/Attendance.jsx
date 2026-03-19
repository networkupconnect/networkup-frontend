import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";




const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_MAP = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
const MONTH_S = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const EMPTY_FORM = { name: "", totalClasses: "", days: [] };

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
function pct(p, t) { return t ? Math.round((p / t) * 100) : 0; }

/** Client-side expected class counter — mirrors the backend calcSubjectClasses */
function calcExpected(subject, startDate, endDate, holidays) {
  if (!startDate || !subject?.days?.length) return 0;
  const hSet = new Set((holidays || []).map((h) => new Date(h).toDateString()));
  const subDays = new Set(subject.days.map((d) => DAY_MAP[d]).filter(Boolean));
  const per = subject.totalClassesPerDay || 1;
  const end = endDate ? new Date(endDate) : new Date();
  let count = 0;
  for (let d = new Date(startDate); d <= end; d.setDate(d.getDate() + 1)) {
    if (!subDays.has(d.getDay())) continue;
    if (hSet.has(d.toDateString())) continue;
    count += per;
  }
  return count;
}

function getWeekDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function fmtShort(date) {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
function fmtFull(date) {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* ─── Tiny calendar for holiday selection ────────────────────────────────────
   selected = string[] of "YYYY-MM-DD"
   onChange(newArr) called on every toggle
──────────────────────────────────────────────────────────────────────────────*/
function HolidayCalendar({ selected, onChange }) {
  const [view, setView] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const yr = view.getFullYear();
  const mo = view.getMonth();
  const first = new Date(yr, mo, 1).getDay();      // 0 = Sun
  const dim = new Date(yr, mo + 1, 0).getDate(); // days in month
  const offset = first === 0 ? 6 : first - 1;      // Mon-aligned offset
  const cells = [...Array(offset).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];

  const toStr = (day) =>
    `${yr}-${String(mo + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const isSel = (day) => selected.includes(toStr(day));
  const toggle = (day) => {
    const s = toStr(day);
    onChange(isSel(day) ? selected.filter((x) => x !== s) : [...selected, s]);
  };

  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: 10, overflow: "hidden" }}>
      {/* Nav */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "7px 12px", borderBottom: "1px solid #f0f0f0",
      }}>
        <button type="button"
          onClick={() => setView((v) => new Date(v.getFullYear(), v.getMonth() - 1, 1))}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#666", padding: "0 4px" }}>‹</button>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#111" }}>{MONTH_S[mo]} {yr}</span>
        <button type="button"
          onClick={() => setView((v) => new Date(v.getFullYear(), v.getMonth() + 1, 1))}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#666", padding: "0 4px" }}>›</button>
      </div>
      {/* Day labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", padding: "5px 8px 0" }}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 9, color: "#bbb", fontWeight: 600, padding: "1px 0" }}>{d}</div>
        ))}
      </div>
      {/* Cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, padding: "2px 8px 8px" }}>
        {cells.map((day, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "center" }}>
            {day && (
              <button type="button" onClick={() => toggle(day)} style={{
                width: 26, height: 26, borderRadius: 6, border: "none",
                background: isSel(day) ? "#111" : "transparent",
                color: isSel(day) ? "#fff" : "#444",
                fontSize: 10, fontWeight: isSel(day) ? 700 : 400,
                cursor: "pointer", fontFamily: "inherit",
              }}>{day}</button>
            )}
          </div>
        ))}
      </div>
      {selected.length > 0 && (
        <div style={{
          padding: "5px 12px 7px", borderTop: "1px solid #f5f5f5",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 10, color: "#888" }}>{selected.length} day{selected.length !== 1 ? "s" : ""} marked</span>
          <button type="button" onClick={() => onChange([])}
            style={{ fontSize: 10, color: "#999", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════════════════ */
export default function Attendance() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const weekDates = useMemo(() => getWeekDates(), []);
  const todayDate = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const defaultDay = useMemo(() => { const dow = new Date().getDay(); return Math.min(Math.max(dow - 1, 0), 5); }, []);

  const activeDayRef = useRef(defaultDay);
  const [activeDay, setActiveDayState] = useState(defaultDay);
  const setActiveDay = (d) => { activeDayRef.current = d; setActiveDayState(d); };

  const selectedDate = weekDates[activeDay];
  const selectedDateStr = selectedDate ? selectedDate.toISOString().slice(0, 10) : "";
  const isFutureDay = selectedDate ? selectedDate > todayDate : false;
  const isToday = (i) => weekDates[i]?.getTime() === todayDate.getTime();

  /* ── Core state ── */
  const [subjects, setSubjects] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [myData, setMyData] = useState({});
  const [rangeData, setRangeData] = useState(null); // null → use myData
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);
  const [dayAttendance, setDayAttendance] = useState({});

  /* ── Range state ── */
  const [ranges, setRanges] = useState([]);
  const [activeRange, setActiveRange] = useState("general");
  const [rangeLoading, setRangeLoading] = useState(false);
  const [showAddRange, setShowAddRange] = useState(false);
  const [rangeForm, setRangeForm] = useState({ name: "", startDate: "", endDate: "" });
  const [rangeSaving, setRangeSaving] = useState(false);

  /* ── Modals ── */
  const [showAdd, setShowAdd] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [showClassInfo, setShowClassInfo] = useState(false);
  const [advSubject, setAdvSubject] = useState(null);

  /* ── Forms ── */
  const [subForm, setSubForm] = useState(EMPTY_FORM);
  const [ciForm, setCiForm] = useState({ startDate: "", holidays: [], targetPct: "75" });
  const [advForm, setAdvForm] = useState({ present: "" });
  const [saving, setSaving] = useState(false);

  /* ── Advance info ── */
  const [advLockedMin, setAdvLockedMin] = useState(0);
  const [advUnmarkedDates, setAdvUnmarkedDates] = useState([]);
  const [advUnmarkedCount, setAdvUnmarkedCount] = useState(0);
  const [advInfoLoading, setAdvInfoLoading] = useState(false);

  /* ── Backfill ── */
  const [showBackfill, setShowBackfill] = useState(false);
  const [backfillForm, setBackfillForm] = useState({ pct: "", throughDate: "" });
  const [backfillSaving, setBackfillSaving] = useState(false);
  const [backfillPreview, setBackfillPreview] = useState(null); // { subjects:[{name,expected,present,absent}] }

  /* ════════════════════════════════════════════════════════════════════════════
     FETCH HELPERS
  ════════════════════════════════════════════════════════════════════════════ */
  const fetchSubjects = async (day) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/attendance/subjects?day=${DAY_FULL[day]}`);
      setSubjects(Array.isArray(res.data) ? res.data : (res.data?.subjects ?? []));
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to load subjects", "error");
      setSubjects([]);
    } finally { setLoading(false); }
  };

  const fetchAllSubjects = async () => {
    try {
      const res = await api.get("/api/attendance/subjects");
      setAllSubjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err.message); }
  };

  const fetchMyData = async () => {
    try {
      const res = await api.get("/api/attendance/my");
      const map = {};
      (Array.isArray(res.data) ? res.data : []).forEach((d) => { map[String(d.subjectId)] = d; });
      setMyData(map);
    } catch (err) { console.error(err.message); }
  };

  const fetchClassInfo = async () => {
    try {
      const res = await api.get("/api/attendance/classinfo");
      setClassInfo(res.data || null);
    } catch (err) { console.error(err.message); }
  };

  const fetchRanges = async () => {
    try {
      const res = await api.get("/api/attendance/ranges");
      setRanges(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err.message); }
  };

  const fetchRangeStats = useCallback(async (startDate, endDate) => {
    setRangeLoading(true);
    try {
      const p = new URLSearchParams({ startDate });
      if (endDate) p.append("endDate", endDate);
      const res = await api.get(`/api/attendance/range-stats?${p}`);
      const map = {};
      (Array.isArray(res.data) ? res.data : []).forEach((d) => { map[String(d.subjectId)] = d; });
      setRangeData(map);
    } catch (err) { console.error(err.message); setRangeData(null); }
    finally { setRangeLoading(false); }
  }, []);

  const fetchDayAttendance = useCallback(async (dateStr) => {
    if (!dateStr) return;
    try {
      const res = await api.get(`/api/attendance/day?date=${dateStr}`);
      setDayAttendance(res.data || {});
    } catch (err) { console.error(err.message); setDayAttendance({}); }
  }, []);

  /* ── Effects ── */
  useEffect(() => {
    if (!user) return;
    fetchAllSubjects();
    fetchMyData();
    fetchClassInfo();
    fetchRanges();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchSubjects(activeDay);
    fetchDayAttendance(selectedDateStr);
  }, [activeDay, user]);

  useEffect(() => {
    if (activeRange === "general") {
      setRangeData(null);
      setRangeLoading(false);
    } else {
      const r = ranges.find((x) => String(x._id) === activeRange);
      if (r) {
        const s = r.startDate.slice(0, 10);
        const e = r.endDate ? r.endDate.slice(0, 10) : null;
        fetchRangeStats(s, e);
      }
    }
  }, [activeRange, ranges]);

  /* ════════════════════════════════════════════════════════════════════════════
     TOAST
  ════════════════════════════════════════════════════════════════════════════ */
  const showToast = (msg, type = "success") => {
    clearTimeout(toastRef.current);
    setToast({ msg, type });
    toastRef.current = setTimeout(() => setToast(null), 2500);
  };

  /* ════════════════════════════════════════════════════════════════════════════
     ATTENDANCE MARKING
  ════════════════════════════════════════════════════════════════════════════ */
  const markAttendance = async (subjectId, status) => {
    if (isFutureDay) { showToast("Future date", "error"); return; }
    const cur = dayAttendance[String(subjectId)] || null;
    const eff = cur === status ? "unmark" : status;
    try {
      const res = await api.post(`/api/attendance/${subjectId}/mark`, { status: eff, date: selectedDateStr });
      setMyData((p) => ({ ...p, [String(subjectId)]: res.data }));
      setDayAttendance((p) => ({ ...p, [String(subjectId)]: eff === "unmark" ? null : eff }));
      if (activeRange !== "general") {
        const r = ranges.find((x) => String(x._id) === activeRange);
        if (r) fetchRangeStats(r.startDate.slice(0, 10), r.endDate?.slice(0, 10) || null);
      }
      showToast(eff === "unmark" ? "Unmarked" : eff === "present" ? "Present ✓" : eff === "absent" ? "Absent" : "Bunk recorded");
    } catch (err) { showToast(err?.response?.data?.message || "Failed", "error"); }
  };

  /* ════════════════════════════════════════════════════════════════════════════
     ADVANCE ENTRY
  ════════════════════════════════════════════════════════════════════════════ */
  const openAdvanceModal = async (s) => {
    const d = myData[String(s._id)] || { present: 0, absent: 0, massBunk: 0 };
    setAdvSubject(s);
    setAdvForm({ present: String(d.present) });
    setAdvLockedMin(0); setAdvUnmarkedDates([]); setAdvUnmarkedCount(0);
    setAdvInfoLoading(true);
    try {
      const res = await api.get(`/api/attendance/${s._id}/advance-info`);
      setAdvLockedMin(res.data.lockedMinimum || 0);
      setAdvUnmarkedDates(res.data.unmarkedDates || []);
      setAdvUnmarkedCount(res.data.unmarkedCount || 0);
    } catch (err) { console.error(err.message); }
    finally { setAdvInfoLoading(false); }
  };

  const handleAdvanceSave = async (e) => {
    e.preventDefault();
    if (!advSubject) return;
    setSaving(true);
    try {
      const res = await api.post(`/api/attendance/${advSubject._id}/advance`, { present: parseInt(advForm.present) || 0 });
      setMyData((p) => ({ ...p, [String(advSubject._id)]: res.data }));
      fetchDayAttendance(selectedDateStr);
      setAdvSubject(null); setAdvForm({ present: "" }); setAdvLockedMin(0); setAdvUnmarkedDates([]);
      showToast("Updated");
    } catch (err) { showToast(err?.response?.data?.message || "Failed", "error"); }
    finally { setSaving(false); }
  };

  /* ── Subject CRUD ── */
  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!subForm.name.trim() || !subForm.days.length) return showToast("Name and day required", "error");
    setSaving(true);
    try {
      const res = await api.post("/api/attendance/subjects", {
        name: subForm.name.trim(), totalClassesPerDay: Number(subForm.totalClasses) || 1, days: subForm.days,
      });
      if (res.data.days?.includes(DAY_FULL[activeDay])) setSubjects((p) => [...p, res.data]);
      fetchAllSubjects();
      setShowAdd(false); setSubForm(EMPTY_FORM);
      showToast("Subject added");
    } catch (err) { showToast(err?.response?.data?.message || "Failed", "error"); }
    finally { setSaving(false); }
  };

  const handleDeleteSubject = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/api/attendance/subjects/${id}`);
      setSubjects((p) => p.filter((s) => s._id !== id));
      setAllSubjects((p) => p.filter((s) => s._id !== id));
      setMyData((p) => { const n = { ...p }; delete n[String(id)]; return n; });
      showToast("Deleted");
    } catch (err) { showToast(err?.response?.data?.message || "Failed", "error"); }
  };

  const handleEditSubject = async (e) => {
    e.preventDefault();
    if (!editSubject) return;
    setSaving(true);
    try {
      const res = await api.put(`/api/attendance/subjects/${editSubject._id}`, {
        name: subForm.name.trim(), totalClassesPerDay: Number(subForm.totalClasses) || 1, days: subForm.days,
      });
      if (res.data.days?.includes(DAY_FULL[activeDay])) {
        setSubjects((p) => p.map((s) => (s._id === res.data._id ? res.data : s)));
      } else {
        setSubjects((p) => p.filter((s) => s._id !== res.data._id));
      }
      fetchAllSubjects();
      setEditSubject(null); setSubForm(EMPTY_FORM);
      showToast("Updated");
    } catch (err) { showToast(err?.response?.data?.message || "Failed", "error"); }
    finally { setSaving(false); }
  };

  const handleSaveClassInfo = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/attendance/classinfo", {
        startDate: ciForm.startDate,
        holidays: ciForm.holidays,
        targetPct: Number(ciForm.targetPct) || 75,
      });
      setClassInfo(res.data);
      fetchAllSubjects();
      fetchSubjects(activeDayRef.current);
      setShowClassInfo(false);
      showToast("Saved");
    } catch (err) { showToast(err?.response?.data?.message || "Failed", "error"); }
  };

  /* ── Backfill ── */
  const handleBackfill = async (e) => {
    e.preventDefault();
    const { pct: rawPct, throughDate } = backfillForm;
    if (!rawPct || !throughDate) return showToast("Fill all fields", "error");
    if (!classInfo?.startDate) return showToast("Set college start date first", "error");
    setBackfillSaving(true);
    try {
      const res = await api.post("/api/attendance/backfill", { pct: Number(rawPct), throughDate });
      // Merge returned per-subject totals into myData
      const newMap = { ...myData };
      (res.data.subjects || []).forEach((d) => { newMap[String(d.subjectId)] = d; });
      setMyData(newMap);
      setShowBackfill(false);
      setBackfillForm({ pct: "", throughDate: "" });
      setBackfillPreview(null);
      showToast("Backfill applied");
    } catch (err) { showToast(err?.response?.data?.message || "Failed", "error"); }
    finally { setBackfillSaving(false); }
  };

  // Compute a live preview matching the backend's exact-aggregate strategy:
  // total slots across all subjects → exact presentCount → distribute randomly.
  const computeBackfillPreview = (pctVal, throughDate) => {
    if (!pctVal || !throughDate || !classInfo?.startDate || !allSubjects.length) {
      setBackfillPreview(null); return;
    }
    const pctNum = Math.max(0, Math.min(100, Number(pctVal)));

    // Count expected days per subject
    const subExpected = allSubjects.map((s) => ({
      name: s.name,
      expected: calcExpected(s, classInfo.startDate, throughDate, classInfo.holidays || []),
    }));

    // Total slots = sum of (expected × perDay); preview uses expected directly
    const totalSlots = subExpected.reduce((a, s) => a + s.expected, 0);
    const totalPresent = Math.min(totalSlots, Math.round((pctNum / 100) * totalSlots));

    // Distribute proportionally per subject (preview only — actual is random)
    let remaining = totalPresent;
    const previews = subExpected.map((s, i) => {
      const isLast = i === subExpected.length - 1;
      const present = isLast
        ? remaining
        : Math.min(s.expected, Math.round((s.expected / (totalSlots || 1)) * totalPresent));
      remaining -= present;
      return { name: s.name, expected: s.expected, present, absent: s.expected - present };
    });
    setBackfillPreview(previews);
  };

  /* ── Range CRUD ── */
  const handleAddRange = async (e) => {
    e.preventDefault();
    if (!rangeForm.name.trim() || !rangeForm.startDate)
      return showToast("Name and start date required", "error");
    setRangeSaving(true);
    try {
      const res = await api.post("/api/attendance/ranges", rangeForm);
      setRanges((p) => [...p, res.data]);
      setShowAddRange(false);
      setRangeForm({ name: "", startDate: "", endDate: "" });
      showToast("Range added");
    } catch (err) { showToast(err?.response?.data?.message || "Failed", "error"); }
    finally { setRangeSaving(false); }
  };

  const handleDeleteRange = async (id) => {
    try {
      await api.delete(`/api/attendance/ranges/${id}`);
      setRanges((p) => p.filter((r) => String(r._id) !== id));
      if (activeRange === id) setActiveRange("general");
      showToast("Range removed");
    } catch (err) { showToast(err?.response?.data?.message || "Failed", "error"); }
  };

  /* ─── Summary calculations (range-aware) ──────────────────────────────────── */
  const targetP = classInfo?.targetPct || 75;

  // Returns data for a subject — rangeData if a personal range is active, else myData
  const getSubjectData = (id) =>
    ((rangeData ? rangeData[String(id)] : myData[String(id)]) || { present: 0, absent: 0, massBunk: 0 });

  // Determine which start/end/holidays to use for expected-class calculation
  const activeRangeObj = ranges.find((r) => String(r._id) === activeRange);
  const rangeStart = activeRange === "general" ? classInfo?.startDate : activeRangeObj?.startDate;
  const rangeEnd = activeRange === "general" ? null : (activeRangeObj?.endDate || null);
  const holidays = classInfo?.holidays || [];

  const totalPresent = allSubjects.reduce((a, s) => a + (getSubjectData(s._id).present || 0), 0);
  const totalAbsent = allSubjects.reduce((a, s) => a + (getSubjectData(s._id).absent || 0), 0);
  const totalMassBunk = allSubjects.reduce((a, s) => a + (getSubjectData(s._id).massBunk || 0), 0);

  // CORE FORMULA: % = present / (present + absent)
  // Bunk and unmarked days are NOT in the denominator.
  // Only explicitly marked present/absent days affect the percentage.
  const markedDays = totalPresent + totalAbsent;
  const overallPct = pct(totalPresent, markedDays);
  const showInsight = markedDays > 0 || totalMassBunk > 0;

  const classesNeeded = overallPct < targetP
    ? Math.max(0, Math.ceil(markedDays > 0 ? (targetP * markedDays - 100 * totalPresent) / (100 - targetP) : 0))
    : 0;
  const absentsAllowed = overallPct >= targetP
    ? Math.max(0, Math.floor(markedDays > 0 ? (100 * totalPresent - targetP * markedDays) / targetP : 0))
    : 0;

  /* ── Day tag helper ── */
  const toggleDay = (setter, fullDay) =>
    setter((p) => ({
      ...p,
      days: p.days.includes(fullDay) ? p.days.filter((x) => x !== fullDay) : [...p.days, fullDay],
    }));

  /* ── Unauthenticated ── */
  if (!user) return (
    <div style={{ fontFamily: "system-ui,sans-serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "#999", marginBottom: 14 }}>Login required</p>
        <button onClick={() => navigate("/login")}
          style={{ background: "#111", color: "#fff", border: "none", borderRadius: 8, padding: "9px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Login
        </button>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════════════ */
  return (
    <>
      {/*
        ⚠️  SCOPING FIX: All rules are prefixed with ".att" so they never
        bleed into other pages. The old code had bare "*{}" and "body{}"
        rules inside a <style> tag which affected the entire app.
      */}
      <style>{`
        .att, .att * { box-sizing: border-box; }
        .att { font-family: system-ui,-apple-system,'Segoe UI',sans-serif; min-height:100vh; background:#fff; color:#111; }

        /* Inputs */
        .att .rf { width:100%; background:#f9f9f9; border:1px solid #e5e5e5; border-radius:8px; padding:9px 12px; font-size:13px; font-family:inherit; color:#111; outline:none; }
        .att .rf:focus { border-color:#111; background:#fff; }
        .att .rf::placeholder { color:#ccc; }

        /* Buttons */
        .att .btn   { border:none; cursor:pointer; border-radius:8px; font-family:inherit; font-size:13px; font-weight:600; transition:background .12s; }
        .att .btn-k { background:#111; color:#fff; }
        .att .btn-k:hover { background:#333; }
        .att .btn-k:disabled { opacity:.4; cursor:not-allowed; }
        .att .btn-g { background:#f5f5f5; color:#555; }
        .att .btn-g:hover { background:#e8e8e8; color:#111; }
        .att .btn-lnk { background:none; border:none; cursor:pointer; font-family:inherit; font-size:12px; color:#aaa; padding:0; }
        .att .btn-lnk:hover { color:#111; }

        /* Day tags in form */
        .att .dtag { display:inline-flex; align-items:center; padding:4px 11px; border-radius:100px; font-size:11px; font-weight:600; cursor:pointer; border:none; font-family:inherit; }
        .att .dtag-off { background:#f5f5f5; color:#888; }
        .att .dtag-on  { background:#111; color:#fff; }

        /* Range tabs */
        .att .rtab { display:inline-flex; align-items:center; gap:4px; padding:5px 12px; border-radius:100px; font-size:11px; font-weight:600; cursor:pointer; border:1px solid #e5e5e5; background:#fff; color:#888; font-family:inherit; white-space:nowrap; transition:background .1s, color .1s; }
        .att .rtab.on { background:#111; color:#fff; border-color:#111; }
        .att .rtab:not(.on):hover { background:#f5f5f5; color:#555; }

        /* Mark buttons */
        .att .mbtn { flex:1; padding:7px 2px; border-radius:8px; font-size:11px; font-weight:600; border:1px solid #e5e5e5; background:#fff; color:#555; cursor:pointer; font-family:inherit; transition:background .1s,border-color .1s,color .1s; }
        .att .mbtn:disabled { opacity:.35; cursor:not-allowed; }
        .att .mbtn.on { background:#111; color:#fff; border-color:#111; }
        .att .mbtn-adv { background:#f9f9f9; color:#666; }
        .att .mbtn-adv:hover:not(:disabled) { background:#f0f0f0; }

        /* Modal */
        .att .overlay { position:fixed; inset:0; z-index:80; background:rgba(0,0,0,0.2); display:flex; align-items:center; justify-content:center; padding:20px; }
        .att .modal   { background:#fff; border-radius:16px; padding:22px; width:100%; max-width:400px; box-shadow:0 12px 40px rgba(0,0,0,0.1); max-height:90vh; overflow-y:auto; }

        /* Spinner */
        @keyframes att-spin { to { transform:rotate(360deg); } }
        .att .spin { width:14px; height:14px; border:2px solid #e5e5e5; border-top-color:#111; border-radius:50%; animation:att-spin .7s linear infinite; }

        /* Toast */
        @keyframes att-toast { from{opacity:0;transform:translateX(-50%) translateY(-4px);} to{opacity:1;transform:translateX(-50%) translateY(0);} }
        .att .toast { animation:att-toast .15s ease both; }
      `}</style>

      <div className="att">
        {/* Toast */}
        {toast && (
          <div className="toast" style={{
            position: "fixed", top: 14, left: "50%", zIndex: 100,
            background: "#111", color: "#fff", fontSize: 11, fontWeight: 600,
            padding: "7px 16px", borderRadius: 100, whiteSpace: "nowrap",
            boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
            transform: "translateX(-50%)", pointerEvents: "none",
          }}>
            {toast.type === "error" ? "✕ " : "✓ "}{toast.msg}
          </div>
        )}

        {/* ──────────────────────────── Add Subject Modal ── */}
        {showAdd && (
          <div className="overlay" onClick={() => setShowAdd(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Add Subject</p>
              <form onSubmit={handleAddSubject} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input className="rf" placeholder="Subject name *" autoFocus
                  value={subForm.name} onChange={(e) => setSubForm((p) => ({ ...p, name: e.target.value }))} />
                <input className="rf" type="number" placeholder="Classes per day (default 1)"
                  value={subForm.totalClasses} onChange={(e) => setSubForm((p) => ({ ...p, totalClasses: e.target.value }))} />
                <div>
                  <p style={{ fontSize: 11, color: "#aaa", fontWeight: 600, marginBottom: 7 }}>Occurs on</p>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {DAYS.map((d, i) => (
                      <button key={d} type="button"
                        className={`dtag ${subForm.days.includes(DAY_FULL[i]) ? "dtag-on" : "dtag-off"}`}
                        onClick={() => toggleDay(setSubForm, DAY_FULL[i])}>{d}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button type="submit" className="btn btn-k" style={{ flex: 1, padding: 10 }} disabled={saving}>{saving ? "Adding…" : "Add"}</button>
                  <button type="button" className="btn btn-g" style={{ padding: "10px 16px" }}
                    onClick={() => { setShowAdd(false); setSubForm(EMPTY_FORM); }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ──────────────────────────── Edit Subject Modal ── */}
        {editSubject && (
          <div className="overlay" onClick={() => setEditSubject(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Edit Subject</p>
              <form onSubmit={handleEditSubject} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input className="rf" placeholder="Subject name" autoFocus
                  value={subForm.name} onChange={(e) => setSubForm((p) => ({ ...p, name: e.target.value }))} />
                <input className="rf" type="number" placeholder="Classes per day"
                  value={subForm.totalClasses} onChange={(e) => setSubForm((p) => ({ ...p, totalClasses: e.target.value }))} />
                <div>
                  <p style={{ fontSize: 11, color: "#aaa", fontWeight: 600, marginBottom: 7 }}>Occurs on</p>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {DAYS.map((d, i) => (
                      <button key={d} type="button"
                        className={`dtag ${subForm.days.includes(DAY_FULL[i]) ? "dtag-on" : "dtag-off"}`}
                        onClick={() => toggleDay(setSubForm, DAY_FULL[i])}>{d}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button type="submit" className="btn btn-k" style={{ flex: 1, padding: 10 }} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
                  <button type="button" className="btn btn-g" style={{ padding: "10px 16px" }}
                    onClick={() => setEditSubject(null)}>Cancel</button>
                </div>
                <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 10, marginTop: 2 }}>
                  <button type="button" className="btn-lnk" style={{ color: "#dc2626", fontSize: 12, fontWeight: 600 }}
                    onClick={() => { setEditSubject(null); handleDeleteSubject(editSubject._id, editSubject.name); }}>
                    Delete subject
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ──────────────────────────── Advance Entry Modal ── */}
        {advSubject && (() => {
          const d = myData[String(advSubject._id)] || { present: 0, absent: 0, massBunk: 0 };
          // Denominator = present + absent only (bunk never counted)
          const att = d.present + d.absent;

          const newP = parseInt(advForm.present);
          const isNum = !isNaN(newP) && advForm.present !== "";
          const invld = isNum && (newP < advLockedMin || newP > att);
          const prePct = isNum && !invld ? pct(newP, att) : null;

          return (
            <div className="overlay" onClick={() => { setAdvSubject(null); setAdvLockedMin(0); setAdvUnmarkedDates([]); }}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>Advance Entry</p>
                <p style={{ fontSize: 11, color: "#aaa", marginBottom: 14 }}>{advSubject.name}</p>

                {advInfoLoading && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div className="spin" /><span style={{ fontSize: 11, color: "#aaa" }}>Checking records…</span>
                  </div>
                )}

                {!advInfoLoading && advUnmarkedCount > 0 && (
                  <div style={{ background: "#fafafa", border: "1px solid #e5e5e5", borderRadius: 8, padding: "9px 12px", marginBottom: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>⚠ {advUnmarkedCount} past day{advUnmarkedCount !== 1 ? "s" : ""} unmarked</p>
                    <p style={{ fontSize: 11, color: "#888", marginTop: 3 }}>Mark daily attendance first for accuracy.</p>
                    {advUnmarkedDates.length > 0 && (
                      <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {advUnmarkedDates.slice(0, 6).map((d) => (
                          <span key={d} style={{ fontSize: 10, padding: "2px 7px", background: "#f0f0f0", color: "#666", borderRadius: 100 }}>{d}</span>
                        ))}
                        {advUnmarkedDates.length > 6 && <span style={{ fontSize: 10, color: "#aaa" }}>+{advUnmarkedDates.length - 6} more</span>}
                      </div>
                    )}
                  </div>
                )}

                {!advInfoLoading && advLockedMin > 0 && (
                  <div style={{ background: "#f5f5f5", borderRadius: 8, padding: "9px 12px", marginBottom: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>🔒 {advLockedMin} locked from daily records — cannot go below</p>
                  </div>
                )}

                <div style={{ background: "#f9f9f9", borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}>
                  {[
                    ["Marked days (P+A)", att],
                    ["Present", d.present],
                    ["Absent", d.absent],
                    ["Current %", `${pct(d.present, att)}%`],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "2px 0" }}>
                      <span style={{ color: "#888" }}>{label}</span>
                      <span style={{ fontWeight: 600 }}>{val}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAdvanceSave} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "#aaa", fontWeight: 600, display: "block", marginBottom: 5 }}>
                      Present count — min {advLockedMin}, max {att}
                    </label>
                    <input className="rf" type="number" min={advLockedMin} max={att} autoFocus
                      placeholder={`Current: ${d.present}`} value={advForm.present}
                      onChange={(e) => setAdvForm({ present: e.target.value })} />
                  </div>

                  {isNum && (
                    <div style={{ background: "#f5f5f5", borderRadius: 8, padding: "9px 12px" }}>
                      {invld ? (
                        <p style={{ fontSize: 12, color: "#555" }}>
                          {newP < advLockedMin ? `Minimum is ${advLockedMin}` : `Maximum is ${att}`}
                        </p>
                      ) : (
                        <p style={{ fontSize: 12, fontWeight: 700 }}>
                          {prePct}% — {newP} present · {Math.max(0, att - newP)} absent
                        </p>
                      )}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="submit" className="btn btn-k" style={{ flex: 1, padding: 10 }}
                      disabled={saving || invld || !isNum}>{saving ? "Saving…" : "Update"}</button>
                    <button type="button" className="btn btn-g" style={{ padding: "10px 16px" }}
                      onClick={() => { setAdvSubject(null); setAdvForm({ present: "" }); setAdvLockedMin(0); setAdvUnmarkedDates([]); }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}

        {/* ──────────────────────────── Class Info Modal ── */}
        {showClassInfo && (
          <div className="overlay" onClick={() => setShowClassInfo(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>Class Configuration</p>
              <p style={{ fontSize: 11, color: "#aaa", marginBottom: 16 }}>Shared for your course, year & section</p>
              <form onSubmit={handleSaveClassInfo} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: "#aaa", fontWeight: 600, display: "block", marginBottom: 5 }}>College start date</label>
                  <input className="rf" type="date"
                    value={ciForm.startDate} onChange={(e) => setCiForm((p) => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#aaa", fontWeight: 600, display: "block", marginBottom: 5 }}>Target attendance %</label>
                  <input className="rf" type="number" placeholder="75" min="1" max="100"
                    value={ciForm.targetPct} onChange={(e) => setCiForm((p) => ({ ...p, targetPct: e.target.value }))} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <label style={{ fontSize: 11, color: "#aaa", fontWeight: 600 }}>
                      Holidays / Bunk days — click to mark
                    </label>
                    {ciForm.holidays.length > 0 && (
                      <button type="button" className="btn-lnk"
                        onClick={() => setCiForm((p) => ({ ...p, holidays: [] }))}>
                        Clear ({ciForm.holidays.length})
                      </button>
                    )}
                  </div>
                  <HolidayCalendar
                    selected={ciForm.holidays}
                    onChange={(h) => setCiForm((p) => ({ ...p, holidays: h }))}
                  />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="submit" className="btn btn-k" style={{ flex: 1, padding: 10 }}>Save</button>
                  <button type="button" className="btn btn-g" style={{ padding: "10px 16px" }}
                    onClick={() => setShowClassInfo(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ──────────────────────────── Add Range Modal ── */}
        {showAddRange && (
          <div className="overlay" onClick={() => setShowAddRange(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Add Personal Range</p>
              <p style={{ fontSize: 11, color: "#aaa", marginBottom: 16 }}>Track attendance for a specific period (e.g. Term 1, Mid-sem)</p>
              <form onSubmit={handleAddRange} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input className="rf" placeholder="Range name *" autoFocus
                  value={rangeForm.name} onChange={(e) => setRangeForm((p) => ({ ...p, name: e.target.value }))} />
                <div>
                  <label style={{ fontSize: 11, color: "#aaa", fontWeight: 600, display: "block", marginBottom: 5 }}>Start date *</label>
                  <input className="rf" type="date"
                    value={rangeForm.startDate} onChange={(e) => setRangeForm((p) => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#aaa", fontWeight: 600, display: "block", marginBottom: 5 }}>End date (empty = today onwards)</label>
                  <input className="rf" type="date"
                    value={rangeForm.endDate} onChange={(e) => setRangeForm((p) => ({ ...p, endDate: e.target.value }))} />
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button type="submit" className="btn btn-k" style={{ flex: 1, padding: 10 }} disabled={rangeSaving}>
                    {rangeSaving ? "Adding…" : "Add Range"}
                  </button>
                  <button type="button" className="btn btn-g" style={{ padding: "10px 16px" }}
                    onClick={() => setShowAddRange(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ──────────────────────────── Backfill Modal ── */}
        {showBackfill && (
          <div className="overlay" onClick={() => { setShowBackfill(false); setBackfillPreview(null); }}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>Backfill Past Attendance</p>
              <p style={{ fontSize: 11, color: "#aaa", marginBottom: 14, lineHeight: 1.5 }}>
                Enter your overall attendance % and the date up to which you had that %.
                Each subject will be filled in with a slightly randomised split of present/absent.
              </p>

              {!classInfo?.startDate && (
                <div style={{ background: "#f5f5f5", borderRadius: 8, padding: "9px 12px", marginBottom: 12 }}>
                  <p style={{ fontSize: 12, color: "#888" }}>Set college start date first (in Class Config above).</p>
                </div>
              )}

              <form onSubmit={handleBackfill} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                <div>
                  <label style={{ fontSize: 11, color: "#aaa", fontWeight: 600, display: "block", marginBottom: 5 }}>
                    Overall attendance % you had
                  </label>
                  <input className="rf" type="number" min="0" max="100" placeholder="e.g. 75" autoFocus
                    value={backfillForm.pct}
                    onChange={(e) => {
                      const v = e.target.value;
                      setBackfillForm((p) => ({ ...p, pct: v }));
                      computeBackfillPreview(v, backfillForm.throughDate);
                    }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#aaa", fontWeight: 600, display: "block", marginBottom: 5 }}>
                    Up to date (inclusive){classInfo?.startDate ? ` — college started ${new Date(classInfo.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : ""}
                  </label>
                  <input className="rf" type="date"
                    min={classInfo?.startDate?.slice(0, 10)}
                    max={new Date().toISOString().slice(0, 10)}
                    value={backfillForm.throughDate}
                    onChange={(e) => {
                      const v = e.target.value;
                      setBackfillForm((p) => ({ ...p, throughDate: v }));
                      computeBackfillPreview(backfillForm.pct, v);
                    }} />
                </div>

                {/* Live preview table */}
                {backfillPreview && backfillPreview.length > 0 && (
                  <div style={{ border: "1px solid #e5e5e5", borderRadius: 9, overflow: "hidden" }}>
                    <div style={{
                      display: "grid", gridTemplateColumns: "1fr auto auto auto",
                      gap: 0, background: "#f9f9f9",
                      borderBottom: "1px solid #e5e5e5", padding: "5px 10px",
                    }}>
                      {["Subject", "Exp", "P", "A"].map((h) => (
                        <span key={h} style={{
                          fontSize: 10, fontWeight: 700, color: "#aaa",
                          textAlign: h !== "Subject" ? "center" : "left"
                        }}>{h}</span>
                      ))}
                    </div>
                    <div style={{ maxHeight: 180, overflowY: "auto" }}>
                      {backfillPreview.map((row) => (
                        <div key={row.name} style={{
                          display: "grid", gridTemplateColumns: "1fr auto auto auto",
                          padding: "5px 10px", borderBottom: "1px solid #f5f5f5",
                          alignItems: "center",
                        }}>
                          <span style={{ fontSize: 11, color: "#444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {row.name}
                          </span>
                          <span style={{ fontSize: 11, color: "#aaa", textAlign: "center", minWidth: 28 }}>{row.expected || "—"}</span>
                          <span style={{ fontSize: 11, color: "#555", fontWeight: 600, textAlign: "center", minWidth: 28 }}>{row.present}</span>
                          <span style={{ fontSize: 11, color: "#888", textAlign: "center", minWidth: 28 }}>{row.absent}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: "6px 10px", background: "#f9f9f9", borderTop: "1px solid #f0f0f0" }}>
                      <p style={{ fontSize: 10, color: "#bbb" }}>
                        Preview — actual splits will vary slightly per subject (±8%)
                      </p>
                    </div>
                  </div>
                )}

                <div style={{ background: "#f5f5f5", borderRadius: 8, padding: "8px 12px" }}>
                  <p style={{ fontSize: 11, color: "#888", lineHeight: 1.5 }}>
                    This will <strong>replace</strong> any existing backfill records.
                    Daily-marked and advance entries are not affected.
                  </p>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button type="submit" className="btn btn-k" style={{ flex: 1, padding: 10 }}
                    disabled={backfillSaving || !backfillForm.pct || !backfillForm.throughDate || !classInfo?.startDate}>
                    {backfillSaving ? "Applying…" : "Apply Backfill"}
                  </button>
                  <button type="button" className="btn btn-g" style={{ padding: "10px 16px" }}
                    onClick={() => { setShowBackfill(false); setBackfillPreview(null); }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ════════════════════════════ PAGE ════════════════════════════════════ */}
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px 80px" }}>

          {/* Header */}
          <div style={{ padding: "18px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => navigate("/")} style={{
                width: 32, height: 32, borderRadius: 8,
                border: "1px solid #e5e5e5", background: "#fff",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="13" height="13" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700 }}>Attendance</p>
                <p style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>
                  {user.course || "—"} · {user.year || "—"} · {user.section || "—"}
                </p>
              </div>
            </div>
            <button className="btn btn-k" style={{ padding: "7px 14px" }}
              onClick={() => { setSubForm(EMPTY_FORM); setShowAdd(true); }}> + Add</button>
          </div>

          {/* ── Summary card ── */}
          <div style={{ background: "#f9f9f9", borderRadius: 14, padding: 14, marginTop: 16 }}>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
              {[
                { label: "Overall", val: `${overallPct}%`, sub: `${totalPresent}/${markedDays}` },
                { label: "Present", val: totalPresent },
                { label: "Absent", val: totalAbsent },
                { label: "Bunk", val: totalMassBunk },
              ].map(({ label, val, sub }) => (
                <div key={label} style={{ background: "#fff", borderRadius: 10, padding: "10px 8px", textAlign: "center", border: "1px solid #f0f0f0" }}>
                  <p style={{ fontSize: label === "Overall" ? 20 : 18, fontWeight: 800, lineHeight: 1, color: "#111" }}>{val}</p>
                  <p style={{ fontSize: 9, color: "#aaa", fontWeight: 600, marginTop: 3 }}>{label}</p>
                  {sub && <p style={{ fontSize: 9, color: "#ccc", marginTop: 1 }}>{sub}</p>}
                </div>
              ))}
            </div>

            {/* Insight line — always visible when range context exists */}
            {showInsight && (
              <p style={{ fontSize: 12, color: "#555", marginBottom: 10, lineHeight: 1.5, minHeight: 18 }}>
                {rangeLoading ? (
                  <span style={{ color: "#ccc" }}>Calculating…</span>
                ) : markedDays === 0
                  ? <span style={{ color: "#ccc" }}>No marked attendance yet</span>
                  : overallPct >= targetP
                    ? `On track — can skip ${absentsAllowed} more absent${absentsAllowed !== 1 ? "s" : ""} and stay above ${targetP}%`
                    : `Need ${classesNeeded} more present${classesNeeded !== 1 ? "s" : ""} to reach ${targetP}%`}
              </p>
            )}

            {/* Class info strip */}
            {classInfo ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "#888" }}>
                    Start: {new Date(classInfo.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span style={{ fontSize: 11, color: "#888" }}>Target: {targetP}%</span>
                  <span style={{ fontSize: 11, color: "#888" }}>Holidays: {classInfo.holidays?.length || 0}</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button className=" bg-red-500  font-semibold text-black rounded-md p-1 m-1" onClick={() => setShowBackfill(true)}>
                    BackFill
                  </button>
                  <button className="btn-lnk" onClick={() => {
                    setCiForm({
                      startDate: classInfo.startDate?.slice(0, 10) || "",
                      holidays: classInfo.holidays || [],
                      targetPct: classInfo.targetPct || 75,
                    });
                    setShowClassInfo(true);
                  }}>Edit</button>
                </div>
              </div>
            ) : (
              <button style={{
                width: "100%", padding: 9, background: "#fff",
                border: "1px dashed #ddd", borderRadius: 8,
                fontSize: 12, fontWeight: 600, color: "#999",
                cursor: "pointer", fontFamily: "inherit",
              }}
                onClick={() => { setCiForm({ startDate: "", holidays: [], targetPct: "75" }); setShowClassInfo(true); }}>
                + Set college start date & target
              </button>
            )}
          </div>




          {/* ── Range tabs ─────────────────────────────────────────────────────
              General tab (shared start date from classInfo) + personal ranges.
              Clicking a tab recalculates all stats for that date window.
          ──────────────────────────────────────────────────────────────────── */}
          <div style={{ marginTop: 12, display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, alignItems: "center" }}>
            {/* General (college-wide) */}
            <button className={`rtab${activeRange === "general" ? " on" : ""}`}
              onClick={() => setActiveRange("general")}>
              General
              {classInfo?.startDate ? ` · ${new Date(classInfo.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}
            </button>

            {/* Personal ranges */}
            {ranges.map((r) => (
              <div key={r._id} style={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                <button className={`rtab${activeRange === String(r._id) ? " on" : ""}`}
                  onClick={() => setActiveRange(String(r._id))}>
                  {r.name}
                  <span style={{ fontSize: 9, opacity: 0.7, marginLeft: 3 }}>
                    {new Date(r.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    {r.endDate ? ` – ${new Date(r.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}
                  </span>
                </button>
                <button
                  title="Delete range"
                  onClick={() => handleDeleteRange(String(r._id))}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 13, color: "#ccc", padding: "0 3px", lineHeight: 1,
                    fontFamily: "inherit",
                  }}>×</button>
              </div>
            ))}

            {/* Add range */}
            <button className="rtab" style={{ borderStyle: "dashed" }}
              onClick={() => setShowAddRange(true)}>+ Range</button>
          </div>

          {/* ── Week calendar ── */}
          <div style={{ marginTop: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <p style={{ fontSize: 11, color: "#bbb", fontWeight: 500 }}>
                {weekDates[0] ? fmtShort(weekDates[0]) : ""} — {weekDates[5] ? fmtFull(weekDates[5]) : ""}
              </p>
              {isFutureDay && <span style={{ fontSize: 10, color: "#aaa", fontWeight: 600 }}>🔒 Future</span>}
            </div>
            <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 4 }}>
              {DAYS.map((d, i) => {
                const date = weekDates[i];
                const future = date ? date > todayDate : false;
                const active = activeDay === i;
                const today = isToday(i);
                return (
                  <button key={d} onClick={() => setActiveDay(i)} style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", minWidth: 48, padding: "7px 8px",
                    borderRadius: 10, flexShrink: 0, fontFamily: "inherit",
                    border: `1px solid ${active ? "#111" : future ? "#f0f0f0" : "#e5e5e5"}`,
                    background: active ? "#111" : future ? "#fafafa" : "#fff",
                    color: active ? "#fff" : future ? "#ccc" : "#555",
                    cursor: "pointer",
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 600 }}>{d}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2, marginTop: 1 }}>
                      {date ? date.getDate() : "—"}
                    </span>
                    <span style={{
                      width: 3, height: 3, borderRadius: "50%", marginTop: 3,
                      background: active ? "#fff" : today ? "#111" : "transparent",
                      opacity: today || active ? 1 : 0,
                    }} />
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: 11, color: "#ccc", marginTop: 6 }}>
              {selectedDate
                ? isFutureDay
                  ? `${fmtShort(selectedDate)} — not here yet`
                  : isToday(activeDay)
                    ? `Today, ${fmtShort(selectedDate)}`
                    : fmtShort(selectedDate)
                : ""}
            </p>
          </div>

          {/* ── Subject cards ── */}
          <div style={{ marginTop: 14 }}>
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "50px 0" }}>
                <div className="spin" style={{ width: 18, height: 18, border: "2px solid #e5e5e5", borderTopColor: "#111" }} />
              </div>
            ) : subjects.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 0" }}>
                <p style={{ fontSize: 13, fontWeight: 600 }}>No subjects on {DAYS[activeDay]}</p>
                <p style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>Add a subject for this day</p>
                <button className="btn btn-k" style={{ marginTop: 12, padding: "8px 18px" }}
                  onClick={() => { setSubForm({ name: "", totalClasses: "", days: [DAY_FULL[activeDay]] }); setShowAdd(true); }}>
                  + Add Subject
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {/* Future day notice */}
                {isFutureDay && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "#fafafa", border: "1px solid #ebebeb",
                    borderRadius: 10, padding: "10px 12px",
                  }}>
                    <span>Locked</span>
                    <p style={{ fontSize: 12, color: "#aaa", fontWeight: 600 }}>
                      Marking locked — come back on {fmtShort(selectedDate)}
                    </p>
                  </div>
                )}

                {subjects.map((s) => {
                  const d = getSubjectData(s._id);
                  // % = present / (present + absent) per subject
                  // Bunk and unmarked days never enter the denominator
                  const subMarked = d.present + d.absent;
                  const dispPct = pct(d.present, subMarked);
                  const needed = subMarked > 0
                    ? Math.max(0, Math.ceil((targetP * subMarked - 100 * d.present) / (100 - targetP)))
                    : 0;
                  const todayStatus = dayAttendance[String(s._id)] || null;

                  return (
                    <div key={s._id} style={{
                      background: "#fff", border: "1px solid #e5e5e5",
                      borderRadius: 12, padding: "12px 12px 10px",
                      opacity: isFutureDay ? 0.65 : 1,
                    }}>
                      {/* Card header */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{s.name}</p>
                          <p style={{ fontSize: 11, color: "#aaa" }}>
                            {d.present}P · {d.absent}A{d.massBunk > 0 ? ` · ${d.massBunk}bk` : ""}
                          </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
                          <span style={{
                            fontSize: 12, fontWeight: 700,
                            color: dispPct >= 75 ? "#16a34a" : dispPct >= 60 ? "#d97706" : "#dc2626",
                          }}>
                            {dispPct}%
                          </span>
                          <button className="btn-lnk" onClick={() => {
                            setSubForm({ name: s.name, totalClasses: s.totalClassesPerDay || 1, days: s.days || [] });
                            setEditSubject(s);
                          }}>Edit</button>
                        </div>
                      </div>

                      {/* Slim progress bar */}
                      <div style={{ height: 2, background: "#f0f0f0", borderRadius: 100, marginBottom: 8, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${Math.min(dispPct, 100)}%`, // dispPct = P/(P+A)
                          background: "#111", borderRadius: 100, transition: "width .3s",
                        }} />
                      </div>

                      {/* Today's status chip */}
                      {!isFutureDay && todayStatus && (
                        <p style={{ fontSize: 11, color: "#888", marginBottom: 7 }}>
                          {todayStatus === "present" ? "✓ Present" : todayStatus === "absent" ? "✕ Absent" : "— Bunk"} today · tap to undo
                        </p>
                      )}

                      {/* Action buttons */}
                      <div style={{ display: "flex", gap: 4 }}>
                        {[
                          { key: "present", label: todayStatus === "present" ? "✓ Present" : "Present" },
                          { key: "absent", label: todayStatus === "absent" ? "✕ Absent" : "Absent" },
                          { key: "massBunk", label: todayStatus === "massBunk" ? "— Bunk" : "Bunk" },
                        ].map(({ key, label }) => (
                          <button key={key} className={`mbtn${todayStatus === key ? " on" : ""}`}
                            disabled={isFutureDay}
                            onClick={() => markAttendance(s._id, key)}>
                            {label}
                          </button>
                        ))}
                        <button className="mbtn mbtn-adv" onClick={() => openAdvanceModal(s)}>
                          Advance
                        </button>
                      </div>

                      {/* Below target warning */}
                      {dispPct < targetP && subMarked > 0 && (
                        <p style={{ fontSize: 11, color: "#aaa", marginTop: 7 }}>
                          Need {needed} more present to reach {targetP}%
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}