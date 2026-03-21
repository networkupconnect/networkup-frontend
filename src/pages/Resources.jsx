import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

/* ─── Upload Modal ──────────────────────────────────────────────────────── */
function UploadModal({ activeTab, onClose, onSuccess, showToast }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", subject: "", unit: "",
    lectureLink: "", notesLink: "",
  });

  const tabLabel = { notes:"Note", pyq:"PYQ", assignment:"Assignment" }[activeTab] || "Resource";

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim())   return showToast("Title is required");
    if (!form.subject.trim()) return showToast("Subject is required");
    if (!form.lectureLink.trim() && !form.notesLink.trim())
      return showToast("Add at least one link");

    try {
      setSaving(true);
      await api.post("/api/resources", {
        title:        form.title.trim(),
        description:  form.description.trim(),
        type:         activeTab,
        subject:      form.subject.trim(),
        unit:         form.unit.trim() || "General",
        lectureLink:  form.lectureLink.trim(),
        notesLink:    form.notesLink.trim(),
      });
      onSuccess();
      onClose();
      showToast("Saved!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const inp = {
    width:"100%", padding:"9px 12px", borderRadius:10,
    border:"1px solid #e5e3dc", background:"#fff",
    fontSize:13, fontFamily:"inherit", color:"#1a1a18",
    outline:"none", boxSizing:"border-box",
  };
  const lbl = {
    fontSize:10, fontWeight:700, color:"#9b9890",
    textTransform:"uppercase", letterSpacing:".05em",
    display:"block", marginBottom:5,
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:50, background:"rgba(0,0,0,.2)", backdropFilter:"blur(4px)", display:"flex", alignItems:"flex-end", justifyContent:"center", padding:16 }}
         onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:"18px 18px 0 0", width:"100%", maxWidth:520, maxHeight:"92vh", overflowY:"auto", boxShadow:"0 -8px 40px rgba(0,0,0,.1)" }}
           onClick={e => e.stopPropagation()}>
        <div style={{ padding:20 }}>

          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
            <div style={{ fontSize:15, fontWeight:800 }}>Add {tabLabel}</div>
            <button onClick={onClose} style={{ width:28, height:28, borderRadius:7, border:"1px solid #e5e3dc", background:"#f5f4f0", cursor:"pointer", color:"#9b9890", fontSize:13 }}>✕</button>
          </div>

          <form onSubmit={handleSave} style={{ display:"flex", flexDirection:"column", gap:13 }}>

            {/* Title */}
            <div>
              <label style={lbl}>Title *</label>
              <input style={inp} placeholder="e.g. Unit 3 — Thermodynamics" value={form.title} onChange={f("title")} required />
            </div>

            {/* Subject + Unit side by side */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div>
                <label style={lbl}>Subject *</label>
                <input style={inp} placeholder="Physics, Math…" value={form.subject} onChange={f("subject")} required />
              </div>
              <div>
                <label style={lbl}>Unit / Topic</label>
                <input style={inp} placeholder="Unit 2, Chapter 5…" value={form.unit} onChange={f("unit")} />
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop:"1px solid #f0ede8" }} />

            {/* Lecture Link */}
            <div>
              <label style={lbl}>Lecture Link</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:14, pointerEvents:"none" }}>▶</span>
                <input style={{...inp, paddingLeft:30}} placeholder="YouTube video or playlist URL" value={form.lectureLink} onChange={f("lectureLink")} type="url" />
              </div>
              <div style={{ fontSize:10, color:"#b5b3ac", marginTop:3 }}>YouTube video or playlist</div>
            </div>

            {/* Notes Link */}
            <div>
              <label style={lbl}>Notes Link</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:14, pointerEvents:"none" }}>🔗</span>
                <input style={{...inp, paddingLeft:30}} placeholder="Google Drive or any notes URL" value={form.notesLink} onChange={f("notesLink")} type="url" />
              </div>
              <div style={{ fontSize:10, color:"#b5b3ac", marginTop:3 }}>Google Drive, PDF link, etc.</div>
            </div>

            {/* Description */}
            <div>
              <label style={lbl}>Description</label>
              <textarea style={{...inp, resize:"none", minHeight:52}} placeholder="Optional — any extra context" value={form.description} onChange={f("description")} rows={2} />
            </div>

            {/* Actions */}
            <div style={{ display:"flex", gap:8, paddingTop:2 }}>
              <button type="submit" disabled={saving} style={{ flex:1, padding:"11px", borderRadius:11, border:"none", background:"#1a1a18", color:"#fff", fontSize:13, fontWeight:700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? .6 : 1, fontFamily:"inherit" }}>
                {saving ? "Saving…" : `Save ${tabLabel}`}
              </button>
              <button type="button" onClick={onClose} style={{ padding:"11px 16px", borderRadius:11, border:"1px solid #e5e3dc", background:"#f5f4f0", color:"#6b6860", fontSize:13, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

/* ─── Resource Card ─────────────────────────────────────────────────────── */
function ResourceCard({ resource, user, onDelete }) {
  const hasLecture = !!resource.lectureLink;
  const hasNotes   = !!resource.notesLink;
  const isOwner    = user?._id === resource.uploadedBy?._id?.toString();

  const openLink = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ background:"#fff", border:"1px solid #e5e3dc", borderRadius:13, padding:"13px 15px" }}>

      {/* Top row: title + delete */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10, marginBottom:7 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, lineHeight:1.4 }}>{resource.title}</div>
          {resource.description && (
            <div style={{ fontSize:11, color:"#9b9890", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{resource.description}</div>
          )}
        </div>
        {isOwner && (
          <button onClick={() => onDelete(resource._id)}
            style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:"#d1d0ca", padding:0, flexShrink:0, marginTop:1 }}>
            🗑
          </button>
        )}
      </div>

      {/* Tags */}
      <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
        <span style={{ fontSize:10, padding:"2px 8px", borderRadius:100, background:"#1a1a18", color:"#fff", fontWeight:700 }}>
          {resource.subject}
        </span>
        {resource.unit && resource.unit !== "General" && (
          <span style={{ fontSize:10, padding:"2px 8px", borderRadius:100, background:"#f0ede8", color:"#6b6860", fontWeight:600 }}>
            {resource.unit}
          </span>
        )}
      </div>

      {/* Link buttons */}
      {(hasLecture || hasNotes) && (
        <div style={{ display:"flex", gap:7 }}>
          {hasLecture && (
            <button onClick={() => openLink(resource.lectureLink)}
              style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"8px 12px", borderRadius:9, border:"1px solid #e5e3dc", background:"#fafaf9", cursor:"pointer", fontSize:12, fontWeight:600, color:"#1a1a18", fontFamily:"inherit" }}>
              <span style={{ fontSize:13 }}>▶</span> Lecture
            </button>
          )}
          {hasNotes && (
            <button onClick={() => openLink(resource.notesLink)}
              style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"8px 12px", borderRadius:9, border:"1px solid #e5e3dc", background:"#fafaf9", cursor:"pointer", fontSize:12, fontWeight:600, color:"#1a1a18", fontFamily:"inherit" }}>
              <span style={{ fontSize:13 }}>🔗</span> Notes
            </button>
          )}
        </div>
      )}

    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────────────────────── */
