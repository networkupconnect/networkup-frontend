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

const T = {
  page:     { minHeight:"100vh", background:"#fafaf9", fontFamily:"'DM Sans',system-ui,sans-serif", color:"#1a1a18", fontSize:14 },
  wrap:     { maxWidth:600, margin:"0 auto", padding:"20px 16px 88px" },
  hdr:      { display:"flex", alignItems:"center", gap:12, marginBottom:24 },
  backBtn:  { width:34, height:34, borderRadius:9, border:"1px solid #e5e3dc", background:"#fff", cursor:"pointer", fontSize:17, color:"#6b6860", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  tabBar:   { display:"flex", borderBottom:"1.5px solid #e5e3dc", marginBottom:18 },
  tab:      (a) => ({ padding:"8px 0", marginRight:22, fontSize:13, fontWeight:700, border:"none", background:"transparent", cursor:"pointer", color:a?"#1a1a18":"#9b9890", borderBottom:a?"2px solid #1a1a18":"2px solid transparent", marginBottom:"-1.5px", transition:"color .13s" }),
  tag:      (a) => ({ padding:"5px 12px", borderRadius:100, fontSize:11, fontWeight:600, border:"none", cursor:"pointer", background:a?"#1a1a18":"#f0ede8", color:a?"#fff":"#6b6860", transition:"all .13s" }),
  input:    { width:"100%", padding:"9px 12px", borderRadius:10, border:"1px solid #e5e3dc", background:"#fff", fontSize:13, fontFamily:"inherit", color:"#1a1a18", outline:"none", boxSizing:"border-box" },
  select:   { width:"100%", padding:"9px 12px", borderRadius:10, border:"1px solid #e5e3dc", background:"#fff", fontSize:12, fontFamily:"inherit", color:"#6b6860", outline:"none" },
  textarea: { width:"100%", padding:"9px 12px", borderRadius:10, border:"1px solid #e5e3dc", background:"#fff", fontSize:13, fontFamily:"inherit", color:"#1a1a18", outline:"none", resize:"none", boxSizing:"border-box" },
  btn:      { padding:"9px 16px", borderRadius:10, border:"none", background:"#1a1a18", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" },
  btnFull:  { width:"100%", padding:"11px", borderRadius:11, border:"none", background:"#1a1a18", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" },
  btnDanger:{ width:"100%", padding:"11px", borderRadius:11, border:"1px solid #e5e3dc", background:"#fff", color:"#dc2626", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" },
  overlay:  { position:"fixed", inset:0, zIndex:50, background:"rgba(0,0,0,.2)", backdropFilter:"blur(4px)", display:"flex", alignItems:"flex-end", justifyContent:"center", padding:16 },
  modal:    { background:"#fff", borderRadius:"18px 18px 0 0", width:"100%", maxWidth:520, maxHeight:"92vh", overflowY:"auto", boxShadow:"0 -8px 40px rgba(0,0,0,.1)" },
  closeBtn: { width:28, height:28, borderRadius:7, border:"1px solid #e5e3dc", background:"#f5f4f0", cursor:"pointer", color:"#9b9890", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0 },
  chip:     (inv) => ({ fontSize:10, padding:"2px 8px", borderRadius:100, fontWeight:700, background:inv?"#1a1a18":"#f0ede8", color:inv?"#fff":"#6b6860" }),
};

function Toast({ toast }) {
  if (!toast) return null;
  return <div style={{ position:"fixed", top:16, right:16, zIndex:99, padding:"9px 16px", borderRadius:11, background:"#1a1a18", color:"#fff", fontSize:12, fontWeight:700, boxShadow:"0 4px 20px rgba(0,0,0,.18)" }}>{toast.msg}</div>;
}

export default function LostFound() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tab,      setTab]      = useState("lost");
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState(null);
  const [showPost, setShowPost] = useState(false);
  const [selected, setSelected] = useState(null);
  const [uploading,setUploading]= useState(false);
  const [files,    setFiles]    = useState([]);
  const [previews, setPreviews] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLocation,  setFilterLocation] = useState("");
  const [search,   setSearch]   = useState("");
  const [form, setForm] = useState({ type:"lost", title:"", description:"", category:"", location:"", date:"", contactInfo:"", reward:"" });

  useEffect(() => { fetchItems(); }, [tab, filterCategory, filterLocation]);

  const fetchItems = async () => {
    if (tab === "my-posts" && !user) { setTab("lost"); return; }
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (tab === "my-posts") p.append("mine", "true");
      else p.append("type", tab);
      if (filterCategory) p.append("category", filterCategory);
      if (filterLocation)  p.append("location",  filterLocation);
      const res = await api.get(`/api/lostfound?${p}`);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      // 404 just means no posts yet — don't show error toast
      if (err?.response?.status !== 404) flash("Failed to load");
      setItems([]);
    } finally { setLoading(false); }
  };

  const flash = (msg) => { setToast({ msg }); setTimeout(() => setToast(null), 3000); };
  const requireAuth = () => { if (!user) { flash("Please login"); setTimeout(() => navigate("/login"), 900); return false; } return true; };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!requireAuth()) return;
    if (!form.title||!form.category||!form.location) return flash("Fill required fields");
    const fd = new FormData();
    Object.entries(form).forEach(([k,v]) => fd.append(k,v));
    files.forEach(f => fd.append("images",f));
    try {
      setUploading(true);
      const res = await api.post("/api/lostfound", fd, { headers:{ "Content-Type":"multipart/form-data" } });
      setItems(p => [res.data,...p]); setShowPost(false);
      setForm({ type:"lost",title:"",description:"",category:"",location:"",date:"",contactInfo:"",reward:"" });
      setFiles([]); setPreviews([]); flash("Posted!");
    } catch (err) { flash(err.response?.data?.message||"Failed"); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!requireAuth()||!window.confirm("Delete?")) return;
    try { await api.delete(`/api/lostfound/${id}`); setItems(p=>p.filter(i=>i._id!==id)); setSelected(null); flash("Deleted"); }
    catch { flash("Failed"); }
  };

  const markResolved = async (id) => {
    if (!requireAuth()) return;
    try { await api.patch(`/api/lostfound/${id}/resolve`); setItems(p=>p.map(i=>i._id===id?{...i,resolved:true}:i)); setSelected(s=>s?{...s,resolved:true}:s); flash("Resolved!"); }
    catch { flash("Failed"); }
  };

  const handleImageSelect = (e) => { const s=Array.from(e.target.files||[]); setFiles(s); setPreviews(s.map(f=>URL.createObjectURL(f))); };

  const filtered = items.filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.description?.toLowerCase().includes(search.toLowerCase()));
  const isOwner  = (item) => user && (item.postedBy?._id===user?._id || item.postedBy===user?._id);

  const TABS = [{ key:"lost",label:"Lost" },{ key:"found",label:"Found" }, ...(user?[{key:"my-posts",label:"My Posts"}]:[])];

  return (
    <div style={T.page}>
      <Toast toast={toast} />

      {/* Detail Modal */}
      {selected && (
        <div style={T.overlay} onClick={() => setSelected(null)}>
          <div style={T.modal} onClick={e=>e.stopPropagation()}>
            <div style={{ padding:20 }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:14 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:7 }}>
                    <span style={T.chip(selected.type==="found")}>{selected.type==="lost"?"LOST":"FOUND"}</span>
                    {selected.resolved && <span style={T.chip(false)}>Resolved</span>}
                    {selected.reward   && <span style={T.chip(false)}>₹{selected.reward} reward</span>}
                  </div>
                  <div style={{ fontSize:17, fontWeight:800 }}>{selected.title}</div>
                </div>
                <button style={T.closeBtn} onClick={()=>setSelected(null)}>✕</button>
              </div>

              {selected.images?.length>0 && (
                <div style={{ display:"flex", gap:8, marginBottom:14, overflowX:"auto" }}>
                  {selected.images.map((img,i)=><img key={i} src={img} alt="" style={{ width:108,height:86,objectFit:"cover",borderRadius:9,flexShrink:0 }}/>)}
                </div>
              )}

              {selected.description && <p style={{ fontSize:13,color:"#6b6860",marginBottom:14,lineHeight:1.65 }}>{selected.description}</p>}

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
                {[
                  { l:"Category", v:selected.category },
                  { l:"Location", v:selected.location },
                  selected.date?{ l:selected.type==="lost"?"Lost on":"Found on", v:new Date(selected.date).toLocaleDateString() }:null,
                  { l:"Posted", v:timeAgo(selected.createdAt) },
                ].filter(Boolean).map(({l,v})=>(
                  <div key={l} style={{ background:"#f5f4f0",borderRadius:10,padding:"10px 12px" }}>
                    <div style={{ fontSize:10,color:"#9b9890",fontWeight:700,textTransform:"uppercase",marginBottom:3 }}>{l}</div>
                    <div style={{ fontSize:13,fontWeight:600 }}>{v}</div>
                  </div>
                ))}
              </div>

              {selected.contactInfo && (
                <div style={{ background:"#f5f4f0",borderRadius:10,padding:"10px 12px",marginBottom:14 }}>
                  <div style={{ fontSize:10,color:"#9b9890",fontWeight:700,textTransform:"uppercase",marginBottom:3 }}>Contact</div>
                  <div style={{ fontSize:13 }}>{selected.contactInfo}</div>
                </div>
              )}

              <div style={{ display:"flex",alignItems:"center",gap:8,paddingBottom:14,marginBottom:14,borderBottom:"1px solid #f0ede8" }}>
                <div style={{ width:26,height:26,borderRadius:"50%",background:"#e5e3dc",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700 }}>{selected.postedBy?.name?.charAt(0)}</div>
                <span style={{ fontSize:12,color:"#9b9890" }}>by <strong style={{ color:"#1a1a18" }}>{selected.postedBy?.name}</strong></span>
              </div>

              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                {!isOwner(selected) && <button style={T.btnFull} onClick={()=>{if(!requireAuth())return; navigate(`/Chat/${selected.postedBy?._id}`);}}>
                  {user?`Message ${selected.postedBy?.name}`:"Login to Message"}
                </button>}
                {isOwner(selected)&&!selected.resolved && <button style={T.btnFull} onClick={()=>markResolved(selected._id)}>Mark as Resolved</button>}
                {isOwner(selected) && <button style={T.btnDanger} onClick={()=>handleDelete(selected._id)}>Delete Post</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Modal */}
      {showPost && (
        <div style={T.overlay} onClick={()=>{setShowPost(false);setFiles([]);setPreviews([]);}}>
          <div style={T.modal} onClick={e=>e.stopPropagation()}>
            <div style={{ padding:20 }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
                <div style={{ fontSize:15,fontWeight:800 }}>Post Item</div>
                <button style={T.closeBtn} onClick={()=>{setShowPost(false);setFiles([]);setPreviews([]);}} >✕</button>
              </div>

              {/* Lost / Found underline toggle */}
              <div style={{ display:"flex", borderBottom:"1.5px solid #e5e3dc", marginBottom:14 }}>
                {["lost","found"].map(t=>(
                  <button key={t} onClick={()=>setForm({...form,type:t})} style={{ padding:"7px 0", marginRight:20, fontSize:12, fontWeight:700, border:"none", background:"transparent", cursor:"pointer", color:form.type===t?"#1a1a18":"#9b9890", borderBottom:form.type===t?"2px solid #1a1a18":"2px solid transparent", marginBottom:"-1.5px" }}>
                    {t==="lost"?"I Lost Something":"I Found Something"}
                  </button>
                ))}
              </div>

              <form onSubmit={handlePost} style={{ display:"flex",flexDirection:"column",gap:10 }}>
                <input style={T.input} placeholder="Item name *" required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
                <textarea style={{...T.textarea,minHeight:70}} placeholder="Description — color, brand, details…" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} />
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                  <select style={T.select} required value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option value="">Category *</option>{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select>
                  <select style={T.select} required value={form.location}  onChange={e=>setForm({...form,location:e.target.value})}><option value="">Location *</option>{LOCATIONS.map(l=><option key={l} value={l}>{l}</option>)}</select>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                  <input style={T.input} type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
                  {form.type==="lost" && <div style={{ position:"relative" }}><span style={{ position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:"#9b9890",fontSize:13 }}>₹</span><input style={{...T.input,paddingLeft:22}} type="number" placeholder="Reward" value={form.reward} onChange={e=>setForm({...form,reward:e.target.value})}/></div>}
                </div>
                <input style={T.input} placeholder="Contact info" value={form.contactInfo} onChange={e=>setForm({...form,contactInfo:e.target.value})} />
                <label style={{ cursor:"pointer" }}>
                  <div style={{ border:"1.5px dashed #e5e3dc",borderRadius:10,padding:"12px",textAlign:"center",background:"#fafaf9" }}>
                    {previews.length>0
                      ? <div style={{ display:"flex",gap:6,overflowX:"auto" }}>{previews.map((s,i)=><img key={i} src={s} alt="" style={{ width:50,height:50,objectFit:"cover",borderRadius:6,flexShrink:0 }}/>)}</div>
                      : <span style={{ fontSize:12,color:"#9b9890" }}>📷 Add photos (optional)</span>}
                  </div>
                  <input type="file" accept="image/*" multiple onChange={handleImageSelect} style={{ display:"none" }} />
                </label>
                <div style={{ display:"flex",gap:8 }}>
                  <button type="submit" disabled={uploading} style={{...T.btnFull,opacity:uploading?.6:1}}>{uploading?"Posting…":`Post ${form.type==="lost"?"Lost":"Found"} Item`}</button>
                  <button type="button" onClick={()=>{setShowPost(false);setFiles([]);setPreviews([]);}} style={{ padding:"11px 16px",borderRadius:11,border:"1px solid #e5e3dc",background:"#f5f4f0",color:"#6b6860",fontSize:13,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap" }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div style={T.wrap}>
        {/* Header */}
        <div style={T.hdr}>
          <button style={T.backBtn} onClick={()=>navigate("/")}>‹</button>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:18,fontWeight:800,letterSpacing:"-.3px" }}>Lost & Found</div>
            <div style={{ fontSize:11,color:"#9b9890",marginTop:1 }}>Help reunite people with their belongings</div>
          </div>
          <button style={T.btn} onClick={()=>{if(!requireAuth())return;setShowPost(true);}}>+ Post</button>
        </div>

        {/* Underline tabs */}
        <div style={T.tabBar}>
          {TABS.map(t=><button key={t.key} style={T.tab(tab===t.key)} onClick={()=>setTab(t.key)}>{t.label}</button>)}
        </div>

        {/* Search + Filters */}
        <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:14 }}>
          <input style={T.input} placeholder="Search items…" value={search} onChange={e=>setSearch(e.target.value)} />
          <div style={{ display:"flex",gap:7 }}>
            <select style={{...T.select,flex:1}} value={filterCategory} onChange={e=>setFilterCategory(e.target.value)}><option value="">All Categories</option>{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select>
            <select style={{...T.select,flex:1}} value={filterLocation}  onChange={e=>setFilterLocation(e.target.value)}><option value="">All Locations</option>{LOCATIONS.map(l=><option key={l} value={l}>{l}</option>)}</select>
            {(filterCategory||filterLocation||search)&&<button onClick={()=>{setFilterCategory("");setFilterLocation("");setSearch("");}} style={{ padding:"8px 12px",borderRadius:9,border:"none",background:"#f0ede8",color:"#6b6860",fontSize:11,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap" }}>Clear</button>}
          </div>
        </div>

        {/* Stats */}
        {tab!=="my-posts"&&(
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14 }}>
            {[{ v:items.filter(i=>i.type==="lost"&&!i.resolved).length,l:"Still Lost" },{ v:items.filter(i=>i.type==="found"&&!i.resolved).length,l:"Found" },{ v:items.filter(i=>i.resolved).length,l:"Reunited" }].map(({v,l})=>(
              <div key={l} style={{ background:"#f5f4f0",borderRadius:11,padding:"12px 8px",textAlign:"center" }}>
                <div style={{ fontSize:22,fontWeight:800,fontFamily:"monospace",lineHeight:1 }}>{v}</div>
                <div style={{ fontSize:10,fontWeight:600,color:"#9b9890",marginTop:3,textTransform:"uppercase",letterSpacing:".04em" }}>{l}</div>
              </div>
            ))}
          </div>
        )}

        {!user&&(
          <div style={{ background:"#f5f4f0",borderRadius:11,padding:"11px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:14 }}>
            <span style={{ fontSize:12,color:"#6b6860" }}>Login to post or contact finders</span>
            <button onClick={()=>navigate("/login")} style={{ padding:"6px 12px",borderRadius:8,border:"none",background:"#1a1a18",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer" }}>Login →</button>
          </div>
        )}

        {/* List */}
        {loading ? <div style={{ textAlign:"center",padding:"48px 0",color:"#9b9890" }}>Loading…</div>
        : filtered.length===0 ? (
          <div style={{ textAlign:"center",padding:"48px 0",background:"#fff",border:"1px solid #e5e3dc",borderRadius:13 }}>
            <div style={{ fontSize:32,marginBottom:8 }}>{tab==="lost"?"😢":"✅"}</div>
            <div style={{ fontWeight:700 }}>Nothing here yet</div>
          </div>
        ) : (
          <div>
            {filtered.map(item=>(
              <div key={item._id} style={{ background:"#fff",border:"1px solid #e5e3dc",borderRadius:13,marginBottom:10,overflow:"hidden",cursor:"pointer",opacity:item.resolved?.55:1 }} onClick={()=>setSelected(item)}>
                <div style={{ display:"flex" }}>
                  {item.images?.[0]
                    ? <img src={item.images[0]} alt="" style={{ width:76,flexShrink:0,objectFit:"cover",minHeight:90 }}/>
                    : <div style={{ width:66,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,background:"#f5f4f0" }}>{item.category==="Electronics"?"📱":item.category==="Books"?"📚":item.category==="Wallet"?"👛":item.category==="Keys"?"🔑":item.category==="Bag"?"🎒":"📦"}</div>
                  }
                  <div style={{ flex:1,padding:"11px 13px",minWidth:0 }}>
                    <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:5 }}>
                      <span style={T.chip(item.type==="found")}>{item.type==="lost"?"LOST":"FOUND"}</span>
                      {item.reward&&<span style={T.chip(false)}>₹{item.reward}</span>}
                      {item.resolved&&<span style={T.chip(false)}>Resolved</span>}
                    </div>
                    <div style={{ fontSize:13,fontWeight:700,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{item.title}</div>
                    <div style={{ fontSize:12,color:"#9b9890",marginBottom:6,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{item.description}</div>
                    <div style={{ display:"flex",gap:10,fontSize:11,color:"#b5b3ac" }}>
                      <span>{item.location}</span><span>{item.category}</span><span style={{ marginLeft:"auto" }}>{timeAgo(item.createdAt)}</span>
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