import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const PRESET_TAGS = [
  "Maths", "Physics", "Chemistry", "Mechanical",
  "Civil", "Computer", "Lab File", "Workshop",
];

const LOCAL_KEY = "custom_resource_tags";

function loadCustomTags() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); }
  catch { return []; }
}
function saveCustomTags(tags) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(tags));
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position: "fixed", top: 16, right: 16, zIndex: 9999,
      background: toast.type === "error" ? "#1a1a1a" : "#1a1a1a",
      color: "#fff", fontSize: 13, fontWeight: 500,
      padding: "10px 16px", borderRadius: 10,
      borderLeft: `3px solid ${toast.type === "error" ? "#ef4444" : "#22c55e"}`,
      maxWidth: 280,
    }}>
      {toast.msg}
    </div>
  );
}

// ─── Tag Pill ─────────────────────────────────────────────────────────────────
function TagPill({ label, active, onClick, onDelete }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "5px 11px", borderRadius: 20,
        fontSize: 12, fontWeight: 500, cursor: "pointer",
        border: "1px solid",
        borderColor: active ? "#000" : "#D4D4D4",
        background: active ? "#000" : "#F5F5F5",
        color: active ? "#fff" : "#555",
        transition: "all 0.12s",
        whiteSpace: "nowrap",
      }}
    >
      {label}
      {onDelete && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), onDelete())}
          style={{
            width: 14, height: 14, display: "flex", alignItems: "center",
            justifyContent: "center", borderRadius: "50%",
            background: active ? "rgba(255,255,255,0.25)" : "#D4D4D4",
            color: active ? "#fff" : "#666",
            fontSize: 10, lineHeight: 1, fontWeight: 700,
            cursor: "pointer",
          }}
          aria-label={`Remove ${label}`}
        >
          x
        </span>
      )}
    </button>
  );
}

