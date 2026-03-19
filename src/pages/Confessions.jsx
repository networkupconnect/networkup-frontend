import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const TAGS = ["Love 💕", "Study 📚", "Hostel 🏠", "Faculty 👨‍🏫", "Canteen 🍕", "Crush 😍", "Funny 😂", "Serious 😤", "Regret 😔", "Random 🎲"];

function timeAgo(date) {
  const diff = Date.now() - new Date(date);
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24)  return `${hrs}h ago`;
  return `${days}d ago`;
}

export default function Confessions() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [toast, setToast]             = useState(null);
  const [showPost, setShowPost]       = useState(false);
  const [filterTag, setFilterTag]     = useState("");
  const [sort, setSort]               = useState("newest");

  // post form
  const [text, setText]           = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [posting, setPosting]     = useState(false);

  // likes
  const [likedIds, setLikedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("liked_confessions") || "[]"); }
    catch { return []; }
  });

  useEffect(() => { fetchConfessions(); }, [filterTag, sort]);

  const fetchConfessions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterTag) params.append("tag", filterTag);
      params.append("sort", sort);
      const res = await api.get(`/api/confessions?${params}`);
      setConfessions(res.data);
    } catch { showToast("Failed to load", "error"); }
    finally { setLoading(false); }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim()) return showToast("Write something first", "error");
    if (text.trim().length < 10) return showToast("Too short! Write at least 10 characters", "error");
    if (!user) return showToast("Login to post anonymously", "error");

    try {
      setPosting(true);
      const res = await api.post("/api/confessions", { text, tag: selectedTag });
      setConfessions(p => [res.data, ...p]);
      setText(""); setSelectedTag(""); setShowPost(false);
      showToast("Posted anonymously! 🎭");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
    } finally { setPosting(false); }
  };

  const handleLike = async (id) => {
    const alreadyLiked = likedIds.includes(id);
    // optimistic update
    setConfessions(p => p.map(c =>
      c._id === id ? { ...c, likes: alreadyLiked ? c.likes - 1 : c.likes + 1 } : c
    ));
    const newLiked = alreadyLiked ? likedIds.filter(i => i !== id) : [...likedIds, id];
    setLikedIds(newLiked);
    localStorage.setItem("liked_confessions", JSON.stringify(newLiked));

    try {
      await api.patch(`/api/confessions/${id}/like`);
    } catch {
      // revert on error
      setConfessions(p => p.map(c =>
        c._id === id ? { ...c, likes: alreadyLiked ? c.likes + 1 : c.likes - 1 } : c
      ));
      setLikedIds(likedIds);
      localStorage.setItem("liked_confessions", JSON.stringify(likedIds));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this confession?")) return;
    try {
      await api.delete(`/api/confessions/${id}`);
      setConfessions(p => p.filter(c => c._id !== id));
      showToast("Deleted!");
    } catch { showToast("Failed", "error"); }
  };

  const charLimit = 500;

  return (
    <div className="min-h-screen bg-zinc-950">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm font-semibold shadow-xl ${
          toast.type === "error" ? "bg-red-500" : "bg-emerald-500"
        }`}>{toast.msg}</div>
      )}

      {/* ── Post Modal ── */}
      {showPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg">
            <div className="p-5">
              {/* Anonymous indicator */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-xl">🎭</div>
                <div>
                  <p className="text-white font-bold text-sm">Anonymous</p>
                  <p className="text-zinc-500 text-xs">Your identity is completely hidden</p>
                </div>
                <button onClick={() => setShowPost(false)}
                  className="ml-auto w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handlePost}>
                <textarea
                  placeholder="Confess something... no one will know it's you 🤫"
                  rows={5} value={text}
                  onChange={e => setText(e.target.value.slice(0, charLimit))}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 resize-none mb-1"
                />
                <div className="flex justify-between mb-3">
                  <p className="text-zinc-600 text-xs">Be kind. No hate speech.</p>
                  <p className={`text-xs ${text.length > charLimit * 0.9 ? "text-red-400" : "text-zinc-600"}`}>
                    {text.length}/{charLimit}
                  </p>
                </div>

                {/* Tag selector */}
                <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2 font-semibold">Tag (optional)</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {TAGS.map(t => (
                    <button key={t} type="button" onClick={() => setSelectedTag(selectedTag === t ? "" : t)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all font-medium ${
                        selectedTag === t
                          ? "bg-purple-500 text-white border-purple-500"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500"
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>

                <button type="submit" disabled={posting || !text.trim()}
                  className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition-all">
                  {posting ? "Posting..." : "🎭 Post Anonymously"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate("/")}
            className="w-10 h-10 bg-zinc-800 hover:bg-purple-500 text-white rounded-xl flex items-center justify-center font-bold text-lg transition-all flex-shrink-0">
            ‹
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-black text-white">Confessions 🎭</h1>
            <p className="text-zinc-500 text-xs">Anonymous campus confessions — no judgement</p>
          </div>
          {user && (
            <button onClick={() => setShowPost(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">
              + Confess
            </button>
          )}
        </div>

        {/* Hero */}
        <div className="rounded-3xl p-5 mb-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1a0b2e 0%, #0f0f1a 100%)", border: "1px solid #4a1d96" }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #a855f7, transparent)", transform: "translate(30%,-30%)" }} />
          <p className="text-5xl mb-2">🎭</p>
          <h2 className="text-white font-black text-lg">Say it anonymously</h2>
          <p className="text-zinc-400 text-xs mt-1">Your name is never shown. Post freely, read honestly.</p>
          {!user && (
            <button onClick={() => navigate("/login")}
              className="mt-3 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">
              Login to Confess →
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl px-3 py-2 text-xs flex-shrink-0 focus:outline-none focus:border-purple-500">
            <option value="newest">Newest</option>
            <option value="popular">Most Liked</option>
          </select>
          <button onClick={() => setFilterTag("")}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              !filterTag ? "bg-purple-500 text-white border-purple-500" : "bg-zinc-900 text-zinc-400 border-zinc-800"
            }`}>
            All
          </button>
          {TAGS.map(t => (
            <button key={t} onClick={() => setFilterTag(filterTag === t ? "" : t)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                filterTag === t ? "bg-purple-500 text-white border-purple-500" : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600"
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">Loading confessions...</p>
          </div>
        ) : confessions.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <p className="text-5xl mb-3">🤫</p>
            <p className="text-white font-bold">No confessions yet</p>
            <p className="text-zinc-500 text-sm mt-1">Be the first to confess!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {confessions.map((c, i) => {
              const liked = likedIds.includes(c._id);
              const isMyPost = c.postedBy === user?._id;
              return (
                <div key={c._id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 transition-all">

                  {/* Top */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm flex-shrink-0">
                      🎭
                    </div>
                    <div className="flex-1">
                      <p className="text-zinc-400 text-xs font-semibold">Anonymous #{(i + 1).toString().padStart(3, "0")}</p>
                      <p className="text-zinc-600 text-xs">{timeAgo(c.createdAt)}</p>
                    </div>
                    {c.tag && (
                      <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs px-2 py-0.5 rounded-full font-medium">
                        {c.tag}
                      </span>
                    )}
                    {/* Admin or own post delete */}
                    {(user?.role === "admin" || isMyPost) && (
                      <button onClick={() => handleDelete(c._id)}
                        className="text-zinc-700 hover:text-red-400 text-sm transition-all ml-1">
                        🗑
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <p className="text-zinc-100 text-sm leading-relaxed mb-3">{c.text}</p>

                  {/* Footer */}
                  <div className="flex items-center gap-4 pt-2 border-t border-zinc-800">
                    <button onClick={() => handleLike(c._id)}
                      className={`flex items-center gap-1.5 text-sm transition-all ${
                        liked ? "text-pink-400" : "text-zinc-600 hover:text-pink-400"
                      }`}>
                      <span>{liked ? "❤️" : "🤍"}</span>
                      <span className="text-xs font-semibold">{c.likes || 0}</span>
                    </button>
                    <p className="text-zinc-700 text-xs ml-auto">🔒 100% Anonymous</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}