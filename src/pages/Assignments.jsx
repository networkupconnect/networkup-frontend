import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const SUBJECTS = [
  "Mathematics","Physics","Chemistry","Biology",
  "Computer Science","English","History","Economics",
  "Electronics","Mechanical","Civil","Other"
];

function timeLeft(deadline) {
  const diff = new Date(deadline) - new Date();
  if (diff <= 0) return { text:"Expired", color:"#dc2626", urgent:true };
  const days = Math.floor(diff / 86400000);
  const hrs  = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return { text:`${days}d ${hrs}h left`, color: days<=1 ? "#d97706" : "#16a34a", urgent: days<=1 };
  return { text:`${hrs}h left`, color:"#dc2626", urgent:true };
}

const STATUS_PILL = {
  open:      { bg:"#dcfce7", color:"#16a34a" },
  assigned:  { bg:"#dbeafe", color:"#2563eb" },
  completed: { bg:"#f0ede8", color:"#6b6860" },
  cancelled: { bg:"#fee2e2", color:"#dc2626" },
};

const S = {
  page:    { minHeight:"100vh", background:"#fafaf9", fontFamily:"'DM Sans',system-ui,sans-serif", color:"#1a1a18" },
  wrap:    { maxWidth:600, margin:"0 auto", padding:"20px 16px 88px" },
  hdr:     { display:"flex", alignItems:"center", gap:12, marginBottom:20 },
  backBtn: { width:36, height:36, borderRadius:10, border:"1px solid #e5e3dc", background:"#fff", cursor:"pointer", fontSize:18, color:"#6b6860", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  input:   { width:"100%", padding:"9px 12px", borderRadius:10, border:"1px solid #e5e3dc", background:"#fff", fontSize:13, fontFamily:"inherit", color:"#1a1a18", outline:"none" },
  textarea:{ width:"100%", padding:"9px 12px", borderRadius:10, border:"1px solid #e5e3dc", background:"#fff", fontSize:13, fontFamily:"inherit", color:"#1a1a18", outline:"none", resize:"none" },
  select:  { width:"100%", padding:"9px 12px", borderRadius:10, border:"1px solid #e5e3dc", background:"#fff", fontSize:12, fontFamily:"inherit", color:"#6b6860", outline:"none" },
  overlay: { position:"fixed", inset:0, zIndex:50, background:"rgba(0,0,0,.15)", backdropFilter:"blur(4px)", display:"flex", alignItems:"flex-end", justifyContent:"center", padding:16 },
  modal:   { background:"#fff", borderRadius:"20px 20px 16px 16px", width:"100%", maxWidth:520, maxHeight:"92vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,.12)" },
  closeBtn:{ width:30, height:30, borderRadius:8, border:"1px solid #e5e3dc", background:"#f5f4f0", cursor:"pointer", color:"#9b9890", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 },
  tabBar:  { display:"flex", background:"#f0ede8", borderRadius:12, padding:3, marginBottom:14, gap:2 },
  tab:     (active) => ({ flex:1, padding:"7px 4px", borderRadius:9, fontSize:11, fontWeight:700, border:"none", cursor:"pointer", background: active ? "#4f46e5" : "transparent", color: active ? "#fff" : "#9b9890" }),
  pill:    (status) => ({ fontSize:10, padding:"2px 8px", borderRadius:100, fontWeight:700, background: STATUS_PILL[status]?.bg||"#f0ede8", color: STATUS_PILL[status]?.color||"#6b6860" }),
  primaryBtn: (color="#4f46e5") => ({ width:"100%", padding:"11px", borderRadius:12, border:"none", background:color, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }),
  ghostBtn:{ width:"100%", padding:"11px", borderRadius:12, border:"1px solid #e5e3dc", background:"#f5f4f0", color:"#6b6860", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" },
};

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{ position:"fixed", top:16, right:16, zIndex:99, padding:"9px 16px", borderRadius:12, background: toast.type==="error" ? "#dc2626" : "#16a34a", color:"#fff", fontSize:12, fontWeight:700, boxShadow:"0 4px 20px rgba(0,0,0,.12)" }}>
      {toast.msg}
    </div>
  );
}