export default function Resources() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resources,     setResources]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [activeTab,     setActiveTab]     = useState("notes");
  const [activeSubject, setActiveSubject] = useState("all");
  const [showUpload,    setShowUpload]    = useState(false);
  const [toast,         setToast]         = useState(null);

  useEffect(() => { fetchResources(); }, [activeTab]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setActiveSubject("all");
      const res = await api.get(`/api/resources/all?type=${activeTab}`);
      setResources(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await api.delete(`/api/resources/${id}`);
      setResources(r => r.filter(x => x._id !== id));
      showToast("Deleted");
    } catch { showToast("Failed to delete"); }
  };

  const subjectTags = ["all", ...Array.from(new Set(resources.map(r => r.subject).filter(Boolean)))];
  const filtered = activeSubject === "all" ? resources : resources.filter(r => r.subject === activeSubject);

  const TABS = [
    { id:"notes",      label:"Notes"       },
    { id:"pyq",        label:"PYQs"        },
    { id:"assignment", label:"Assignments" },
  ];

  const S = {
    page:    { minHeight:"100vh", background:"#fafaf9", fontFamily:"'DM Sans',system-ui,sans-serif", color:"#1a1a18", fontSize:14 },
    wrap:    { maxWidth:600, margin:"0 auto", padding:"20px 16px 88px" },
    hdr:     { display:"flex", alignItems:"center", gap:12, marginBottom:22 },
    backBtn: { width:34, height:34, borderRadius:9, border:"1px solid #e5e3dc", background:"#fff", cursor:"pointer", fontSize:17, color:"#6b6860", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
    btn:     { padding:"8px 14px", borderRadius:10, border:"none", background:"#1a1a18", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" },
    tabBar:  { display:"flex", borderBottom:"1.5px solid #e5e3dc", marginBottom:14 },
    tab:     (a) => ({ padding:"8px 0", marginRight:22, fontSize:13, fontWeight:700, border:"none", background:"transparent", cursor:"pointer", color:a?"#1a1a18":"#9b9890", borderBottom:a?"2px solid #1a1a18":"2px solid transparent", marginBottom:"-1.5px", transition:"color .13s" }),
    ptag:    (a) => ({ padding:"5px 12px", borderRadius:100, fontSize:11, fontWeight:600, border:"none", cursor:"pointer", background:a?"#1a1a18":"#f0ede8", color:a?"#fff":"#6b6860", transition:"all .13s", whiteSpace:"nowrap", flexShrink:0 }),
  };

  return (
    <div style={S.page}>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", top:16, right:16, zIndex:99, padding:"9px 16px", borderRadius:11, background:"#1a1a18", color:"#fff", fontSize:12, fontWeight:700, boxShadow:"0 4px 20px rgba(0,0,0,.18)" }}>
          {toast}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal
          activeTab={activeTab}
          onClose={() => setShowUpload(false)}
          onSuccess={fetchResources}
          showToast={showToast}
        />
      )}

      <div style={S.wrap}>

        {/* Header */}
        <div style={S.hdr}>
          <button style={S.backBtn} onClick={() => navigate("/")}>‹</button>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:18, fontWeight:800, letterSpacing:"-.3px" }}>Resources</div>
            <div style={{ fontSize:11, color:"#9b9890", marginTop:1 }}>Notes · PYQs · Assignments</div>
          </div>
          <button style={S.btn} onClick={() => setShowUpload(true)}>+ Add</button>
        </div>

        {/* Underline Tabs */}
        <div style={S.tabBar}>
          {TABS.map(t => (
            <button key={t.id} style={S.tab(activeTab===t.id)} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Subject Tag Filters */}
        {subjectTags.length > 1 && (
          <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4, marginBottom:14 }}>
            {subjectTags.map(s => (
              <button key={s} style={S.ptag(activeSubject===s)} onClick={() => setActiveSubject(s)}>
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{ textAlign:"center", padding:"48px 0", color:"#9b9890" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"48px", background:"#fff", border:"1px solid #e5e3dc", borderRadius:14 }}>
            <div style={{ fontSize:32, marginBottom:8 }}>📭</div>
            <div style={{ fontWeight:700, marginBottom:4 }}>Nothing here yet</div>
            <div style={{ fontSize:12, color:"#9b9890", marginBottom:16 }}>Be the first to add</div>
            <button style={S.btn} onClick={() => setShowUpload(true)}>+ Add</button>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {filtered.map(resource => (
              <ResourceCard
                key={resource._id}
                resource={resource}
                user={user}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}