import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "../api/axios";

const CATEGORIES = [
  "Electronics","Books","Wallet","Keys","ID Card",
  "Bag","Bottle","Clothes","Jewellery","Documents","Other"
];
const LOCATIONS = [
  "Library","Canteen","Classroom","Lab","Hostel",
  "Ground","Parking","Washroom","Bus Stop","Other"
];

function timeAgo(date) {
  const diff = Date.now() - new Date(date);
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24)  return `${hrs}h ago`;
  return `${days}d ago`;
}

const S = {
  page:      { minHeight:"100vh", background:"#fafaf9", fontFamily:"'DM Sans',system-ui,sans-serif", color:"#1a1a18" },
  wrap:      { maxWidth:600, margin:"0 auto", padding:"20px 16px 88px" },
  // header
  hdr:       { display:"flex", alignItems:"center", gap:12, marginBottom:20 },
  backBtn:   { width:36, height:36, borderRadius:10, border:"1px solid #e5e3dc", background:"#fff", cursor:"pointer", fontSize:18, color:"#6b6860", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  hdrTitle:  { fontSize:18, fontWeight:800, letterSpacing:"-.3px" },
  hdrSub:    { fontSize:11, color:"#9b9890", marginTop:1 },
  postBtn:   (color) => ({ padding:"8px 14px", borderRadius:10, border:"none", background:color, color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", flexShrink:0 }),
  // card
  card:      { background:"#fff", border:"1px solid #e5e3dc", borderRadius:14, marginBottom:10, overflow:"hidden", cursor:"pointer" },
  // tabs
  tabBar:    { display:"flex", background:"#f0ede8", borderRadius:12, padding:3, marginBottom:14, gap:2 },
  tab:       (active, color) => ({ flex:1, padding:"7px 4px", borderRadius:9, fontSize:11, fontWeight:700, border:"none", cursor:"pointer", transition:"all .13s", background: active ? color : "transparent", color: active ? "#fff" : "#9b9890" }),
  // inputs
  input:     { width:"100%", padding:"9px 12px", borderRadius:10, border:"1px solid #e5e3dc", background:"#fff", fontSize:13, fontFamily:"inherit", color:"#1a1a18", outline:"none" },
  select:    { width:"100%", padding:"9px 12px", borderRadius:10, border:"1px solid #e5e3dc", background:"#fff", fontSize:12, fontFamily:"inherit", color:"#6b6860", outline:"none" },
  textarea:  { width:"100%", padding:"9px 12px", borderRadius:10, border:"1px solid #e5e3dc", background:"#fff", fontSize:13, fontFamily:"inherit", color:"#1a1a18", outline:"none", resize:"none" },
  label:     { fontSize:10, fontWeight:700, color:"#9b9890", textTransform:"uppercase", letterSpacing:".05em", display:"block", marginBottom:5 },
  // modal
  overlay:   { position:"fixed", inset:0, zIndex:50, background:"rgba(0,0,0,.18)", backdropFilter:"blur(4px)", display:"flex", alignItems:"flex-end", justifyContent:"center", padding:16 },
  modal:     { background:"#fff", borderRadius:"20px 20px 16px 16px", width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,.12)" },
  modalBody: { padding:20 },
  closeBtn:  { width:30, height:30, borderRadius:8, border:"1px solid #e5e3dc", background:"#f5f4f0", cursor:"pointer", color:"#9b9890", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 },
  // pill badges
  lostPill:  { fontSize:10, padding:"2px 8px", borderRadius:100, fontWeight:700, background:"#fee2e2", color:"#dc2626", border:"1px solid #fecaca" },
  foundPill: { fontSize:10, padding:"2px 8px", borderRadius:100, fontWeight:700, background:"#dcfce7", color:"#16a34a", border:"1px solid #bbf7d0" },
  resPill:   { fontSize:10, padding:"2px 8px", borderRadius:100, fontWeight:600, background:"#f0ede8", color:"#9b9890" },
  rewPill:   { fontSize:10, padding:"2px 8px", borderRadius:100, fontWeight:600, background:"#fef9c3", color:"#a16207", border:"1px solid #fde68a" },
  // action buttons
  primaryBtn:(color) => ({ width:"100%", padding:"11px", borderRadius:12, border:"none", background:color, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }),
  ghostBtn:  { width:"100%", padding:"11px", borderRadius:12, border:"1px solid #e5e3dc", background:"#f5f4f0", color:"#6b6860", fontSize:13, fontWeight:600, cursor:"pointer" },
  dangerBtn: { width:"100%", padding:"11px", borderRadius:12, border:"1px solid #fee2e2", background:"#fff", color:"#dc2626", fontSize:13, fontWeight:600, cursor:"pointer" },
};

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position:"fixed", top:16, right:16, zIndex:99,
      padding:"9px 16px", borderRadius:12,
      background: toast.type === "error" ? "#dc2626" : "#16a34a",
      color:"#fff", fontSize:12, fontWeight:700,
      boxShadow:"0 4px 20px rgba(0,0,0,.15)",
    }}>{toast.msg}</div>
  );
}

