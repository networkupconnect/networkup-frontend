import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

/* ─────────────────────────────────────────────────────────────────────────────
   RESOURCES — Vibrant Brutalist / Teal
   Zero border-radius. Uniform borders. No emojis in UI.
   Teal #0D9488 · Purple #7C3AED · Orange #EA580C
   ───────────────────────────────────────────────────────────────────────────── */

const PRESET_TAGS = [
  "Maths", "Physics", "Chemistry", "Mechanical",
  "Civil", "Computer", "Lab File", "Workshop",
];
const LOCAL_KEY = "custom_resource_tags";
function loadCustomTags() { try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); } catch { return []; } }
function saveCustomTags(tags) { localStorage.setItem(LOCAL_KEY, JSON.stringify(tags)); }

const T = {
  teal:        "#0D9488",
  tealDark:    "#0F766E",
  tealLight:   "#F0FDFA",
  tealBorder:  "#5EEAD4",
  purple:      "#7C3AED",
  purpleLight: "#F5F3FF",
  purpleBorder:"#C4B5FD",
  orange:      "#EA580C",
  orangeLight: "#FFF7ED",
  orangeBorder:"#FDBA74",
  white:       "#fff",
  text:        "#0F172A",
  muted:       "#64748B",
  border:      "#E2E8F0",
  grad:        "linear-gradient(135deg, #0D9488 0%, #0891B2 50%, #7C3AED 100%)",
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position:"fixed", top:16, right:16, zIndex:9999,
      background: toast.type === "error" ? "#DC2626" : T.teal,
      color:"#fff", fontSize:13, fontWeight:700,
      padding:"10px 18px",
      maxWidth:280, fontFamily:"'Nunito', sans-serif",
      border: "2px solid rgba(255,255,255,0.2)",
    }}>
      {toast.msg}
    </div>
  );
}

// ── Tag Pill ──────────────────────────────────────────────────────────────────
function TagPill({ label, active, onClick, onDelete }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display:"inline-flex", alignItems:"center", gap:5,
        padding:"5px 11px",
        fontSize:12, fontWeight:700, cursor:"pointer",
        border:"2px solid",
        borderColor: active ? T.teal : T.tealBorder,
        background: active ? T.teal : T.tealLight,
        color: active ? "#fff" : T.teal,
        transition:"all 0.1s",
        whiteSpace:"nowrap",
        fontFamily:"'Nunito', sans-serif",
        borderRadius: 0,
      }}
    >
      {label}
      {onDelete && (
        <span
          role="button" tabIndex={0}
          onClick={e => { e.stopPropagation(); onDelete(); }}
          onKeyDown={e => e.key === "Enter" && (e.stopPropagation(), onDelete())}
          style={{
            width:14, height:14, display:"flex", alignItems:"center", justifyContent:"center",
            background: active ? "rgba(255,255,255,0.25)" : T.tealBorder,
            color: active ? "#fff" : T.teal,
            fontSize:10, fontWeight:900, cursor:"pointer",
          }}
          aria-label={`Remove ${label}`}
        >×</span>
      )}
    </button>
  );
}

// ── Tag Selector ──────────────────────────────────────────────────────────────
function TagSelector({ selected, onChange }) {
  const [customTags, setCustomTags] = useState(loadCustomTags);
  const [inputVal, setInputVal] = useState("");
  const allTags = [...PRESET_TAGS, ...customTags];
  const toggle  = tag => onChange(selected.includes(tag) ? selected.filter(t => t !== tag) : [...selected, tag]);
  const addCustom = () => {
    const val = inputVal.trim();
    if (!val || allTags.includes(val)) { setInputVal(""); return; }
    const updated = [...customTags, val];
    setCustomTags(updated); saveCustomTags(updated);
    onChange([...selected, val]); setInputVal("");
  };
  const deleteCustom = tag => {
    const updated = customTags.filter(t => t !== tag);
    setCustomTags(updated); saveCustomTags(updated);
    onChange(selected.filter(t => t !== tag));
  };
  return (
    <div>
      <p style={{ fontSize:10, color:T.teal, fontWeight:900, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8, fontFamily:"'Nunito', sans-serif" }}>Tags</p>
      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:8 }}>
        {PRESET_TAGS.map(t => <TagPill key={t} label={t} active={selected.includes(t)} onClick={() => toggle(t)} />)}
        {customTags.map(t => <TagPill key={t} label={t} active={selected.includes(t)} onClick={() => toggle(t)} onDelete={() => deleteCustom(t)} />)}
      </div>
      <div style={{ display:"flex", gap:5 }}>
        <input value={inputVal} onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustom())}
          placeholder="Custom tag"
          style={{ flex:1, padding:"8px 12px", fontSize:13, fontWeight:600, border:`2px solid ${T.tealBorder}`, outline:"none", background:T.tealLight, color:T.text, fontFamily:"'Nunito', sans-serif", borderRadius:0 }}
        />
        <button type="button" onClick={addCustom} style={{
          padding:"8px 14px", fontSize:12, fontWeight:800,
          border:"none", background:T.teal, color:"#fff", cursor:"pointer",
          fontFamily:"'Nunito', sans-serif", borderRadius:0,
        }}>Add</button>
      </div>
    </div>
  );
}

// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({ activeTab, onClose, onSuccess, showToast, user }) {
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title:"", description:"", subject:"", units:[], tags:[], notesLink:"", lectureLink:"", assignmentLink:"", pyqLink:"" });

  const handleUpload = async e => {
    e.preventDefault();
    if (!form.subject) return showToast("Subject name is required", "error");
    if (activeTab === "notes" && !form.notesLink) return showToast("Notes link is required", "error");
    if (activeTab === "pyq"   && !form.pyqLink)   return showToast("PYQ link is required", "error");
    const fd = new FormData();
    fd.append("title", form.title || form.subject);
    fd.append("description", form.description);
    fd.append("type", activeTab);
    fd.append("subject", form.subject);
    fd.append("unit", form.units.length > 0 ? form.units.join(",") : "General");
    fd.append("tags", form.tags.join(","));
    fd.append("notesLink", form.notesLink || "");
    fd.append("lectureLink", form.lectureLink || "");
    fd.append("assignmentLink", form.assignmentLink || "");
    fd.append("pyqLink", form.pyqLink || "");
    fd.append("branch", user?.branch || "General");
    fd.append("year", user?.year || 1);
    fd.append("section", "all");
    try {
      setUploading(true);
      await api.post("/api/resources", fd);
      onClose(); onSuccess(); showToast("Uploaded successfully");
    } catch (err) { showToast(err.response?.data?.message || "Failed to upload", "error"); }
    finally { setUploading(false); }
  };

  const units = ["1","2","3","4","5"];
  const toggleUnit = u => setForm(f => ({ ...f, units: f.units.includes(u) ? f.units.filter(x => x !== u) : [...f.units, u] }));
  const inputStyle = { width:"100%", padding:"9px 13px", fontSize:13, fontWeight:600, border:`2px solid ${T.tealBorder}`, outline:"none", background:T.tealLight, color:T.text, boxSizing:"border-box", fontFamily:"'Nunito', sans-serif", borderRadius:0 };
  const labelStyle = { fontSize:10, color:T.teal, fontWeight:900, letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:5, fontFamily:"'Nunito', sans-serif" };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:40, background:"rgba(15,23,42,0.7)", display:"flex", alignItems:"flex-end" }}>
      <div style={{ background:T.white, width:"100%", maxWidth:520, margin:"0 auto", maxHeight:"92vh", overflowY:"auto", borderTop:`4px solid ${T.teal}` }}>
        <div style={{ position:"sticky", top:0, background:T.white, borderBottom:`2px solid ${T.tealBorder}`, padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:14, fontWeight:900, color:T.teal, fontFamily:"'Nunito', sans-serif" }}>
            {activeTab === "notes" ? "Upload Note" : "Upload PYQ"}
          </span>
          <button onClick={onClose} style={{ width:28, height:28, border:`2px solid ${T.tealBorder}`, background:T.tealLight, cursor:"pointer", fontSize:16, color:T.teal, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:0 }}>×</button>
        </div>
        <form onSubmit={handleUpload} style={{ padding:18, display:"flex", flexDirection:"column", gap:13 }}>
          <div><label style={labelStyle}>Subject *</label><input style={inputStyle} placeholder="e.g. Engineering Mathematics" value={form.subject} onChange={e => setForm({ ...form, subject:e.target.value })} required /></div>
          <div><label style={labelStyle}>Title</label><input style={inputStyle} placeholder="Optional" value={form.title} onChange={e => setForm({ ...form, title:e.target.value })} /></div>
          <div><label style={labelStyle}>Description</label><textarea style={{ ...inputStyle, resize:"none", height:60 }} placeholder="Optional" value={form.description} onChange={e => setForm({ ...form, description:e.target.value })} /></div>
          <div>
            <label style={labelStyle}>Unit</label>
            <div style={{ display:"flex", gap:6 }}>
              {units.map(u => (
                <button key={u} type="button" onClick={() => toggleUnit(u)} style={{ width:38, height:38, border:"2px solid", borderColor:form.units.includes(u) ? T.teal : T.tealBorder, background:form.units.includes(u) ? T.teal : T.tealLight, color:form.units.includes(u) ? "#fff" : T.teal, fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"'Nunito', sans-serif", borderRadius:0 }}>{u}</button>
              ))}
            </div>
          </div>
          <TagSelector selected={form.tags} onChange={tags => setForm({ ...form, tags })} />
          {activeTab === "notes" && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div><label style={labelStyle}>Notes Link *</label><input style={{ ...inputStyle, borderColor:!form.notesLink ? T.orange : T.tealBorder }} placeholder="https://drive.google.com/…" value={form.notesLink} onChange={e => setForm({ ...form, notesLink:e.target.value })} /></div>
              <div><label style={labelStyle}>Lecture Link <span style={{ color:T.muted, fontSize:9 }}>(optional)</span></label><input style={inputStyle} placeholder="https://youtube.com/…" value={form.lectureLink} onChange={e => setForm({ ...form, lectureLink:e.target.value })} /></div>
              <div><label style={labelStyle}>Assignment Link <span style={{ color:T.muted, fontSize:9 }}>(optional)</span></label><input style={inputStyle} placeholder="https://…" value={form.assignmentLink} onChange={e => setForm({ ...form, assignmentLink:e.target.value })} /></div>
            </div>
          )}
          {activeTab === "pyq" && (
            <div><label style={labelStyle}>PYQ Link *</label><input style={{ ...inputStyle, borderColor:!form.pyqLink ? T.orange : T.tealBorder }} placeholder="https://drive.google.com/…" value={form.pyqLink} onChange={e => setForm({ ...form, pyqLink:e.target.value })} /></div>
          )}
          <div style={{ display:"flex", gap:8, paddingTop:2 }}>
            <button type="submit" disabled={uploading} style={{ flex:1, padding:"12px 0", background:uploading ? "#94A3B8" : T.teal, color:"#fff", fontSize:13, fontWeight:800, border:"none", cursor:"pointer", fontFamily:"'Nunito', sans-serif", borderRadius:0 }}>
              {uploading ? "Uploading…" : activeTab === "notes" ? "Upload Note" : "Upload PYQ"}
            </button>
            <button type="button" onClick={onClose} style={{ padding:"12px 18px", border:`2px solid ${T.tealBorder}`, background:T.tealLight, fontSize:13, fontWeight:700, cursor:"pointer", color:T.teal, fontFamily:"'Nunito', sans-serif", borderRadius:0 }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ resource, onClose, onSuccess, showToast }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: resource.title || "", description: resource.description || "",
    subject: resource.subject || "",
    units: resource.unit && resource.unit !== "General" ? resource.unit.split(",").map(u => u.trim()) : [],
    tags: resource.tags ? resource.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
    notesLink: resource.notesLink || "", lectureLink: resource.lectureLink || "",
    assignmentLink: resource.assignmentLink || "", pyqLink: resource.pyqLink || "",
  });

  const handleSave = async e => {
    e.preventDefault();
    if (!form.subject) return showToast("Subject name is required", "error");
    const payload = { title:form.title||form.subject, description:form.description, subject:form.subject, unit:form.units.length > 0 ? form.units.join(",") : "General", tags:form.tags.join(","), notesLink:form.notesLink||"", lectureLink:form.lectureLink||"", assignmentLink:form.assignmentLink||"", pyqLink:form.pyqLink||"" };
    try { setSaving(true); await api.put(`/api/resources/${resource._id}`, payload); onClose(); onSuccess(); showToast("Saved"); }
    catch (err) { showToast(err.response?.data?.message || "Failed to save", "error"); }
    finally { setSaving(false); }
  };

  const units = ["1","2","3","4","5"];
  const toggleUnit = u => setForm(f => ({ ...f, units: f.units.includes(u) ? f.units.filter(x => x !== u) : [...f.units, u] }));
  const inputStyle = { width:"100%", padding:"9px 13px", fontSize:13, fontWeight:600, border:`2px solid ${T.tealBorder}`, outline:"none", background:T.tealLight, color:T.text, boxSizing:"border-box", fontFamily:"'Nunito', sans-serif", borderRadius:0 };
  const labelStyle = { fontSize:10, color:T.purple, fontWeight:900, letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:5, fontFamily:"'Nunito', sans-serif" };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:50, background:"rgba(15,23,42,0.7)", display:"flex", alignItems:"flex-end" }}>
      <div style={{ background:T.white, width:"100%", maxWidth:520, margin:"0 auto", maxHeight:"92vh", overflowY:"auto", borderTop:`4px solid ${T.purple}` }}>
        <div style={{ position:"sticky", top:0, background:T.white, borderBottom:`2px solid ${T.tealBorder}`, padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:14, fontWeight:900, color:T.purple, fontFamily:"'Nunito', sans-serif" }}>Edit Resource</span>
          <button onClick={onClose} style={{ width:28, height:28, border:`2px solid ${T.purpleBorder}`, background:T.purpleLight, cursor:"pointer", fontSize:16, color:T.purple, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:0 }}>×</button>
        </div>
        <form onSubmit={handleSave} style={{ padding:18, display:"flex", flexDirection:"column", gap:13 }}>
          <div><label style={labelStyle}>Subject *</label><input style={inputStyle} value={form.subject} onChange={e => setForm({ ...form, subject:e.target.value })} required /></div>
          <div><label style={labelStyle}>Title</label><input style={inputStyle} placeholder="Optional" value={form.title} onChange={e => setForm({ ...form, title:e.target.value })} /></div>
          <div><label style={labelStyle}>Description</label><textarea style={{ ...inputStyle, resize:"none", height:60 }} value={form.description} onChange={e => setForm({ ...form, description:e.target.value })} /></div>
          <div>
            <label style={labelStyle}>Unit</label>
            <div style={{ display:"flex", gap:6 }}>
              {units.map(u => (
                <button key={u} type="button" onClick={() => toggleUnit(u)} style={{ width:38, height:38, border:"2px solid", borderColor:form.units.includes(u) ? T.purple : T.purpleBorder, background:form.units.includes(u) ? T.purple : T.purpleLight, color:form.units.includes(u) ? "#fff" : T.purple, fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"'Nunito', sans-serif", borderRadius:0 }}>{u}</button>
              ))}
            </div>
          </div>
          <TagSelector selected={form.tags} onChange={tags => setForm({ ...form, tags })} />
          {resource.type === "notes" && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div><label style={labelStyle}>Notes Link</label><input style={inputStyle} placeholder="https://drive.google.com/…" value={form.notesLink} onChange={e => setForm({ ...form, notesLink:e.target.value })} /></div>
              <div><label style={labelStyle}>Lecture Link</label><input style={inputStyle} placeholder="https://youtube.com/…" value={form.lectureLink} onChange={e => setForm({ ...form, lectureLink:e.target.value })} /></div>
              <div><label style={labelStyle}>Assignment Link</label><input style={inputStyle} placeholder="https://…" value={form.assignmentLink} onChange={e => setForm({ ...form, assignmentLink:e.target.value })} /></div>
            </div>
          )}
          {resource.type === "pyq" && (
            <div><label style={labelStyle}>PYQ Link</label><input style={inputStyle} placeholder="https://drive.google.com/…" value={form.pyqLink} onChange={e => setForm({ ...form, pyqLink:e.target.value })} /></div>
          )}
          <div style={{ display:"flex", gap:8, paddingTop:2 }}>
            <button type="submit" disabled={saving} style={{ flex:1, padding:"12px 0", background:saving ? "#94A3B8" : T.purple, color:"#fff", fontSize:13, fontWeight:800, border:"none", cursor:"pointer", fontFamily:"'Nunito', sans-serif", borderRadius:0 }}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button type="button" onClick={onClose} style={{ padding:"12px 18px", border:`2px solid ${T.tealBorder}`, background:T.tealLight, fontSize:13, fontWeight:700, cursor:"pointer", color:T.teal, fontFamily:"'Nunito', sans-serif", borderRadius:0 }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Resource Card — ZERO RADIUS, uniform borders ───────────────────────────────
function ResourceCard({ resource, user, onView, onDownload, onDelete, onEdit, onTagClick, showToast }) {
  const ext = resource.fileUrl ? resource.fileUrl.split(".").pop().split("?")[0].toLowerCase() : "pdf";
  const isPdf = !["png","jpg","jpeg","webp","gif"].includes(ext);
  const fileExt = isPdf ? "pdf" : ext;
  const hasFile = !!resource.fileUrl;
  const unitTags     = resource.unit && resource.unit !== "General" ? resource.unit.split(",").map(u => u.trim()) : [];
  const resourceTags = resource.tags ? resource.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
  const isAdmin   = user?.role === "admin";
  const isOwner   = user && user._id === resource.uploadedBy?._id?.toString();
  const canManage = isAdmin || isOwner;

  const handleShare = () => {
    const url = `${window.location.origin}/resources?id=${resource._id}`;
    if (navigator.share) navigator.share({ title:resource.title, url });
    else navigator.clipboard.writeText(url).then(() => showToast("Link copied"));
  };

  const btnBase = {
    fontSize:11, fontWeight:700, padding:"5px 11px",
    border:`2px solid ${T.tealBorder}`,
    background:T.tealLight, color:T.teal,
    cursor:"pointer", textDecoration:"none",
    display:"inline-block", textAlign:"center",
    fontFamily:"'Nunito', sans-serif", transition:"background 0.1s",
    borderRadius:0,
  };

  return (
    <div style={{
      background:"#ffffff",
      border:`2px solid ${T.tealBorder}`,
      borderLeft:`4px solid ${T.teal}`,
      overflow:"hidden",
      transition:"border-left-color 0.12s",
    }}
    onMouseEnter={e => { e.currentTarget.style.borderLeftColor = T.purple; }}
    onMouseLeave={e => { e.currentTarget.style.borderLeftColor = T.teal; }}
    >
      <div style={{ padding:"12px 13px" }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:13, fontWeight:800, color:T.text, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:"'Nunito', sans-serif" }}>
              {resource.title}
            </p>
            {resource.subject && (
              <p style={{ fontSize:11, color:T.teal, margin:"3px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontWeight:700 }}>
                {resource.subject}
              </p>
            )}
            {resource.description && (
              <p style={{ fontSize:11, color:T.muted, margin:"2px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontWeight:600 }}>
                {resource.description}
              </p>
            )}
            {(unitTags.length > 0 || resourceTags.length > 0) && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:7 }}>
                {unitTags.map(u => (
                  <span key={u} style={{ fontSize:10, fontWeight:800, background:T.tealLight, color:T.teal, padding:"2px 7px", border:`1.5px solid ${T.tealBorder}`, fontFamily:"'Nunito', sans-serif" }}>U{u}</span>
                ))}
                {resourceTags.map(t => (
                  <button key={t} type="button" onClick={() => onTagClick?.(t)} style={{ fontSize:10, fontWeight:700, background:T.purpleLight, color:T.purple, padding:"2px 7px", border:`1.5px solid ${T.purpleBorder}`, cursor:onTagClick ? "pointer" : "default", fontFamily:"'Nunito', sans-serif", borderRadius:0 }}>{t}</button>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleShare} style={{ padding:"5px 10px", border:`2px solid ${T.orangeBorder}`, background:T.orangeLight, color:T.orange, fontSize:11, fontWeight:800, cursor:"pointer", flexShrink:0, fontFamily:"'Nunito', sans-serif", borderRadius:0 }}>Share</button>

          <div style={{ display:"flex", gap:4, flexShrink:0, alignItems:"center", flexWrap:"wrap", justifyContent:"flex-end" }}>
            {hasFile && (
              <>
                <button onClick={() => onView(resource)} style={btnBase}>View</button>
                <button onClick={() => onDownload(resource.fileUrl, resource.title, fileExt)} style={btnBase}>Save</button>
              </>
            )}
            {isAdmin && (
              <button onClick={() => onEdit(resource)} style={{ ...btnBase, color:T.purple, borderColor:T.purpleBorder, background:T.purpleLight }}>Edit</button>
            )}
            {canManage && (
              <button onClick={() => onDelete(resource._id)} style={{ ...btnBase, color:"#DC2626", borderColor:"#FECACA", background:"#FEF2F2" }}>Del</button>
            )}
          </div>
        </div>
      </div>

      {resource.type === "notes" && (resource.notesLink || resource.lectureLink || resource.assignmentLink) && (
        <div style={{ display:"flex", gap:5, padding:"0 13px 12px" }}>
          {resource.notesLink && (
            <a href={resource.notesLink} target="_blank" rel="noopener noreferrer"
              style={{ ...btnBase, flex:1, display:"block", textAlign:"center", background:T.teal, color:"#fff", borderColor:T.teal }}>
              Notes
            </a>
          )}
          {resource.lectureLink && (
            <a href={resource.lectureLink} target="_blank" rel="noopener noreferrer"
              style={{ ...btnBase, flex:1, display:"block", textAlign:"center" }}>
              Lecture
            </a>
          )}
          {resource.assignmentLink && (
            <a href={resource.assignmentLink} target="_blank" rel="noopener noreferrer"
              style={{ ...btnBase, flex:1, display:"block", textAlign:"center" }}>
              Assignment
            </a>
          )}
        </div>
      )}

      {resource.type === "pyq" && resource.pyqLink && (
        <div style={{ padding:"0 13px 12px" }}>
          <a href={resource.pyqLink} target="_blank" rel="noopener noreferrer"
            style={{ ...btnBase, display:"block", textAlign:"center", background:T.teal, color:"#fff", borderColor:T.teal }}>
            View PYQ
          </a>
        </div>
      )}
    </div>
  );
}

// ── Notes View ────────────────────────────────────────────────────────────────
function NotesView({ resources, user, onView, onDownload, onDelete, onEdit, onTagClick, showToast, activeFilterTags }) {
  const filtered = activeFilterTags.length === 0 ? resources
    : resources.filter(r => {
        const rTags = r.tags ? r.tags.split(",").map(t => t.trim()) : [];
        return activeFilterTags.some(t => rTags.includes(t));
      });
  if (filtered.length === 0) return (
    <div style={{ textAlign:"center", padding:"56px 0", background:T.tealLight, border:`2px dashed ${T.tealBorder}` }}>
      <p style={{ fontSize:13, fontWeight:800, color:T.teal, margin:0, fontFamily:"'Nunito', sans-serif" }}>No notes found</p>
      <p style={{ fontSize:11, color:T.muted, marginTop:4, fontWeight:600 }}>{activeFilterTags.length > 0 ? "Try a different tag filter" : "Be the first to upload"}</p>
    </div>
  );
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
      {filtered.map(r => <ResourceCard key={r._id} resource={r} user={user} onView={onView} onDownload={onDownload} onDelete={onDelete} onEdit={onEdit} onTagClick={onTagClick} showToast={showToast} />)}
    </div>
  );
}

// ── PYQ View ──────────────────────────────────────────────────────────────────
function PYQView({ resources, user, onView, onDownload, onDelete, onEdit, onTagClick, showToast, activeFilterTags }) {
  const [activeUnits, setActiveUnits] = useState([]);
  const units = ["1","2","3","4","5"];
  const toggleUnit = u => setActiveUnits(prev => prev.includes(u) ? prev.filter(x => x !== u) : [...prev, u]);
  let filtered = activeFilterTags.length === 0 ? resources : resources.filter(r => { const rTags = r.tags ? r.tags.split(",").map(t => t.trim()) : []; return activeFilterTags.some(t => rTags.includes(t)); });
  if (activeUnits.length > 0) filtered = filtered.filter(r => { if (!r.unit || r.unit === "General") return false; const rUnits = r.unit.split(",").map(x => x.trim()); return activeUnits.some(u => rUnits.includes(u)); });
  if (resources.length === 0) return (
    <div style={{ textAlign:"center", padding:"56px 0", background:T.tealLight, border:`2px dashed ${T.tealBorder}` }}>
      <p style={{ fontSize:13, fontWeight:800, color:T.teal, margin:0, fontFamily:"'Nunito', sans-serif" }}>No PYQs yet</p>
      <p style={{ fontSize:11, color:T.muted, marginTop:4, fontWeight:600 }}>Be the first to upload</p>
    </div>
  );
  const unitBtnBase = { fontSize:12, fontWeight:800, cursor:"pointer", border:"2px solid", fontFamily:"'Nunito', sans-serif", borderRadius:0, transition:"all 0.1s" };
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:14, flexWrap:"wrap" }}>
        <span style={{ fontSize:10, color:T.teal, fontWeight:900, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Nunito', sans-serif" }}>Unit</span>
        <button onClick={() => setActiveUnits([])} style={{ ...unitBtnBase, padding:"5px 13px", borderColor:activeUnits.length === 0 ? T.teal : T.tealBorder, background:activeUnits.length === 0 ? T.teal : T.tealLight, color:activeUnits.length === 0 ? "#fff" : T.teal }}>All</button>
        {units.map(u => (
          <button key={u} onClick={() => toggleUnit(u)} style={{ ...unitBtnBase, width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", borderColor:activeUnits.includes(u) ? T.teal : T.tealBorder, background:activeUnits.includes(u) ? T.teal : T.tealLight, color:activeUnits.includes(u) ? "#fff" : T.teal }}>{u}</button>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
        {filtered.length === 0
          ? <p style={{ textAlign:"center", color:T.muted, fontSize:13, padding:"36px 0", fontWeight:600 }}>No results for this filter</p>
          : filtered.map(r => <ResourceCard key={r._id} resource={r} user={user} onView={onView} onDownload={onDownload} onDelete={onDelete} onEdit={onEdit} onTagClick={onTagClick} showToast={showToast} />)
        }
      </div>
    </div>
  );
}

// ── File Viewer ───────────────────────────────────────────────────────────────
function FileViewer({ url, title, ext, onClose, onDownload }) {
  const isPdf = ext === "pdf";
  const [imgLoading, setImgLoading] = useState(true);
  return (
    <div style={{ position:"fixed", inset:0, zIndex:50, background:"#0F172A", display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", background:"#fff", borderBottom:`3px solid ${T.teal}`, flexShrink:0 }}>
        <p style={{ fontSize:13, fontWeight:800, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1, marginRight:10, color:T.text, fontFamily:"'Nunito', sans-serif" }}>{title}</p>
        <div style={{ display:"flex", gap:8, flexShrink:0 }}>
          <button onClick={onDownload} style={{ fontSize:12, fontWeight:800, padding:"7px 14px", background:T.teal, color:"#fff", border:"none", cursor:"pointer", fontFamily:"'Nunito', sans-serif", borderRadius:0 }}>Download</button>
          <button onClick={onClose} style={{ fontSize:12, fontWeight:800, padding:"7px 14px", background:T.tealLight, color:T.teal, border:`2px solid ${T.tealBorder}`, cursor:"pointer", fontFamily:"'Nunito', sans-serif", borderRadius:0 }}>Close</button>
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
        {imgLoading && !isPdf && <p style={{ color:"#94A3B8", fontSize:13, fontWeight:700 }}>Loading…</p>}
        {!isPdf && <img src={url} alt={title} style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain" }} onLoad={() => setImgLoading(false)} />}
      </div>
    </div>
  );
}

// ── Tag Filter Bar ────────────────────────────────────────────────────────────
function TagFilterBar({ allTags, activeFilterTags, onToggle }) {
  if (allTags.length === 0) return null;
  return (
    <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:13, alignItems:"center" }}>
      <span style={{ fontSize:10, color:T.teal, fontWeight:900, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Nunito', sans-serif" }}>Filter</span>
      {allTags.map(t => <TagPill key={t} label={t} active={activeFilterTags.includes(t)} onClick={() => onToggle(t)} />)}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Resources() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [resources,        setResources]        = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [activeTab,        setActiveTab]        = useState("notes");
  const [showUpload,       setShowUpload]       = useState(false);
  const [editResource,     setEditResource]     = useState(null);
  const [toast,            setToast]            = useState(null);
  const [viewer,           setViewer]           = useState(null);
  const [activeFilterTags, setActiveFilterTags] = useState([]);

  useEffect(() => { fetchResources(); }, [activeTab]);

  const fetchResources = async () => {
    try { setLoading(true); const res = await api.get(`/api/resources/all?type=${activeTab}`); setResources(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const handleDelete = async id => {
    if (!window.confirm("Delete this resource?")) return;
    try { await api.delete(`/api/resources/${id}`); setResources(resources.filter(r => r._id !== id)); showToast("Deleted"); }
    catch { showToast("Failed to delete", "error"); }
  };
  const getFileExt = url => { if (!url) return "pdf"; const rawExt = url.split(".").pop().split("?")[0].toLowerCase(); return ["png","jpg","jpeg","webp","gif"].includes(rawExt) ? rawExt : "pdf"; };
  const handleDownload = (url, title, ext) => {
    let downloadUrl = url;
    if (url && url.includes("/upload/")) downloadUrl = url.replace("/upload/", "/upload/fl_attachment/");
    const a = document.createElement("a"); a.href = downloadUrl; a.download = `${title||"file"}.${ext}`; a.target = "_blank"; document.body.appendChild(a); a.click(); a.remove();
  };
  const handleView = resource => {
    const ext = getFileExt(resource.fileUrl);
    if (ext === "pdf") {
      let viewUrl = resource.fileUrl || "";
      if (!viewUrl.split("?")[0].toLowerCase().endsWith(".pdf")) viewUrl += ".pdf";
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(viewUrl)}&embedded=true`, "_blank", "noopener,noreferrer");
      else window.open(viewUrl, "_blank", "noopener,noreferrer");
    } else { setViewer({ url:resource.fileUrl, title:resource.title, ext }); }
  };

  const allTagsInResources = Array.from(new Set(resources.flatMap(r => r.tags ? r.tags.split(",").map(t => t.trim()).filter(Boolean) : [])));
  const displayableTags = Array.from(new Set([...PRESET_TAGS, ...allTagsInResources.filter(t => !PRESET_TAGS.includes(t))]));
  const toggleFilterTag = tag => setActiveFilterTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  return (
    <div style={{
      minHeight:"100vh",
      background: "linear-gradient(160deg, #0C0A1A 0%, #0D4A45 35%, #134E4A 65%, #0F172A 100%)",
      fontFamily:"'Nunito', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <Toast toast={toast} />
      {viewer && <FileViewer url={viewer.url} title={viewer.title} ext={viewer.ext} onClose={() => setViewer(null)} onDownload={() => handleDownload(viewer.url, viewer.title, viewer.ext)} />}
      {showUpload && <UploadModal user={user} activeTab={activeTab} onClose={() => setShowUpload(false)} onSuccess={fetchResources} showToast={showToast} />}
      {editResource && <EditModal resource={editResource} onClose={() => setEditResource(null)} onSuccess={() => { setEditResource(null); fetchResources(); }} showToast={showToast} />}

      <div style={{ maxWidth:600, margin:"0 auto", padding:"20px 10px 120px" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <button onClick={() => navigate("/")} style={{ background:"rgba(255,255,255,0.1)", border:"2px solid rgba(255,255,255,0.2)", cursor:"pointer", padding:7, display:"flex", alignItems:"center", color:"#fff", flexShrink:0, borderRadius:0 }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div>
            <h1 style={{ fontSize:20, fontWeight:900, color:"#fff", margin:0, letterSpacing:"-0.4px" }}>Resources</h1>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.55)", margin:"2px 0 0", fontWeight:600 }}>Notes and PYQs</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", marginBottom:16, background:"rgba(255,255,255,0.08)", border:"2px solid rgba(255,255,255,0.15)", padding:3, gap:3 }}>
          {[{ id:"notes", label:"Notes" }, { id:"pyq", label:"PYQs" }].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setActiveFilterTags([]); }}
              style={{ flex:1, padding:"9px 0", fontSize:13, fontWeight:800, color:activeTab === tab.id ? "#0F172A" : "rgba(255,255,255,0.55)", background:activeTab === tab.id ? T.teal : "transparent", border:"none", cursor:"pointer", transition:"all 0.12s", fontFamily:"'Nunito', sans-serif", borderRadius:0 }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ background:"rgba(255,255,255,0.96)", border:"2px solid rgba(255,255,255,0.25)", padding:"16px 14px", boxShadow:"0 8px 40px rgba(0,0,0,0.25)" }}>
          <TagFilterBar allTags={displayableTags} activeFilterTags={activeFilterTags} onToggle={toggleFilterTag} />
          {loading ? (
            <div style={{ textAlign:"center", padding:"56px 0", color:T.teal, fontSize:13, fontWeight:800 }}>Loading…</div>
          ) : (
            <>
              {activeTab === "notes" && <NotesView resources={resources} user={user} activeFilterTags={activeFilterTags} onView={handleView} onDownload={handleDownload} onDelete={handleDelete} onEdit={r => setEditResource(r)} onTagClick={toggleFilterTag} showToast={showToast} />}
              {activeTab === "pyq"   && <PYQView   resources={resources} user={user} activeFilterTags={activeFilterTags} onView={handleView} onDownload={handleDownload} onDelete={handleDelete} onEdit={r => setEditResource(r)} onTagClick={toggleFilterTag} showToast={showToast} />}
            </>
          )}
        </div>
      </div>

      {/* FAB — zero radius */}
      {user && (
        <button onClick={() => setShowUpload(true)} style={{ position:"fixed", bottom:80, right:20, width:50, height:50, background:T.teal, color:"#fff", border:"none", cursor:"pointer", zIndex:30, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 20px rgba(13,148,136,0.55)", transition:"filter 0.12s", borderRadius:0 }}
          onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.15)"; }}
          onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; }}>
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
            <path d="M11 4V18M4 11H18" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </div>
  );
}