// ─── Tag Selector (upload form) ───────────────────────────────────────────────
function TagSelector({ selected, onChange }) {
  const [customTags, setCustomTags] = useState(loadCustomTags);
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef();

  const allTags = [...PRESET_TAGS, ...customTags];

  const toggle = (tag) =>
    onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);

  const addCustom = () => {
    const val = inputVal.trim();
    if (!val || allTags.includes(val)) { setInputVal(""); return; }
    const updated = [...customTags, val];
    setCustomTags(updated);
    saveCustomTags(updated);
    onChange([...selected, val]);
    setInputVal("");
  };

  const deleteCustom = (tag) => {
    const updated = customTags.filter((t) => t !== tag);
    setCustomTags(updated);
    saveCustomTags(updated);
    onChange(selected.filter((t) => t !== tag));
  };

  return (
    <div>
      <p style={{ fontSize: 11, color: "#888", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
        Tags
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {PRESET_TAGS.map((t) => (
          <TagPill key={t} label={t} active={selected.includes(t)} onClick={() => toggle(t)} />
        ))}
        {customTags.map((t) => (
          <TagPill
            key={t} label={t} active={selected.includes(t)}
            onClick={() => toggle(t)}
            onDelete={() => deleteCustom(t)}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          ref={inputRef}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
          placeholder="Custom tag..."
          style={{
            flex: 1, padding: "7px 11px", fontSize: 13,
            border: "1px solid #E0E0E0", borderRadius: 8,
            outline: "none", background: "#FAFAFA", color: "#111",
          }}
        />
        <button
          type="button"
          onClick={addCustom}
          style={{
            padding: "7px 14px", fontSize: 12, fontWeight: 600,
            border: "1px solid #D4D4D4", borderRadius: 8,
            background: "#F5F5F5", color: "#333", cursor: "pointer",
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────
function UploadModal({ activeTab, onClose, onSuccess, showToast, user }) {
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", subject: "",
    units: [], tags: [],
    notesLink: "", lectureLink: "", assignmentLink: "", pyqLink: "",
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.subject) return showToast("Subject name is required", "error");
    if (activeTab === "notes" && !form.notesLink) return showToast("Notes link is required", "error");
    if (activeTab === "pyq" && !form.pyqLink) return showToast("PYQ link is required", "error");

    const formData = new FormData();
    formData.append("title", form.title || form.subject);
    formData.append("description", form.description);
    formData.append("type", activeTab);
    formData.append("subject", form.subject);
    formData.append("unit", form.units.length > 0 ? form.units.join(",") : "General");
    formData.append("tags", form.tags.join(","));
    formData.append("notesLink", form.notesLink || "");
    formData.append("lectureLink", form.lectureLink || "");
    formData.append("assignmentLink", form.assignmentLink || "");
    formData.append("pyqLink", form.pyqLink || "");
    formData.append("branch", user?.branch || "General");
    formData.append("year", user?.year || 1);
    formData.append("section", "all");

    try {
      setUploading(true);
      await api.post("/api/resources", formData);
      onClose(); onSuccess(); showToast("Uploaded");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to upload", "error");
    } finally { setUploading(false); }
  };

  const units = ["1", "2", "3", "4", "5"];
  const toggleUnit = (u) =>
    setForm((f) => ({
      ...f, units: f.units.includes(u) ? f.units.filter((x) => x !== u) : [...f.units, u],
    }));

  const inputStyle = {
    width: "100%", padding: "10px 13px", fontSize: 13,
    border: "1px solid #E0E0E0", borderRadius: 9, outline: "none",
    background: "#FAFAFA", color: "#111", boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 11, color: "#888", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 5 };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 40,
      background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "flex-end",
    }}>
      <div style={{
        background: "#fff", width: "100%", maxWidth: 520,
        margin: "0 auto",
        borderRadius: "18px 18px 0 0",
        maxHeight: "92vh", overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{
          position: "sticky", top: 0, background: "#fff",
          borderBottom: "1px solid #F0F0F0",
          padding: "16px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
            {activeTab === "notes" ? "Upload Note" : "Upload PYQ"}
          </span>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: "50%",
            border: "1px solid #E0E0E0", background: "#F5F5F5",
            cursor: "pointer", fontSize: 14, color: "#555",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>x</button>
        </div>

        <form onSubmit={handleUpload} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Subject *</label>
            <input style={inputStyle} placeholder="e.g. Engineering Mathematics" value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          </div>
          <div>
            <label style={labelStyle}>Title</label>
            <input style={inputStyle} placeholder="Optional" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, resize: "none", height: 60 }} placeholder="Optional"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          {/* Unit */}
          <div>
            <label style={labelStyle}>Unit</label>
            <div style={{ display: "flex", gap: 6 }}>
              {units.map((u) => (
                <button key={u} type="button" onClick={() => toggleUnit(u)} style={{
                  width: 38, height: 38, borderRadius: 9,
                  border: "1px solid",
                  borderColor: form.units.includes(u) ? "#000" : "#D4D4D4",
                  background: form.units.includes(u) ? "#000" : "#F5F5F5",
                  color: form.units.includes(u) ? "#fff" : "#555",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>{u}</button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <TagSelector
            selected={form.tags}
            onChange={(tags) => setForm({ ...form, tags })}
          />

          {/* Links */}
          {activeTab === "notes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={labelStyle}>Notes Link <span style={{ color: "#ef4444" }}>*</span></label>
                <input style={{ ...inputStyle, borderColor: !form.notesLink ? "#FBBF24" : "#E0E0E0" }}
                  placeholder="https://drive.google.com/..." value={form.notesLink}
                  onChange={(e) => setForm({ ...form, notesLink: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Lecture Link <span style={{ color: "#D4D4D4" }}>(optional)</span></label>
                <input style={inputStyle} placeholder="https://youtube.com/..." value={form.lectureLink}
                  onChange={(e) => setForm({ ...form, lectureLink: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Assignment Link <span style={{ color: "#D4D4D4" }}>(optional)</span></label>
                <input style={inputStyle} placeholder="https://..." value={form.assignmentLink}
                  onChange={(e) => setForm({ ...form, assignmentLink: e.target.value })} />
              </div>
            </div>
          )}

          {activeTab === "pyq" && (
            <div>
              <label style={labelStyle}>PYQ Link <span style={{ color: "#ef4444" }}>*</span></label>
              <input style={{ ...inputStyle, borderColor: !form.pyqLink ? "#FBBF24" : "#E0E0E0" }}
                placeholder="https://drive.google.com/..." value={form.pyqLink}
                onChange={(e) => setForm({ ...form, pyqLink: e.target.value })} />
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
            <button type="submit" disabled={uploading} style={{
              flex: 1, padding: "12px 0", borderRadius: 10,
              background: "#000", color: "#fff",
              fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
              opacity: uploading ? 0.5 : 1,
            }}>
              {uploading ? "Uploading..." : activeTab === "notes" ? "Upload Note" : "Upload PYQ"}
            </button>
            <button type="button" onClick={onClose} style={{
              padding: "12px 18px", borderRadius: 10,
              border: "1px solid #E0E0E0", background: "#F5F5F5",
              fontSize: 13, fontWeight: 500, cursor: "pointer", color: "#555",
            }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ resource, onClose, onSuccess, showToast }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: resource.title || "",
    description: resource.description || "",
    subject: resource.subject || "",
    units: resource.unit && resource.unit !== "General" ? resource.unit.split(",").map((u) => u.trim()) : [],
    tags: resource.tags ? resource.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    notesLink: resource.notesLink || "",
    lectureLink: resource.lectureLink || "",
    assignmentLink: resource.assignmentLink || "",
    pyqLink: resource.pyqLink || "",
  });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.subject) return showToast("Subject name is required", "error");
    const payload = {
      title: form.title || form.subject,
      description: form.description,
      subject: form.subject,
      unit: form.units.length > 0 ? form.units.join(",") : "General",
      tags: form.tags.join(","),
      notesLink: form.notesLink || "",
      lectureLink: form.lectureLink || "",
      assignmentLink: form.assignmentLink || "",
      pyqLink: form.pyqLink || "",
    };
    try {
      setSaving(true);
      await api.put(`/api/resources/${resource._id}`, payload);
      onClose(); onSuccess(); showToast("Saved");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save", "error");
    } finally { setSaving(false); }
  };

  const units = ["1", "2", "3", "4", "5"];
  const toggleUnit = (u) =>
    setForm((f) => ({ ...f, units: f.units.includes(u) ? f.units.filter((x) => x !== u) : [...f.units, u] }));

  const inputStyle = {
    width: "100%", padding: "10px 13px", fontSize: 13,
    border: "1px solid #E0E0E0", borderRadius: 9, outline: "none",
    background: "#FAFAFA", color: "#111", boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 11, color: "#888", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 5 };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end" }}>
      <div style={{ background: "#fff", width: "100%", maxWidth: 520, margin: "0 auto", borderRadius: "18px 18px 0 0", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ position: "sticky", top: 0, background: "#fff", borderBottom: "1px solid #F0F0F0", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>Edit Resource</span>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid #E0E0E0", background: "#F5F5F5", cursor: "pointer", fontSize: 14, color: "#555", display: "flex", alignItems: "center", justifyContent: "center" }}>x</button>
        </div>
        <form onSubmit={handleSave} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Subject *</label>
            <input style={inputStyle} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          </div>
          <div>
            <label style={labelStyle}>Title</label>
            <input style={inputStyle} placeholder="Optional" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, resize: "none", height: 60 }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Unit</label>
            <div style={{ display: "flex", gap: 6 }}>
              {units.map((u) => (
                <button key={u} type="button" onClick={() => toggleUnit(u)} style={{
                  width: 38, height: 38, borderRadius: 9, border: "1px solid",
                  borderColor: form.units.includes(u) ? "#000" : "#D4D4D4",
                  background: form.units.includes(u) ? "#000" : "#F5F5F5",
                  color: form.units.includes(u) ? "#fff" : "#555",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>{u}</button>
              ))}
            </div>
          </div>
          <TagSelector selected={form.tags} onChange={(tags) => setForm({ ...form, tags })} />
          {resource.type === "notes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={labelStyle}>Notes Link</label>
                <input style={inputStyle} placeholder="https://drive.google.com/..." value={form.notesLink} onChange={(e) => setForm({ ...form, notesLink: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Lecture Link</label>
                <input style={inputStyle} placeholder="https://youtube.com/..." value={form.lectureLink} onChange={(e) => setForm({ ...form, lectureLink: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Assignment Link</label>
                <input style={inputStyle} placeholder="https://..." value={form.assignmentLink} onChange={(e) => setForm({ ...form, assignmentLink: e.target.value })} />
              </div>
            </div>
          )}
          {resource.type === "pyq" && (
            <div>
              <label style={labelStyle}>PYQ Link</label>
              <input style={inputStyle} placeholder="https://drive.google.com/..." value={form.pyqLink} onChange={(e) => setForm({ ...form, pyqLink: e.target.value })} />
            </div>
          )}
          <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: "12px 0", borderRadius: 10, background: "#000", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", opacity: saving ? 0.5 : 1 }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={onClose} style={{ padding: "12px 18px", borderRadius: 10, border: "1px solid #E0E0E0", background: "#F5F5F5", fontSize: 13, fontWeight: 500, cursor: "pointer", color: "#555" }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Resource Card ────────────────────────────────────────────────────────────
function ResourceCard({ resource, user, onView, onDownload, onDelete, onEdit, showToast }) {
  const ext = resource.fileUrl
    ? resource.fileUrl.split(".").pop().split("?")[0].toLowerCase()
    : "pdf";
  const isPdf = !["png", "jpg", "jpeg", "webp", "gif"].includes(ext);
  const fileExt = isPdf ? "pdf" : ext;
  const hasFile = !!resource.fileUrl;

  const unitTags = resource.unit && resource.unit !== "General"
    ? resource.unit.split(",").map((u) => u.trim())
    : [];

  const resourceTags = resource.tags
    ? resource.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const isAdmin = user?.role === "admin";
  const isOwner = user && user._id === resource.uploadedBy?._id?.toString();
  const canManage = isAdmin || isOwner;

  const handleShare = () => {
    const url = `${window.location.origin}/resources?id=${resource._id}`;
    if (navigator.share) {
      navigator.share({ title: resource.title, url });
    } else {
      navigator.clipboard.writeText(url).then(() => showToast("Link copied"));
    }
  };

  const greyBtnStyle = {
    fontSize: 12, fontWeight: 500,
    padding: "6px 13px", borderRadius: 7,
    border: "1px solid #E0E0E0",
    background: "#F5F5F5", color: "#444",
    cursor: "pointer", textDecoration: "none",
    display: "inline-block", textAlign: "center",
  };

  return (
    <div style={{
      background: "#fff", borderRadius: 13,
      border: "1px solid #EBEBEB",
      overflow: "hidden",
    }}>
      {/* Body */}
      <div style={{ padding: "13px 14px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {resource.title}
            </p>
            {resource.subject && (
              <p style={{ fontSize: 11, color: "#888", margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {resource.subject}
              </p>
            )}
            {resource.description && (
              <p style={{ fontSize: 11, color: "#AAAAAA", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {resource.description}
              </p>
            )}
            {(unitTags.length > 0 || resourceTags.length > 0) && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 7 }}>
                {unitTags.map((u) => (
                  <span key={u} style={{ fontSize: 10, fontWeight: 600, background: "#F0F0F0", color: "#666", padding: "2px 7px", borderRadius: 5 }}>U{u}</span>
                ))}
                {resourceTags.map((t) => (
                  <span key={t} style={{ fontSize: 10, fontWeight: 500, background: "#F0F0F0", color: "#666", padding: "2px 7px", borderRadius: 5 }}>{t}</span>
                ))}
              </div>
            )}
          </div>

          {/* Right action buttons */}
          <div style={{ display: "flex", gap: 5, flexShrink: 0, alignItems: "center" }}>
            {hasFile && (
              <>
                <button onClick={() => onView(resource)} style={greyBtnStyle}>View</button>
                <button onClick={() => onDownload(resource.fileUrl, resource.title, fileExt)} style={greyBtnStyle}>Save</button>
              </>
            )}
            {isAdmin && (
              <button onClick={() => onEdit(resource)} style={{ ...greyBtnStyle, color: "#1d4ed8", borderColor: "#bfdbfe", background: "#eff6ff" }}>
                Edit
              </button>
            )}
            {canManage && (
              <button onClick={() => onDelete(resource._id)} style={{ ...greyBtnStyle, color: "#ef4444", borderColor: "#fecaca", background: "#fff5f5" }}>
                Del
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notes links */}
      {resource.type === "notes" && (resource.notesLink || resource.lectureLink || resource.assignmentLink) && (
        <div style={{ display: "flex", gap: 6, padding: "0 14px 12px" }}>
          {resource.notesLink && (
            <a href={resource.notesLink} target="_blank" rel="noopener noreferrer" style={{ ...greyBtnStyle, flex: 1 }}>Notes</a>
          )}
          {resource.lectureLink && (
            <a href={resource.lectureLink} target="_blank" rel="noopener noreferrer" style={{ ...greyBtnStyle, flex: 1 }}>Lecture</a>
          )}
          {resource.assignmentLink && (
            <a href={resource.assignmentLink} target="_blank" rel="noopener noreferrer" style={{ ...greyBtnStyle, flex: 1 }}>Assignment</a>
          )}
        </div>
      )}

      {/* PYQ link */}
      {resource.type === "pyq" && resource.pyqLink && (
        <div style={{ padding: "0 14px 12px" }}>
          <a href={resource.pyqLink} target="_blank" rel="noopener noreferrer" style={{ ...greyBtnStyle, display: "block", textAlign: "center" }}>
            View PYQ
          </a>
        </div>
      )}

      {/* Footer: share */}
      <div style={{ borderTop: "1px solid #F3F3F3", padding: "9px 14px" }}>
        <button onClick={handleShare} style={{
          width: "100%", padding: "6px 0",
          border: "1px solid #BFDBFE", borderRadius: 7,
          background: "#EFF6FF", color: "#2563EB",
          fontSize: 12, fontWeight: 600, cursor: "pointer",
        }}>Share</button>
      </div>
    </div>
  );
}

// ─── Notes View (flat list) ───────────────────────────────────────────────────
function NotesView({ resources, user, onView, onDownload, onDelete, onEdit, showToast, activeFilterTags }) {
  const filtered = activeFilterTags.length === 0
    ? resources
    : resources.filter((r) => {
        const rTags = r.tags ? r.tags.split(",").map((t) => t.trim()) : [];
        return activeFilterTags.some((t) => rTags.includes(t));
      });

  if (filtered.length === 0) {
    return (
      <div style={{
        textAlign: "center", padding: "60px 0",
        background: "#FAFAFA", borderRadius: 14,
        border: "1px dashed #DDDDD8",
      }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#555", margin: 0 }}>No notes found</p>
        <p style={{ fontSize: 12, color: "#AAA", marginTop: 4 }}>
          {activeFilterTags.length > 0 ? "Try a different tag filter" : "Be the first to upload"}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {filtered.map((resource) => (
        <ResourceCard key={resource._id} resource={resource} user={user}
          onView={onView} onDownload={onDownload} onDelete={onDelete} onEdit={onEdit} showToast={showToast} />
      ))}
    </div>
  );
}

// ─── PYQ View ─────────────────────────────────────────────────────────────────
function PYQView({ resources, user, onView, onDownload, onDelete, onEdit, showToast, activeFilterTags }) {
  const [activeUnits, setActiveUnits] = useState([]);
  const units = ["1", "2", "3", "4", "5"];

  const toggleUnit = (u) =>
    setActiveUnits((prev) => prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]);

  let filtered = activeFilterTags.length === 0
    ? resources
    : resources.filter((r) => {
        const rTags = r.tags ? r.tags.split(",").map((t) => t.trim()) : [];
        return activeFilterTags.some((t) => rTags.includes(t));
      });

  if (activeUnits.length > 0) {
    filtered = filtered.filter((r) => {
      if (!r.unit || r.unit === "General") return false;
      const rUnits = r.unit.split(",").map((x) => x.trim());
      return activeUnits.some((u) => rUnits.includes(u));
    });
  }

  const btnBase = {
    borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
    border: "1px solid", padding: "5px 12px",
  };

  if (resources.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", background: "#FAFAFA", borderRadius: 14, border: "1px dashed #DDDDD8" }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#555", margin: 0 }}>No PYQs yet</p>
        <p style={{ fontSize: 12, color: "#AAA", marginTop: 4 }}>Be the first to upload</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: "#888", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Unit</span>
        <button onClick={() => setActiveUnits([])} style={{
          ...btnBase,
          borderColor: activeUnits.length === 0 ? "#000" : "#D4D4D4",
          background: activeUnits.length === 0 ? "#000" : "#F5F5F5",
          color: activeUnits.length === 0 ? "#fff" : "#555",
        }}>All</button>
        {units.map((u) => (
          <button key={u} onClick={() => toggleUnit(u)} style={{
            ...btnBase, width: 32, height: 32, padding: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderColor: activeUnits.includes(u) ? "#000" : "#D4D4D4",
            background: activeUnits.includes(u) ? "#000" : "#F5F5F5",
            color: activeUnits.includes(u) ? "#fff" : "#555",
          }}>{u}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 ? (
          <p style={{ textAlign: "center", color: "#AAA", fontSize: 13, padding: "40px 0" }}>No results</p>
        ) : (
          filtered.map((resource) => (
            <ResourceCard key={resource._id} resource={resource} user={user}
              onView={onView} onDownload={onDownload} onDelete={onDelete} onEdit={onEdit} showToast={showToast} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── File Viewer ──────────────────────────────────────────────────────────────
function FileViewer({ url, title, ext, onClose, onDownload }) {
  const isPdf = ext === "pdf";
  const [imgLoading, setImgLoading] = useState(true);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "#111", display: "flex", flexDirection: "column" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", background: "#fff", borderBottom: "1px solid #E8E8E8", flexShrink: 0,
      }}>
        <p style={{ fontSize: 13, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginRight: 12 }}>{title}</p>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button onClick={onDownload} style={{ fontSize: 12, fontWeight: 600, padding: "7px 14px", borderRadius: 8, background: "#000", color: "#fff", border: "none", cursor: "pointer" }}>Download</button>
          <button onClick={onClose} style={{ fontSize: 12, fontWeight: 600, padding: "7px 14px", borderRadius: 8, background: "#F5F5F5", color: "#333", border: "1px solid #E0E0E0", cursor: "pointer" }}>Close</button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        {imgLoading && !isPdf && (
          <p style={{ color: "#888", fontSize: 13 }}>Loading...</p>
        )}
        {!isPdf && (
          <img src={url} alt={title} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8 }}
            onLoad={() => setImgLoading(false)} />
        )}
      </div>
    </div>
  );
}

// ─── Tag Filter Bar ───────────────────────────────────────────────────────────
function TagFilterBar({ allTags, activeFilterTags, onToggle }) {
  if (allTags.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
      <span style={{ fontSize: 11, color: "#888", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Filter</span>
      {allTags.map((t) => (
        <TagPill key={t} label={t} active={activeFilterTags.includes(t)} onClick={() => onToggle(t)} />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Resources() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("notes");
  const [showUpload, setShowUpload] = useState(false);
  const [editResource, setEditResource] = useState(null);
  const [toast, setToast] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [activeFilterTags, setActiveFilterTags] = useState([]);
  const [customTags] = useState(loadCustomTags);

  useEffect(() => { fetchResources(); }, [activeTab]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/resources/all?type=${activeTab}`);
      setResources(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resource?")) return;
    try {
      await api.delete(`/api/resources/${id}`);
      setResources(resources.filter((r) => r._id !== id));
      showToast("Deleted");
    } catch { showToast("Failed to delete", "error"); }
  };

  const getFileExt = (url) => {
    if (!url) return "pdf";
    const rawExt = url.split(".").pop().split("?")[0].toLowerCase();
    return ["png", "jpg", "jpeg", "webp", "gif"].includes(rawExt) ? rawExt : "pdf";
  };

  const handleDownload = (url, title, ext) => {
    let downloadUrl = url;
    if (url && url.includes("/upload/")) downloadUrl = url.replace("/upload/", "/upload/fl_attachment/");
    const a = document.createElement("a");
    a.href = downloadUrl; a.download = `${title || "file"}.${ext}`; a.target = "_blank";
    document.body.appendChild(a); a.click(); a.remove();
  };

  const handleView = (resource) => {
    const ext = getFileExt(resource.fileUrl);
    if (ext === "pdf") {
      let viewUrl = resource.fileUrl || "";
      if (!viewUrl.split("?")[0].toLowerCase().endsWith(".pdf")) viewUrl += ".pdf";
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(viewUrl)}&embedded=true`, "_blank", "noopener,noreferrer");
      } else {
        window.open(viewUrl, "_blank", "noopener,noreferrer");
      }
    } else {
      setViewer({ url: resource.fileUrl, title: resource.title, ext });
    }
  };

  // Collect all unique tags from current resources + saved custom tags
  const allTagsInResources = Array.from(new Set(
    resources.flatMap((r) => r.tags ? r.tags.split(",").map((t) => t.trim()).filter(Boolean) : [])
  ));
  const displayableTags = Array.from(new Set([...PRESET_TAGS.filter((t) => allTagsInResources.includes(t)), ...allTagsInResources.filter((t) => !PRESET_TAGS.includes(t))]));

  const toggleFilterTag = (tag) =>
    setActiveFilterTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const dividerStyle = { borderTop: "1px solid #F0F0F0", margin: "0 0 14px" };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 16px 120px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Toast toast={toast} />

      {viewer && (
        <FileViewer url={viewer.url} title={viewer.title} ext={viewer.ext}
          onClose={() => setViewer(null)}
          onDownload={() => handleDownload(viewer.url, viewer.title, viewer.ext)} />
      )}

      {showUpload && (
        <UploadModal user={user} activeTab={activeTab}
          onClose={() => setShowUpload(false)}
          onSuccess={fetchResources}
          showToast={showToast} />
      )}

      {editResource && (
        <EditModal
          resource={editResource}
          onClose={() => setEditResource(null)}
          onSuccess={() => { setEditResource(null); fetchResources(); }}
          showToast={showToast}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => navigate("/")}
          aria-label="Go back"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", color: "#111", flexShrink: 0 }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111", margin: 0, letterSpacing: "-0.4px" }}>Resources</h1>
          <p style={{ fontSize: 11, color: "#AAA", margin: "2px 0 0" }}>Notes and PYQs</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", marginBottom: 18, borderBottom: "1px solid #F0F0F0" }}>
        {[{ id: "notes", label: "Notes" }, { id: "pyq", label: "PYQs" }].map((tab) => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setActiveFilterTags([]); }}
            style={{
              flex: 1, padding: "10px 0",
              fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? "#111" : "#AAA",
              background: "transparent", border: "none", cursor: "pointer",
              borderBottom: activeTab === tab.id ? "2px solid #111" : "2px solid transparent",
              marginBottom: -1, transition: "all 0.12s",
            }}>{tab.label}</button>
        ))}
      </div>

      {/* Tag filter */}
      <TagFilterBar allTags={displayableTags} activeFilterTags={activeFilterTags} onToggle={toggleFilterTag} />

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#BBB", fontSize: 13 }}>
          Loading...
        </div>
      ) : (
        <>
          {activeTab === "notes" && (
            <NotesView resources={resources} user={user} activeFilterTags={activeFilterTags}
              onView={handleView} onDownload={handleDownload} onDelete={handleDelete}
              onEdit={(r) => setEditResource(r)} showToast={showToast} />
          )}
          {activeTab === "pyq" && (
            <PYQView resources={resources} user={user} activeFilterTags={activeFilterTags}
              onView={handleView} onDownload={handleDownload} onDelete={handleDelete}
              onEdit={(r) => setEditResource(r)} showToast={showToast} />
          )}
        </>
      )}

      {/* FAB — raised above bottom nav */}
      {user && (
        <button
          onClick={() => setShowUpload(true)}
          aria-label="Upload resource"
          style={{
            position: "fixed", bottom: 80, right: 20,
            width: 52, height: 52, borderRadius: 14,
            background: "#111", color: "#fff",
            border: "none", cursor: "pointer", zIndex: 30,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 4V18M4 11H18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </div>
  );
}