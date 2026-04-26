import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${
        toast.type === "success" ? "bg-green-500" : "bg-red-500"
      }`}
    >
      {toast.msg}
    </div>
  );
}

// ─── File Viewer ──────────────────────────────────────────────────────────────
function FileViewer({ url, title, ext, onClose, onDownload }) {
  const isPdf = ext === "pdf";
  const [imgLoading, setImgLoading] = useState(true);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        <p className="font-semibold text-black text-sm truncate flex-1 mr-3">{title}</p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onDownload}
            className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium"
          >
            Download
          </button>
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-black text-xs px-3 py-1.5 rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-800 flex items-center justify-center p-4">
        {imgLoading && !isPdf && (
          <div className="absolute flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-sm">Loading...</p>
          </div>
        )}
        {!isPdf && (
          <img
            src={url}
            alt={title}
            className="max-w-full max-h-full object-contain rounded-lg"
            onLoad={() => setImgLoading(false)}
          />
        )}
      </div>
    </div>
  );
}

// ─── Unit Selector (1–5 multi-select) ────────────────────────────────────────
function UnitSelector({ value, onChange }) {
  const units = ["1", "2", "3", "4", "5"];
  const toggle = (u) =>
    onChange(value.includes(u) ? value.filter((x) => x !== u) : [...value, u]);

  return (
    <div>
      <label className="text-xs text-gray-500 mb-1.5 block font-medium">Unit</label>
      <div className="flex gap-2">
        {units.map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => toggle(u)}
            className={`w-10 h-10 rounded-xl text-sm font-bold transition border-2 ${
              value.includes(u)
                ? "bg-black text-white border-black"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {u}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────
function UploadModal({ activeTab, onClose, onSuccess, showToast, user }) {
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    units: [],
    notesLink: "",
    lectureLink: "",
    assignmentLink: "",
    pyqLink: "",
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.subject) return showToast("Subject name is required", "error");
    if (activeTab === "notes" && !form.notesLink)
      return showToast("Notes link is required", "error");
    if (activeTab === "pyq" && !form.pyqLink)
      return showToast("PYQ link is required", "error");

    const formData = new FormData();
    formData.append("title", form.title || form.subject);
    formData.append("description", form.description);
    formData.append("type", activeTab);
    formData.append("subject", form.subject);
    formData.append("unit", form.units.length > 0 ? form.units.join(",") : "General");
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
      onClose();
      onSuccess();
      showToast("Uploaded successfully");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to upload", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
          <h2 className="font-bold text-base text-gray-900">
            Upload {activeTab === "notes" ? "Note" : "PYQ"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 text-sm font-bold"
          >
            x
          </button>
        </div>

        <form onSubmit={handleUpload} className="p-5 space-y-3">
          <input
            placeholder="Subject Name *"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            required
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
          />

          <input
            placeholder="Title (optional)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
          />

          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none resize-none"
          />

          <UnitSelector
            value={form.units}
            onChange={(units) => setForm({ ...form, units })}
          />

          {activeTab === "notes" && (
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-medium">
                  Notes Link <span className="text-red-400">(required)</span>
                </label>
                <input
                  placeholder="https://drive.google.com/..."
                  value={form.notesLink}
                  onChange={(e) => setForm({ ...form, notesLink: e.target.value })}
                  className={`w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none ${
                    !form.notesLink ? "border-orange-300 bg-orange-50" : "border-gray-200"
                  }`}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-medium">
                  Lecture Link <span className="text-gray-300">(optional)</span>
                </label>
                <input
                  placeholder="https://youtube.com/..."
                  value={form.lectureLink}
                  onChange={(e) => setForm({ ...form, lectureLink: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-medium">
                  Assignment Link <span className="text-gray-300">(optional)</span>
                </label>
                <input
                  placeholder="https://..."
                  value={form.assignmentLink}
                  onChange={(e) => setForm({ ...form, assignmentLink: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === "pyq" && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">
                PYQ Link <span className="text-red-400">(required)</span>
              </label>
              <input
                placeholder="https://drive.google.com/..."
                value={form.pyqLink}
                onChange={(e) => setForm({ ...form, pyqLink: e.target.value })}
                className={`w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none ${
                  !form.pyqLink ? "border-orange-300 bg-orange-50" : "border-gray-200"
                }`}
              />
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white py-3.5 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : (
                `Upload ${activeTab === "notes" ? "Note" : "PYQ"}`
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Resource Card ────────────────────────────────────────────────────────────
function ResourceCard({ resource, user, onView, onDownload, onDelete, showToast }) {
  const ext = resource.fileUrl
    ? resource.fileUrl.split(".").pop().split("?")[0].toLowerCase()
    : "pdf";
  const isPdf = !["png", "jpg", "jpeg", "webp", "gif"].includes(ext);
  const fileExt = isPdf ? "pdf" : ext;
  const hasFile = !!resource.fileUrl;

  const unitTags =
    resource.unit && resource.unit !== "General"
      ? resource.unit.split(",").map((u) => u.trim())
      : [];

  const handleShare = () => {
    const url = `${window.location.origin}/resources?id=${resource._id}`;
    if (navigator.share) {
      navigator.share({ title: resource.title, url });
    } else {
      navigator.clipboard.writeText(url).then(() => showToast("Link copied"));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-start gap-3 p-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{resource.title}</p>
          {resource.subject && (
            <p className="text-xs text-blue-500 font-medium truncate mt-0.5">{resource.subject}</p>
          )}
          {resource.description && (
            <p className="text-xs text-gray-400 truncate mt-0.5">{resource.description}</p>
          )}
          {unitTags.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {unitTags.map((u) => (
                <span
                  key={u}
                  className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md font-medium"
                >
                  Unit {u}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          {hasFile && (
            <>
              <button
                onClick={() => onView(resource)}
                className="text-xs bg-blue-500 text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-600"
              >
                View
              </button>
              <button
                onClick={() => onDownload(resource.fileUrl, resource.title, fileExt)}
                className="text-xs bg-green-500 text-white px-2.5 py-1.5 rounded-lg hover:bg-green-600"
              >
                Save
              </button>
            </>
          )}
          {user && user._id === resource.uploadedBy?._id?.toString() && (
            <button
              onClick={() => onDelete(resource._id)}
              className="text-xs bg-red-50 text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-100"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Notes link buttons */}
      {resource.type === "notes" &&
        (resource.notesLink || resource.lectureLink || resource.assignmentLink) && (
          <div className="flex gap-2 px-3 pb-3 flex-wrap">
            {resource.notesLink && (
              <a
                href={resource.notesLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0 text-center text-xs bg-blue-50 text-blue-600 font-semibold py-2 rounded-xl hover:bg-blue-100 transition"
              >
                Notes
              </a>
            )}
            {resource.lectureLink && (
              <a
                href={resource.lectureLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0 text-center text-xs bg-purple-50 text-purple-600 font-semibold py-2 rounded-xl hover:bg-purple-100 transition"
              >
                Lecture
              </a>
            )}
            {resource.assignmentLink && (
              <a
                href={resource.assignmentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0 text-center text-xs bg-orange-50 text-orange-600 font-semibold py-2 rounded-xl hover:bg-orange-100 transition"
              >
                Assignment
              </a>
            )}
          </div>
        )}

      {/* PYQ link */}
      {resource.type === "pyq" && resource.pyqLink && (
        <div className="px-3 pb-3">
          <a
            href={resource.pyqLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs bg-gray-100 text-gray-700 font-semibold py-2 rounded-xl hover:bg-gray-200 transition"
          >
            View PYQ
          </a>
        </div>
      )}

      {/* Share */}
      <div className="border-t border-gray-50 px-3 py-2">
        <button
          onClick={handleShare}
          className="w-full text-xs text-gray-400 hover:text-gray-600 font-medium transition"
        >
          Share Notes
        </button>
      </div>
    </div>
  );
}

// ─── Notes View (grouped by subject) ─────────────────────────────────────────
function NotesView({ resources, user, onView, onDownload, onDelete, showToast }) {
  const [expandedSubject, setExpandedSubject] = useState(null);

  const bySubject = {};
  resources.forEach((r) => {
    if (!bySubject[r.subject]) bySubject[r.subject] = [];
    bySubject[r.subject].push(r);
  });
  const subjects = Object.keys(bySubject);

  if (subjects.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <p className="text-gray-600 font-semibold">No notes yet</p>
        <p className="text-gray-400 text-sm mt-1">Be the first to upload</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {subjects.map((subjectName) => {
        const items = bySubject[subjectName];
        const isOpen = expandedSubject === subjectName;
        const count = items.length;

        return (
          <div
            key={subjectName}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <button
              onClick={() => setExpandedSubject(isOpen ? null : subjectName)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {subjectName.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{subjectName}</p>
                <p className="text-xs text-gray-400">
                  {count} file{count !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {count}
                </span>
                <span
                  className={`text-gray-400 text-sm transition-transform duration-200 inline-block ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  v
                </span>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-gray-100 p-3 space-y-2 bg-gray-50">
                {items.map((resource) => (
                  <ResourceCard
                    key={resource._id}
                    resource={resource}
                    user={user}
                    onView={onView}
                    onDownload={onDownload}
                    onDelete={onDelete}
                    showToast={showToast}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── PYQ View ─────────────────────────────────────────────────────────────────
function PYQView({ resources, user, onView, onDownload, onDelete, showToast }) {
  const [activeUnits, setActiveUnits] = useState([]);
  const units = ["1", "2", "3", "4", "5"];

  const toggleUnit = (u) =>
    setActiveUnits((prev) =>
      prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]
    );

  const filtered =
    activeUnits.length === 0
      ? resources
      : resources.filter((r) => {
          if (!r.unit || r.unit === "General") return false;
          const rUnits = r.unit.split(",").map((x) => x.trim());
          return activeUnits.some((u) => rUnits.includes(u));
        });

  if (resources.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <p className="text-gray-600 font-semibold">No PYQs yet</p>
        <p className="text-gray-400 text-sm mt-1">Be the first to upload</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-gray-400 font-medium">Unit</span>
        <button
          onClick={() => setActiveUnits([])}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
            activeUnits.length === 0
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {units.map((u) => (
          <button
            key={u}
            onClick={() => toggleUnit(u)}
            className={`w-8 h-8 rounded-full text-xs font-bold transition ${
              activeUnits.includes(u)
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {u}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            No PYQs for selected units
          </div>
        ) : (
          filtered.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              user={user}
              onView={onView}
              onDownload={onDownload}
              onDelete={onDelete}
              showToast={showToast}
            />
          ))
        )}
      </div>
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
  const [toast, setToast] = useState(null);
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    fetchResources();
  }, [activeTab]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/resources/all?type=${activeTab}`);
      setResources(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const getFileExt = (url) => {
    if (!url) return "pdf";
    const rawExt = url.split(".").pop().split("?")[0].toLowerCase();
    return ["png", "jpg", "jpeg", "webp", "gif"].includes(rawExt) ? rawExt : "pdf";
  };

  const handleDownload = (url, title, ext) => {
    let downloadUrl = url;
    if (url && url.includes("/upload/")) {
      downloadUrl = url.replace("/upload/", "/upload/fl_attachment/");
    }
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${title || "file"}.${ext}`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleView = (resource) => {
    const ext = getFileExt(resource.fileUrl);
    if (ext === "pdf") {
      let viewUrl = resource.fileUrl || "";
      if (!viewUrl.split("?")[0].toLowerCase().endsWith(".pdf"))
        viewUrl = viewUrl + ".pdf";
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.open(
          `https://docs.google.com/viewer?url=${encodeURIComponent(viewUrl)}&embedded=true`,
          "_blank",
          "noopener,noreferrer"
        );
      } else {
        window.open(viewUrl, "_blank", "noopener,noreferrer");
      }
    } else {
      setViewer({ url: resource.fileUrl, title: resource.title, ext });
    }
  };

  const TABS = [
    { id: "notes", label: "Notes" },
    { id: "pyq", label: "PYQs" },
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 pb-28">
      <Toast toast={toast} />

      {viewer && (
        <FileViewer
          url={viewer.url}
          title={viewer.title}
          ext={viewer.ext}
          onClose={() => setViewer(null)}
          onDownload={() => handleDownload(viewer.url, viewer.title, viewer.ext)}
        />
      )}

      {showUpload && (
        <UploadModal
          user={user}
          activeTab={activeTab}
          onClose={() => setShowUpload(false)}
          onSuccess={() => fetchResources()}
          showToast={showToast}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-xs text-gray-400 mt-0.5">Notes and PYQs</p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm transition"
        >
          Back
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white w-full mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === tab.id
                ? "underline text-black decoration-2 decoration-black"
                : "text-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-10 text-gray-400">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading...
        </div>
      ) : (
        <>
          {activeTab === "notes" && (
            <NotesView
              resources={resources}
              user={user}
              onView={handleView}
              onDownload={handleDownload}
              onDelete={handleDelete}
              showToast={showToast}
            />
          )}
          {activeTab === "pyq" && (
            <PYQView
              resources={resources}
              user={user}
              onView={handleView}
              onDownload={handleDownload}
              onDelete={handleDelete}
              showToast={showToast}
            />
          )}
        </>
      )}

      {/* FAB */}
      {user && (
        <button
          onClick={() => setShowUpload(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-2xl text-3xl font-light flex items-center justify-center shadow-lg hover:bg-gray-800 active:scale-95 transition z-30"
          aria-label="Upload resource"
        >
          +
        </button>
      )}
    </div>
  );
}