export default function LostFound() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]           = useState("lost");
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState(null);
  const [showPost, setShowPost] = useState(false);
  const [selected, setSelected] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles]       = useState([]);
  const [previews, setPreviews] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [search, setSearch]     = useState("");
  const [form, setForm] = useState({
    type:"lost", title:"", description:"", category:"", location:"", date:"", contactInfo:"", reward:"",
  });

  useEffect(() => { fetchItems(); }, [tab, filterCategory, filterLocation]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (tab === "my-posts") { if (!user) { setTab("lost"); return; } params.append("mine","true"); }
      else params.append("type", tab);
      if (filterCategory) params.append("category", filterCategory);
      if (filterLocation) params.append("location", filterLocation);
      const res = await api.get(`/api/lostfound?${params}`);
      setItems(res.data);
    } catch { showToast("Failed to load","error"); }
    finally { setLoading(false); }
  };

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const requireAuth = () => {
    if (!user) { showToast("Please login","error"); setTimeout(() => navigate("/login"), 900); return false; }
    return true;
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!requireAuth()) return;
    if (!form.title || !form.category || !form.location) return showToast("Fill required fields","error");
    const fd = new FormData();
    Object.entries(form).forEach(([k,v]) => fd.append(k,v));
    files.forEach(f => fd.append("images",f));
    try {
      setUploading(true);
      const res = await api.post("/api/lostfound", fd, { headers:{ "Content-Type":"multipart/form-data" } });
      setItems(p => [res.data,...p]);
      setShowPost(false);
      setForm({ type:"lost",title:"",description:"",category:"",location:"",date:"",contactInfo:"",reward:"" });
      setFiles([]); setPreviews([]);
      showToast(form.type==="lost" ? "Lost item posted!" : "Found item posted!");
    } catch (err) { showToast(err.response?.data?.message || "Failed","error"); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!requireAuth()) return;
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.delete(`/api/lostfound/${id}`);
      setItems(p => p.filter(i => i._id !== id));
      setSelected(null);
      showToast("Deleted!");
    } catch { showToast("Failed","error"); }
  };

  const markResolved = async (id) => {
    if (!requireAuth()) return;
    try {
      await api.patch(`/api/lostfound/${id}/resolve`);
      setItems(p => p.map(i => i._id===id ? {...i,resolved:true} : i));
      setSelected(s => s ? {...s,resolved:true} : s);
      showToast("Marked as resolved!");
    } catch { showToast("Failed","error"); }
  };

  const handleImageSelect = (e) => {
    const sel = Array.from(e.target.files||[]);
    setFiles(sel); setPreviews(sel.map(f => URL.createObjectURL(f)));
  };

  const filtered = items.filter(i =>
    !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.description?.toLowerCase().includes(search.toLowerCase())
  );
  const isOwner = (item) => user && (item.postedBy?._id===user?._id || item.postedBy===user?._id);

  const accentColor = tab==="found" ? "#16a34a" : "#dc2626";

  return (
    <div style={S.page}>
      <Toast toast={toast} />

      {/* Detail Modal */}
      {selected && (
        <div style={S.overlay} onClick={() => setSelected(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalBody}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10, marginBottom:14 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:6 }}>
                    <span style={selected.type==="lost" ? S.lostPill : S.foundPill}>{selected.type==="lost" ? "LOST" : "FOUND"}</span>
                    {selected.resolved && <span style={S.resPill}>Resolved</span>}
                    {selected.reward && <span style={S.rewPill}>₹{selected.reward} reward</span>}
                  </div>
                  <div style={{ fontSize:17, fontWeight:800 }}>{selected.title}</div>
                </div>
                <button style={S.closeBtn} onClick={() => setSelected(null)}>✕</button>
              </div>

              {selected.images?.length > 0 && (
                <div style={{ display:"flex", gap:8, marginBottom:14, overflowX:"auto" }}>
                  {selected.images.map((img,i) => <img key={i} src={img} alt="" style={{ width:110, height:90, objectFit:"cover", borderRadius:10, flexShrink:0 }} />)}
                </div>
              )}

              {selected.description && <p style={{ fontSize:13, color:"#6b6860", marginBottom:14, lineHeight:1.6 }}>{selected.description}</p>}

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
                {[
                  { l:"Category", v:selected.category },
                  { l:"Location", v:`📍 ${selected.location}` },
                  selected.date ? { l: selected.type==="lost" ? "Lost on" : "Found on", v: new Date(selected.date).toLocaleDateString() } : null,
                  { l:"Posted", v:timeAgo(selected.createdAt) },
                ].filter(Boolean).map(({ l,v }) => (
                  <div key={l} style={{ background:"#f5f4f0", borderRadius:10, padding:"10px 12px" }}>
                    <div style={{ fontSize:10, color:"#9b9890", fontWeight:700, textTransform:"uppercase", marginBottom:3 }}>{l}</div>
                    <div style={{ fontSize:13, fontWeight:600 }}>{v}</div>
                  </div>
                ))}
              </div>

              {selected.contactInfo && (
                <div style={{ background:"#f5f4f0", borderRadius:10, padding:"10px 12px", marginBottom:14 }}>
                  <div style={{ fontSize:10, color:"#9b9890", fontWeight:700, textTransform:"uppercase", marginBottom:3 }}>Contact</div>
                  <div style={{ fontSize:13 }}>{selected.contactInfo}</div>
                </div>
              )}

              <div style={{ display:"flex", alignItems:"center", gap:8, paddingBottom:14, marginBottom:14, borderBottom:"1px solid #f0ede8" }}>
                <div style={{ width:26, height:26, borderRadius:"50%", background:"#e5e3dc", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#6b6860" }}>
                  {selected.postedBy?.name?.charAt(0)}
                </div>
                <span style={{ fontSize:12, color:"#9b9890" }}>by <strong style={{ color:"#1a1a18" }}>{selected.postedBy?.name}</strong></span>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {!isOwner(selected) && (
                  <button style={S.primaryBtn("#1a1a18")} onClick={() => { if(!requireAuth()) return; navigate(`/Chat/${selected.postedBy?._id}`); }}>
                    💬 {user ? `Message ${selected.postedBy?.name}` : "Login to Message"}
                  </button>
                )}
                {isOwner(selected) && !selected.resolved && (
                  <button style={S.primaryBtn("#16a34a")} onClick={() => markResolved(selected._id)}>Mark as Resolved</button>
                )}
                {isOwner(selected) && (
                  <button style={S.dangerBtn} onClick={() => handleDelete(selected._id)}>Delete Post</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Modal */}
      {showPost && (
        <div style={S.overlay} onClick={() => { setShowPost(false); setFiles([]); setPreviews([]); }}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalBody}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <div style={{ fontSize:15, fontWeight:800 }}>Post Item</div>
                <button style={S.closeBtn} onClick={() => { setShowPost(false); setFiles([]); setPreviews([]); }}>✕</button>
              </div>

              <div style={{ display:"flex", background:"#f0ede8", borderRadius:10, padding:3, marginBottom:14, gap:2 }}>
                {["lost","found"].map(t => (
                  <button key={t} onClick={() => setForm({...form,type:t})} style={{
                    flex:1, padding:"7px", borderRadius:8, fontSize:12, fontWeight:700, border:"none", cursor:"pointer",
                    background: form.type===t ? (t==="lost" ? "#dc2626" : "#16a34a") : "transparent",
                    color: form.type===t ? "#fff" : "#9b9890",
                  }}>
                    {t==="lost" ? "I Lost Something" : "I Found Something"}
                  </button>
                ))}
              </div>

              <form onSubmit={handlePost} style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <input style={S.input} placeholder="Item name *" required value={form.title} onChange={e => setForm({...form,title:e.target.value})} />
                <textarea style={{...S.textarea, minHeight:72}} placeholder="Description — color, brand, identifying details..." value={form.description} onChange={e => setForm({...form,description:e.target.value})} rows={3} />

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <select style={S.select} required value={form.category} onChange={e => setForm({...form,category:e.target.value})}>
                    <option value="">Category *</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select style={S.select} required value={form.location} onChange={e => setForm({...form,location:e.target.value})}>
                    <option value="">Location *</option>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <input style={S.input} type="date" value={form.date} onChange={e => setForm({...form,date:e.target.value})} />
                  {form.type==="lost" && (
                    <div style={{ position:"relative" }}>
                      <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#9b9890", fontSize:13 }}>₹</span>
                      <input style={{...S.input, paddingLeft:24}} type="number" placeholder="Reward" value={form.reward} onChange={e => setForm({...form,reward:e.target.value})} />
                    </div>
                  )}
                </div>

                <input style={S.input} placeholder="Contact info (phone/email)" value={form.contactInfo} onChange={e => setForm({...form,contactInfo:e.target.value})} />

                <label style={{ cursor:"pointer" }}>
                  <div style={{ border:"1.5px dashed #e5e3dc", borderRadius:10, padding:"12px", textAlign:"center", background: previews.length>0 ? "#f5f4f0" : "#fff" }}>
                    {previews.length > 0 ? (
                      <div style={{ display:"flex", gap:6, overflowX:"auto" }}>
                        {previews.map((src,i) => <img key={i} src={src} alt="" style={{ width:54, height:54, objectFit:"cover", borderRadius:7, flexShrink:0 }} />)}
                      </div>
                    ) : <span style={{ fontSize:12, color:"#9b9890" }}>📷 Add photos (optional)</span>}
                  </div>
                  <input type="file" accept="image/*" multiple onChange={handleImageSelect} style={{ display:"none" }} />
                </label>

                <div style={{ display:"flex", gap:8 }}>
                  <button type="submit" disabled={uploading} style={S.primaryBtn(form.type==="lost" ? "#dc2626" : "#16a34a")}>
                    {uploading ? "Posting..." : `Post ${form.type==="lost" ? "Lost" : "Found"} Item`}
                  </button>
                  <button type="button" onClick={() => { setShowPost(false); setFiles([]); setPreviews([]); }} style={{ padding:"11px 16px", borderRadius:12, border:"1px solid #e5e3dc", background:"#f5f4f0", color:"#6b6860", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                    Cancel
                  </button>
                </div>
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
            <div style={S.hdrTitle}>Lost & Found</div>
            <div style={S.hdrSub}>Help reunite people with their belongings</div>
          </div>
          <button style={S.postBtn("#1a1a18")} onClick={() => { if(!requireAuth()) return; setShowPost(true); }}>+ Post</button>
        </div>

        {/* Tabs */}
        <div style={S.tabBar}>
          {[
            { key:"lost",     label:"Lost",     color:"#dc2626" },
            { key:"found",    label:"Found",    color:"#16a34a" },
            ...(user ? [{ key:"my-posts", label:"My Posts", color:"#1a1a18" }] : []),
          ].map(t => (
            <button key={t.key} style={S.tab(tab===t.key, t.color)} onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>

        {/* Search + Filters */}
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:14 }}>
          <input style={S.input} placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
          <div style={{ display:"flex", gap:7 }}>
            <select style={{...S.select, flex:1}} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select style={{...S.select, flex:1}} value={filterLocation} onChange={e => setFilterLocation(e.target.value)}>
              <option value="">All Locations</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            {(filterCategory||filterLocation||search) && (
              <button onClick={() => { setFilterCategory(""); setFilterLocation(""); setSearch(""); }}
                style={{ padding:"8px 12px", borderRadius:10, border:"1px solid #e5e3dc", background:"#f5f4f0", color:"#9b9890", fontSize:12, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        {tab !== "my-posts" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
            {[
              { v: items.filter(i=>i.type==="lost"&&!i.resolved).length,  l:"Still Lost",    c:"#dc2626", bg:"#fee2e2" },
              { v: items.filter(i=>i.type==="found"&&!i.resolved).length, l:"Found Items",   c:"#16a34a", bg:"#dcfce7" },
              { v: items.filter(i=>i.resolved).length,                    l:"Reunited",      c:"#6b6860", bg:"#f0ede8" },
            ].map(({ v,l,c,bg }) => (
              <div key={l} style={{ background:bg, borderRadius:12, padding:"12px 8px", textAlign:"center" }}>
                <div style={{ fontSize:22, fontWeight:800, fontFamily:"monospace", color:c, lineHeight:1 }}>{v}</div>
                <div style={{ fontSize:10, fontWeight:700, color:c, marginTop:3, textTransform:"uppercase", letterSpacing:".04em", opacity:.75 }}>{l}</div>
              </div>
            ))}
          </div>
        )}

        {/* Guest nudge */}
        {!user && (
          <div style={{ background:"#f5f4f0", border:"1px solid #e5e3dc", borderRadius:12, padding:"11px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:14 }}>
            <span style={{ fontSize:12, color:"#6b6860" }}>Login to post items or contact finders</span>
            <button onClick={() => navigate("/login")} style={{ padding:"6px 12px", borderRadius:8, border:"none", background:"#1a1a18", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer" }}>Login →</button>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div style={{ textAlign:"center", padding:"48px 0", color:"#9b9890", fontSize:13 }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"48px 0", background:"#fff", border:"1px solid #e5e3dc", borderRadius:14 }}>
            <div style={{ fontSize:36, marginBottom:8 }}>{tab==="lost"?"😢":tab==="found"?"✅":"📋"}</div>
            <div style={{ fontWeight:700, fontSize:14 }}>{tab==="lost"?"No lost items":"No found items"}</div>
          </div>
        ) : (
          <div>
            {filtered.map(item => (
              <div key={item._id} style={{ ...S.card, opacity: item.resolved ? .55 : 1 }} onClick={() => setSelected(item)}>
                <div style={{ display:"flex" }}>
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt="" style={{ width:80, flexShrink:0, objectFit:"cover", minHeight:90 }} />
                  ) : (
                    <div style={{ width:70, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, background: item.type==="lost" ? "#fff0f0" : "#f0fdf4" }}>
                      {item.category==="Electronics"?"📱":item.category==="Books"?"📚":item.category==="Wallet"?"👛":item.category==="Keys"?"🔑":item.category==="Bag"?"🎒":"📦"}
                    </div>
                  )}
                  <div style={{ flex:1, padding:"11px 13px", minWidth:0 }}>
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:5 }}>
                      <span style={item.type==="lost" ? S.lostPill : S.foundPill}>{item.type==="lost"?"LOST":"FOUND"}</span>
                      {item.reward && <span style={S.rewPill}>₹{item.reward}</span>}
                      {item.resolved && <span style={S.resPill}>Resolved</span>}
                    </div>
                    <div style={{ fontSize:13, fontWeight:700, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.title}</div>
                    <div style={{ fontSize:12, color:"#9b9890", marginBottom:6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.description}</div>
                    <div style={{ display:"flex", gap:10, fontSize:11, color:"#b5b3ac" }}>
                      <span>📍 {item.location}</span>
                      <span>{item.category}</span>
                      <span style={{ marginLeft:"auto" }}>{timeAgo(item.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}