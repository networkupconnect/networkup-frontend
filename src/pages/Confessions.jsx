import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const TAGS = ["Love 💕","Study 📚","Hostel 🏠","Faculty 👨‍🏫","Canteen 🍕","Crush 😍","Funny 😂","Serious 😤","Regret 😔","Random 🎲"];

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

const S = {
  page:    { minHeight:"100vh", background:"#fafaf9", fontFamily:"'DM Sans',system-ui,sans-serif", color:"#1a1a18" },
  wrap:    { maxWidth:600, margin:"0 auto", padding:"20px 16px 88px" },
  hdr:     { display:"flex", alignItems:"center", gap:12, marginBottom:20 },
  backBtn: { width:36, height:36, borderRadius:10, border:"1px solid #e5e3dc", background:"#fff", cursor:"pointer", fontSize:18, color:"#6b6860", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  input:   { width:"100%", padding:"9px 12px", borderRadius:10, border:"1px solid #e5e3dc", background:"#fff", fontSize:13, fontFamily:"inherit", color:"#1a1a18", outline:"none" },
  textarea:{ width:"100%", padding:"10px 12px", borderRadius:10, border:"1px solid #e5e3dc", background:"#fff", fontSize:13, fontFamily:"inherit", color:"#1a1a18", outline:"none", resize:"none" },
  overlay: { position:"fixed", inset:0, zIndex:50, background:"rgba(0,0,0,.15)", backdropFilter:"blur(4px)", display:"flex", alignItems:"flex-end", justifyContent:"center", padding:16 },
  modal:   { background:"#fff", borderRadius:"20px 20px 16px 16px", width:"100%", maxWidth:520, maxHeight:"88vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,.12)" },
  closeBtn:{ width:30, height:30, borderRadius:8, border:"1px solid #e5e3dc", background:"#f5f4f0", cursor:"pointer", color:"#9b9890", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 },
};

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{ position:"fixed", top:16, right:16, zIndex:99, padding:"9px 16px", borderRadius:12, background: toast.type==="error" ? "#dc2626" : "#16a34a", color:"#fff", fontSize:12, fontWeight:700, boxShadow:"0 4px 20px rgba(0,0,0,.12)" }}>
      {toast.msg}
    </div>
  );
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
  const [text, setText]               = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [posting, setPosting]         = useState(false);
  const [likedIds, setLikedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("liked_confessions")||"[]"); } catch { return []; }
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
    } catch { showToast("Failed to load","error"); }
    finally { setLoading(false); }
  };

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim()) return showToast("Write something first","error");
    if (text.trim().length < 10) return showToast("Too short — at least 10 chars","error");
    if (!user) return showToast("Login to post anonymously","error");
    try {
      setPosting(true);
      const res = await api.post("/api/confessions", { text, tag: selectedTag });
      setConfessions(p => [res.data,...p]);
      setText(""); setSelectedTag(""); setShowPost(false);
      showToast("Posted anonymously!");
    } catch (err) { showToast(err.response?.data?.message||"Failed","error"); }
    finally { setPosting(false); }
  };

  const handleLike = async (id) => {
    const alreadyLiked = likedIds.includes(id);
    setConfessions(p => p.map(c => c._id===id ? {...c, likes: alreadyLiked ? c.likes-1 : c.likes+1} : c));
    const newLiked = alreadyLiked ? likedIds.filter(i=>i!==id) : [...likedIds,id];
    setLikedIds(newLiked);
    localStorage.setItem("liked_confessions", JSON.stringify(newLiked));
    try { await api.patch(`/api/confessions/${id}/like`); }
    catch {
      setConfessions(p => p.map(c => c._id===id ? {...c, likes: alreadyLiked ? c.likes+1 : c.likes-1} : c));
      setLikedIds(likedIds);
      localStorage.setItem("liked_confessions", JSON.stringify(likedIds));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this confession?")) return;
    try {
      await api.delete(`/api/confessions/${id}`);
      setConfessions(p => p.filter(c => c._id!==id));
      showToast("Deleted!");
    } catch { showToast("Failed","error"); }
  };

  const charLimit = 500;

  return (
    <div style={S.page}>
      <Toast toast={toast} />

      {/* Post Modal */}
      {showPost && (
        <div style={S.overlay} onClick={() => setShowPost(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={{ padding:20 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:"#f0ede8", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🎭</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700 }}>Anonymous</div>
                    <div style={{ fontSize:11, color:"#9b9890" }}>Your identity stays hidden</div>
                  </div>
                </div>
                <button style={S.closeBtn} onClick={() => setShowPost(false)}>✕</button>
              </div>

              <form onSubmit={handlePost} style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <div>
                  <textarea
                    style={{...S.textarea, minHeight:110}}
                    placeholder="Confess something… no one will know it's you 🤫"
                    value={text}
                    onChange={e => setText(e.target.value.slice(0, charLimit))}
                    rows={5}
                  />
                  <div style={{ display:"flex", justifyContent:"flex-end", marginTop:3 }}>
                    <span style={{ fontSize:11, color: text.length > charLimit*.9 ? "#dc2626" : "#9b9890" }}>{text.length}/{charLimit}</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:"#9b9890", textTransform:"uppercase", letterSpacing:".05em", marginBottom:7 }}>Tag (optional)</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {TAGS.map(t => (
                      <button key={t} type="button" onClick={() => setSelectedTag(selectedTag===t ? "" : t)} style={{
                        padding:"4px 10px", borderRadius:100, fontSize:11, fontWeight:600, cursor:"pointer",
                        border: selectedTag===t ? "1.5px solid #7c3aed" : "1px solid #e5e3dc",
                        background: selectedTag===t ? "#ede9fe" : "#f5f4f0",
                        color: selectedTag===t ? "#7c3aed" : "#6b6860",
                      }}>{t}</button>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={posting||!text.trim()} style={{
                  padding:"11px", borderRadius:12, border:"none", background:"#7c3aed", color:"#fff",
                  fontSize:13, fontWeight:700, cursor: posting||!text.trim() ? "not-allowed" : "pointer", opacity: posting||!text.trim() ? .5 : 1,
                  fontFamily:"inherit",
                }}>
                  {posting ? "Posting…" : "Post Anonymously"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div style={S.wrap}>
        {/* Header */}
        <div style={S.hdr}>
          <button style={S.backBtn} onClick={() => navigate("/")}>‹</button>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:18, fontWeight:800, letterSpacing:"-.3px" }}>Confessions 🎭</div>
            <div style={{ fontSize:11, color:"#9b9890", marginTop:1 }}>Anonymous · no judgement</div>
          </div>
          {user && (
            <button onClick={() => setShowPost(true)} style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#7c3aed", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>
              + Confess
            </button>
          )}
        </div>

        {/* Guest CTA */}
        {!user && (
          <div style={{ background:"#f5f0ff", border:"1px solid #ede9fe", borderRadius:14, padding:"16px", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:"#5b21b6" }}>Post anonymously</div>
              <div style={{ fontSize:11, color:"#7c3aed", marginTop:2 }}>Your name is never shown</div>
            </div>
            <button onClick={() => navigate("/login")} style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#7c3aed", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", flexShrink:0 }}>
              Login →
            </button>
          </div>
        )}

        {/* Filters */}
        <div style={{ display:"flex", gap:6, marginBottom:14, overflowX:"auto", paddingBottom:2 }}>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding:"7px 10px", borderRadius:10, border:"1px solid #e5e3dc", background:"#fff", fontSize:11, color:"#6b6860", outline:"none", flexShrink:0, fontFamily:"inherit" }}>
            <option value="newest">Newest</option>
            <option value="popular">Most Liked</option>
          </select>
          <button onClick={() => setFilterTag("")} style={{ padding:"7px 12px", borderRadius:10, fontSize:11, fontWeight:600, border: !filterTag ? "1.5px solid #7c3aed" : "1px solid #e5e3dc", background: !filterTag ? "#ede9fe" : "#fff", color: !filterTag ? "#7c3aed" : "#9b9890", cursor:"pointer", flexShrink:0, whiteSpace:"nowrap" }}>
            All
          </button>
          {TAGS.map(t => (
            <button key={t} onClick={() => setFilterTag(filterTag===t ? "" : t)} style={{ padding:"7px 12px", borderRadius:10, fontSize:11, fontWeight:600, cursor:"pointer", flexShrink:0, whiteSpace:"nowrap", border: filterTag===t ? "1.5px solid #7c3aed" : "1px solid #e5e3dc", background: filterTag===t ? "#ede9fe" : "#fff", color: filterTag===t ? "#7c3aed" : "#9b9890" }}>
              {t}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign:"center", padding:"48px 0", color:"#9b9890", fontSize:13 }}>Loading…</div>
        ) : confessions.length === 0 ? (
          <div style={{ textAlign:"center", padding:"48px", background:"#fff", border:"1px solid #e5e3dc", borderRadius:14 }}>
            <div style={{ fontSize:32, marginBottom:8 }}>🤫</div>
            <div style={{ fontWeight:700 }}>No confessions yet</div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {confessions.map((c, i) => {
              const liked = likedIds.includes(c._id);
              const isMyPost = c.postedBy === user?._id;
              return (
                <div key={c._id} style={{ background:"#fff", border:"1px solid #e5e3dc", borderRadius:14, padding:"14px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#db2777)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>🎭</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:"#6b6860" }}>Anonymous #{(i+1).toString().padStart(3,"0")}</div>
                      <div style={{ fontSize:10, color:"#b5b3ac" }}>{timeAgo(c.createdAt)}</div>
                    </div>
                    {c.tag && (
                      <span style={{ fontSize:10, padding:"2px 8px", borderRadius:100, background:"#ede9fe", color:"#7c3aed", fontWeight:600 }}>{c.tag}</span>
                    )}
                    {(user?.role==="admin"||isMyPost) && (
                      <button onClick={() => handleDelete(c._id)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:"#d1d0ca", padding:0 }}>🗑</button>
                    )}
                  </div>

                  <p style={{ fontSize:13, lineHeight:1.65, color:"#2a2a28", marginBottom:12 }}>{c.text}</p>

                  <div style={{ display:"flex", alignItems:"center", paddingTop:10, borderTop:"1px solid #f0ede8" }}>
                    <button onClick={() => handleLike(c._id)} style={{ display:"flex", alignItems:"center", gap:5, background:"none", border:"none", cursor:"pointer", padding:0, color: liked ? "#db2777" : "#b5b3ac", fontSize:13 }}>
                      <span>{liked ? "❤️" : "🤍"}</span>
                      <span style={{ fontSize:12, fontWeight:600 }}>{c.likes||0}</span>
                    </button>
                    <span style={{ fontSize:10, color:"#d1d0ca", marginLeft:"auto" }}>🔒 Anonymous</span>
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