export default function Assignments() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]               = useState("browse");
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState(null);
  const [showPost, setShowPost]     = useState(false);
  const [selected, setSelected]     = useState(null);
  const [uploading, setUploading]   = useState(false);
  const [files, setFiles]           = useState([]);
  const [filterSubject, setFilterSubject] = useState("");
  const [filterSort, setFilterSort]       = useState("newest");
  const [form, setForm] = useState({ title:"", description:"", subject:"", budget:"", deadline:"", tags:"" });
  const [bidAmount, setBidAmount]   = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [bidding, setBidding]       = useState(false);

  useEffect(() => { fetchData(); }, [tab, filterSubject, filterSort]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let url = "/api/assignments";
      if (tab==="my-posts") url = "/api/assignments/my-posts";
      else if (tab==="my-work") url = "/api/assignments/my-work";
      else url = `/api/assignments?status=open&sort=${filterSort}${filterSubject ? `&subject=${filterSubject}` : ""}`;
      const res = await api.get(url);
      setAssignments(res.data);
    } catch { showToast("Failed to load","error"); }
    finally { setLoading(false); }
  };

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!form.title||!form.subject||!form.budget||!form.deadline) return showToast("Fill all required fields","error");
    const fd = new FormData();
    Object.entries(form).forEach(([k,v]) => { if(k!=="tags") fd.append(k,v); });
    if (form.tags) fd.append("tags", form.tags);
    files.forEach(f => fd.append("attachments",f));
    try {
      setUploading(true);
      const res = await api.post("/api/assignments", fd, { headers:{"Content-Type":"multipart/form-data"} });
      setAssignments(p => [res.data,...p]);
      setShowPost(false);
      setForm({ title:"",description:"",subject:"",budget:"",deadline:"",tags:"" });
      setFiles([]);
      showToast("Assignment posted!");
    } catch (err) { showToast(err.response?.data?.message||"Failed","error"); }
    finally { setUploading(false); }
  };

  const handleBid = async () => {
    if (!bidAmount) return showToast("Enter bid amount","error");
    try {
      setBidding(true);
      const res = await api.post(`/api/assignments/${selected._id}/bid`, { amount:Number(bidAmount), message:bidMessage });
      setBidAmount(""); setBidMessage("");
      showToast("Bid placed!");
      setSelected(null);
      setAssignments(prev => prev.map(a => a._id===res.data._id ? res.data : a));
    } catch (err) { showToast(err.response?.data?.message||"Failed","error"); }
    finally { setBidding(false); }
  };

  const handleAccept = async (assignmentId, userId) => {
    try {
      await api.post(`/api/assignments/${assignmentId}/accept/${userId}`);
      showToast("Bid accepted!");
      setSelected(null); fetchData();
    } catch { showToast("Failed","error"); }
  };

  const handleComplete = async (id) => {
    try {
      await api.patch(`/api/assignments/${id}/complete`);
      showToast("Marked as completed!");
      setSelected(null); fetchData();
    } catch { showToast("Failed","error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    try {
      await api.delete(`/api/assignments/${id}`);
      setAssignments(p => p.filter(a => a._id!==id));
      showToast("Deleted!");
    } catch { showToast("Failed","error"); }
  };

  const openDetail = async (a) => {
    try { const res = await api.get(`/api/assignments/${a._id}`); setSelected(res.data); }
    catch { setSelected(a); }
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const rawExt = url.split(".").pop().split("?")[0].toLowerCase();
      const imageExts = ["png","jpg","jpeg","webp","gif"];
      const ext = imageExts.includes(rawExt) ? rawExt : "pdf";
      const fixedBlob = ext==="pdf" ? new Blob([blob],{type:"application/pdf"}) : blob;
      const blobUrl = window.URL.createObjectURL(fixedBlob);
      const a = document.createElement("a");
      a.href = blobUrl; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch { showToast("Download failed","error"); }
  };

  const myBid = selected?.bids?.find(b => b.userId?._id===user?._id||b.userId===user?._id);
  const isOwner = selected?.postedBy?._id===user?._id||selected?.postedBy===user?._id;

  if (!user) return (
    <div style={{ ...S.page, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#fff", border:"1px solid #e5e3dc", borderRadius:20, padding:40, textAlign:"center", maxWidth:320 }}>
        <div style={{ fontSize:40, marginBottom:12 }}>🔒</div>
        <div style={{ fontSize:16, fontWeight:800, marginBottom:16 }}>Login Required</div>
        <button onClick={() => navigate("/login")} style={{ ...S.primaryBtn(), width:"100%" }}>Login →</button>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <Toast toast={toast} />

      {/* Detail Modal */}
      {selected && (
        <div style={S.overlay} onClick={() => setSelected(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={{ padding:20 }}>
              {/* Header */}
              <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:14 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:6 }}>
                    <span style={S.pill(selected.status)}>{selected.status}</span>
                    <span style={{ fontSize:10, padding:"2px 8px", borderRadius:100, background:"#f0ede8", color:"#6b6860" }}>{selected.subject}</span>
                  </div>
                  <div style={{ fontSize:17, fontWeight:800 }}>{selected.title}</div>
                </div>
                <button style={S.closeBtn} onClick={() => setSelected(null)}>✕</button>
              </div>

              <p style={{ fontSize:13, color:"#6b6860", lineHeight:1.65, marginBottom:14 }}>{selected.description}</p>

              {selected.tags?.length > 0 && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:14 }}>
                  {selected.tags.map((t,i) => <span key={i} style={{ fontSize:10, padding:"2px 8px", borderRadius:100, background:"#eef2ff", color:"#4f46e5" }}>#{t}</span>)}
                </div>
              )}

              {/* Stats */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
                <div style={{ background:"#f5f4f0", borderRadius:12, padding:"12px 8px", textAlign:"center" }}>
                  <div style={{ fontSize:18, fontWeight:800, color:"#4f46e5", fontFamily:"monospace" }}>₹{selected.budget}</div>
                  <div style={{ fontSize:10, color:"#9b9890", marginTop:2 }}>Budget</div>
                </div>
                <div style={{ background:"#f5f4f0", borderRadius:12, padding:"12px 8px", textAlign:"center" }}>
                  {(() => { const t = timeLeft(selected.deadline); return (<><div style={{ fontSize:12, fontWeight:800, color:t.color }}>{t.text}</div><div style={{ fontSize:10, color:"#9b9890", marginTop:2 }}>Deadline</div></>); })()}
                </div>
                <div style={{ background:"#f5f4f0", borderRadius:12, padding:"12px 8px", textAlign:"center" }}>
                  <div style={{ fontSize:18, fontWeight:800 }}>{selected.bids?.length||0}</div>
                  <div style={{ fontSize:10, color:"#9b9890", marginTop:2 }}>Bids</div>
                </div>
              </div>

              {/* Attachments */}
              {selected.attachments?.length > 0 && (
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"#9b9890", textTransform:"uppercase", letterSpacing:".05em", marginBottom:7 }}>Attachments</div>
                  <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                    {selected.attachments.map((url,i) => {
                      const rawExt = url.split(".").pop().split("?")[0].toLowerCase();
                      const ext = ["png","jpg","jpeg","webp","gif"].includes(rawExt) ? rawExt : "pdf";
                      return (
                        <button key={i} onClick={() => handleDownload(url,`attachment_${i+1}.${ext}`)}
                          style={{ padding:"6px 12px", borderRadius:8, border:"1px solid #e5e3dc", background:"#f5f4f0", color:"#4f46e5", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
                          📎 File {i+1} (.{ext})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Posted by */}
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, paddingBottom:14, borderBottom:"1px solid #f0ede8" }}>
                {selected.postedBy?.profileImage ? (
                  <img src={selected.postedBy.profileImage} alt="" style={{ width:26, height:26, borderRadius:"50%", objectFit:"cover" }} />
                ) : (
                  <div style={{ width:26, height:26, borderRadius:"50%", background:"#e5e3dc", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#6b6860" }}>{selected.postedBy?.name?.charAt(0)}</div>
                )}
                <span style={{ fontSize:12, color:"#9b9890" }}>by <strong style={{ color:"#1a1a18" }}>{selected.postedBy?.name}</strong></span>
              </div>

              {/* Bids — owner view */}
              {isOwner && selected.bids?.length > 0 && (
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"#9b9890", textTransform:"uppercase", letterSpacing:".05em", marginBottom:8 }}>Bids ({selected.bids.length})</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                    {selected.bids.map((bid,i) => (
                      <div key={i} style={{ background:"#f5f4f0", borderRadius:12, padding:"11px 13px", display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:30, height:30, borderRadius:"50%", background:"#e5e3dc", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#6b6860", flexShrink:0 }}>{bid.userId?.name?.charAt(0)||"?"}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:600 }}>{bid.userId?.name}</div>
                          {bid.message && <div style={{ fontSize:11, color:"#9b9890", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{bid.message}</div>}
                        </div>
                        <div style={{ textAlign:"right", flexShrink:0 }}>
                          <div style={{ fontSize:14, fontWeight:800, color:"#4f46e5", fontFamily:"monospace" }}>₹{bid.amount}</div>
                          {selected.status==="open" && (
                            <button onClick={() => handleAccept(selected._id, bid.userId?._id)} style={{ marginTop:4, padding:"3px 10px", borderRadius:7, border:"1px solid #bbf7d0", background:"#dcfce7", color:"#16a34a", fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                              Accept
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Owner actions */}
              {isOwner && selected.status==="assigned" && (
                <button style={{ ...S.primaryBtn("#16a34a"), marginBottom:8 }} onClick={() => handleComplete(selected._id)}>
                  Mark as Completed
                </button>
              )}

              {/* Bid form */}
              {!isOwner && selected.status==="open" && (
                <div style={{ background:"#f5f4f0", borderRadius:14, padding:"14px" }}>
                  <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>{myBid ? `Your bid: ₹${myBid.amount} — Update` : "Place a Bid"}</div>
                  <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                    <div style={{ position:"relative", flex:1 }}>
                      <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#9b9890", fontSize:13 }}>₹</span>
                      <input type="number" placeholder="Your price" value={bidAmount} onChange={e => setBidAmount(e.target.value)}
                        style={{ ...S.input, paddingLeft:24 }} />
                    </div>
                  </div>
                  <textarea placeholder="Why should they pick you? (optional)" rows={2} value={bidMessage} onChange={e => setBidMessage(e.target.value)}
                    style={{ ...S.textarea, marginBottom:10 }} />
                  <button onClick={handleBid} disabled={bidding} style={S.primaryBtn()}>
                    {bidding ? "Placing…" : myBid ? "Update Bid" : "Place Bid"}
                  </button>
                </div>
              )}

              {/* Assigned info */}
              {selected.status==="assigned" && selected.assignedTo && (
                <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:12, padding:"12px", display:"flex", alignItems:"center", gap:10, marginTop:10 }}>
                  <div style={{ width:30, height:30, borderRadius:"50%", background:"#dbeafe", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#2563eb" }}>{selected.assignedTo?.name?.charAt(0)}</div>
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, color:"#2563eb", textTransform:"uppercase", letterSpacing:".04em" }}>Assigned to</div>
                    <div style={{ fontSize:13, fontWeight:600 }}>{selected.assignedTo?.name}</div>
                    <div style={{ fontSize:11, color:"#2563eb" }}>₹{selected.acceptedBid}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post Modal */}
      {showPost && (
        <div style={S.overlay} onClick={() => setShowPost(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={{ padding:20 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <div style={{ fontSize:15, fontWeight:800 }}>Post Assignment</div>
                <button style={S.closeBtn} onClick={() => setShowPost(false)}>✕</button>
              </div>
              <form onSubmit={handlePost} style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <input style={S.input} placeholder="Title *" required value={form.title} onChange={e => setForm({...form,title:e.target.value})} />
                <textarea style={{...S.textarea,minHeight:80}} placeholder="Describe your assignment in detail *" rows={3} required value={form.description} onChange={e => setForm({...form,description:e.target.value})} />
                <select style={S.select} required value={form.subject} onChange={e => setForm({...form,subject:e.target.value})}>
                  <option value="">Select Subject *</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <div style={{ position:"relative" }}>
                    <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#9b9890", fontSize:13 }}>₹</span>
                    <input style={{...S.input,paddingLeft:22}} type="number" placeholder="Budget *" required value={form.budget} onChange={e => setForm({...form,budget:e.target.value})} />
                  </div>
                  <div>
                    <input style={S.input} type="datetime-local" required value={form.deadline} onChange={e => setForm({...form,deadline:e.target.value})} />
                    <div style={{ fontSize:10, color:"#9b9890", marginTop:3 }}>Deadline *</div>
                  </div>
                </div>
                <input style={S.input} placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm({...form,tags:e.target.value})} />
                <label style={{ cursor:"pointer" }}>
                  <div style={{ border:"1.5px dashed #e5e3dc", borderRadius:10, padding:"12px", textAlign:"center", background: files.length>0 ? "#f5f4f0" : "#fff" }}>
                    {files.length > 0
                      ? <span style={{ fontSize:12, color:"#4f46e5", fontWeight:600 }}>📎 {files.length} file(s) selected</span>
                      : <span style={{ fontSize:12, color:"#9b9890" }}>📎 Attach files (optional)</span>
                    }
                  </div>
                  <input type="file" multiple accept="image/*,.pdf" onChange={e => setFiles(Array.from(e.target.files||[]))} style={{ display:"none" }} />
                </label>
                <div style={{ display:"flex", gap:8 }}>
                  <button type="submit" disabled={uploading} style={S.primaryBtn()}>
                    {uploading ? "Posting…" : "Post Assignment"}
                  </button>
                  <button type="button" onClick={() => setShowPost(false)} style={{ padding:"11px 16px", borderRadius:12, border:"1px solid #e5e3dc", background:"#f5f4f0", color:"#6b6860", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
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
            <div style={{ fontSize:18, fontWeight:800, letterSpacing:"-.3px" }}>Assignments</div>
            <div style={{ fontSize:11, color:"#9b9890", marginTop:1 }}>Post tasks, earn by helping others</div>
          </div>
          <button onClick={() => setShowPost(true)} style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#4f46e5", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>
            + Post
          </button>
        </div>

        {/* Tabs */}
        <div style={S.tabBar}>
          {[{ key:"browse",l:"Browse" },{ key:"my-posts",l:"My Posts" },{ key:"my-work",l:"My Work" }].map(t => (
            <button key={t.key} style={S.tab(tab===t.key)} onClick={() => setTab(t.key)}>{t.l}</button>
          ))}
        </div>

        {/* Filters */}
        {tab==="browse" && (
          <div style={{ display:"flex", gap:7, marginBottom:14, overflowX:"auto" }}>
            <select style={{...S.select, flex:"none"}} value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
              <option value="">All Subjects</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select style={{...S.select, flex:"none"}} value={filterSort} onChange={e => setFilterSort(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="budget_high">Highest Budget</option>
              <option value="budget_low">Lowest Budget</option>
              <option value="deadline">Deadline Soon</option>
            </select>
            <span style={{ fontSize:11, color:"#9b9890", alignSelf:"center", marginLeft:"auto", whiteSpace:"nowrap" }}>{assignments.length} found</span>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div style={{ textAlign:"center", padding:"48px 0", color:"#9b9890", fontSize:13 }}>Loading…</div>
        ) : assignments.length === 0 ? (
          <div style={{ textAlign:"center", padding:"48px", background:"#fff", border:"1px solid #e5e3dc", borderRadius:14 }}>
            <div style={{ fontSize:32, marginBottom:8 }}>📝</div>
            <div style={{ fontWeight:700, fontSize:14 }}>{tab==="browse"?"No open assignments":tab==="my-posts"?"Nothing posted yet":"No work taken yet"}</div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {assignments.map(a => {
              const tl = timeLeft(a.deadline);
              const isMyPost = a.postedBy?._id===user._id || a.postedBy===user._id;
              return (
                <div key={a._id} onClick={() => openDetail(a)} style={{ background:"#fff", border:"1px solid #e5e3dc", borderRadius:14, padding:"14px 16px", cursor:"pointer" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10, marginBottom:8 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:6 }}>
                        <span style={S.pill(a.status)}>{a.status}</span>
                        <span style={{ fontSize:10, padding:"2px 8px", borderRadius:100, background:"#f0ede8", color:"#6b6860" }}>{a.subject}</span>
                        {tl.urgent && <span style={{ fontSize:10, padding:"2px 8px", borderRadius:100, background:"#fee2e2", color:"#dc2626", fontWeight:600 }}>⚡ Urgent</span>}
                      </div>
                      <div style={{ fontSize:13, fontWeight:700, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{a.title}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:18, fontWeight:800, color:"#4f46e5", fontFamily:"monospace", lineHeight:1 }}>₹{a.budget}</div>
                      <div style={{ fontSize:10, color:"#9b9890", marginTop:2 }}>budget</div>
                    </div>
                  </div>

                  <p style={{ fontSize:12, color:"#9b9890", marginBottom:10, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{a.description}</p>

                  {a.tags?.length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:10 }}>
                      {a.tags.slice(0,3).map((t,i) => <span key={i} style={{ fontSize:10, padding:"2px 7px", borderRadius:100, background:"#eef2ff", color:"#4f46e5" }}>#{t}</span>)}
                    </div>
                  )}

                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:10, borderTop:"1px solid #f0ede8" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <div style={{ width:22, height:22, borderRadius:"50%", background:"#e5e3dc", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#6b6860" }}>{a.postedBy?.name?.charAt(0)}</div>
                      <span style={{ fontSize:11, color:"#9b9890" }}>{isMyPost ? "You" : a.postedBy?.name}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:11, fontWeight:600, color:tl.color }}>{tl.text}</span>
                      <span style={{ fontSize:11, color:"#9b9890" }}>{a.bids?.length||0} bids</span>
                      {isMyPost && a.status==="open" && (
                        <button onClick={e => { e.stopPropagation(); handleDelete(a._id); }} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:"#d1d0ca", padding:0 }}>🗑</button>
                      )}
                    </div>
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