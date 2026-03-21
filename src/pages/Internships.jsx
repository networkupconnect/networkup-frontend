import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

/* ─── Helpers ───────────────────────────────────────────────────────────── */
function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr);
  const days = Math.floor(diff / 86400000);
  const hrs  = Math.floor(diff / 3600000);
  if (hrs < 1)  return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day:"numeric", month:"short" });
}

function normaliseJob(j) {
  // The internships-api has slightly varied field names — normalise them here
  return {
    id:          j.id || j._id || Math.random().toString(36).slice(2),
    title:       j.title        || j.job_title        || "Untitled",
    company:     j.company      || j.employer_name    || j.organization || "Unknown",
    location:    j.location     || j.job_location     || j.city         || "Remote",
    type:        j.type         || j.employment_type  || j.job_type     || "",
    url:         j.url          || j.job_url          || j.apply_url    || j.link || "#",
    postedAt:    j.date_posted  || j.posted_at        || j.createdAt    || "",
    description: j.description  || j.job_description  || "",
    logo:        j.company_logo || j.logo             || "",
    remote:      !!(j.remote    || j.is_remote        || j.location?.toLowerCase().includes("remote")),
    source:      j.source       || "",
  };
}

const TYPE_FILTERS = ["All", "Internship", "Full-time", "Part-time", "Remote", "Contract"];

/* ─── Job Card ──────────────────────────────────────────────────────────── */
function JobCard({ job }) {
  const openJob = () => {
    if (job.url && job.url !== "#") window.open(job.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ background:"#fff", border:"1px solid #e5e3dc", borderRadius:13, padding:"14px 16px", cursor:"pointer" }}
         onClick={openJob}>

      {/* Top row */}
      <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:9 }}>
        {/* Logo / initials */}
        <div style={{ width:38, height:38, borderRadius:9, border:"1px solid #e5e3dc", background:"#f5f4f0", flexShrink:0, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
          {job.logo ? (
            <img src={job.logo} alt="" style={{ width:"100%", height:"100%", objectFit:"contain" }}
                 onError={e => { e.target.style.display="none"; }} />
          ) : (
            <span style={{ fontSize:13, fontWeight:800, color:"#6b6860" }}>
              {job.company?.charAt(0)?.toUpperCase() || "?"}
            </span>
          )}
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, lineHeight:1.35, marginBottom:2, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
            {job.title}
          </div>
          <div style={{ fontSize:12, color:"#6b6860", fontWeight:600 }}>{job.company}</div>
        </div>

        {/* Arrow */}
        <div style={{ color:"#c5c2b8", fontSize:16, flexShrink:0, marginTop:2 }}>↗</div>
      </div>

      {/* Tags row */}
      <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom: job.description ? 8 : 0 }}>
        {job.location && (
          <span style={tagStyle(false)}>📍 {job.location}</span>
        )}
        {job.type && (
          <span style={tagStyle(true)}>{job.type}</span>
        )}
        {job.remote && !job.location?.toLowerCase().includes("remote") && (
          <span style={tagStyle(true)}>Remote</span>
        )}
        {job.postedAt && (
          <span style={{ fontSize:10, color:"#b5b3ac", marginLeft:"auto", alignSelf:"center", whiteSpace:"nowrap" }}>
            {timeAgo(job.postedAt)}
          </span>
        )}
      </div>

      {/* Description snippet */}
      {job.description && (
        <div style={{ fontSize:11, color:"#9b9890", lineHeight:1.6, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
          {job.description.replace(/<[^>]+>/g, "").slice(0, 180)}
        </div>
      )}
    </div>
  );
}

function tagStyle(dark) {
  return {
    fontSize:10, padding:"2px 8px", borderRadius:100, fontWeight:600,
    background: dark ? "#1a1a18" : "#f0ede8",
    color:       dark ? "#fff"    : "#6b6860",
  };
}

/* ─── Main ──────────────────────────────────────────────────────────────── */
export default function Internships() {
  const navigate = useNavigate();

  const [jobs,        setJobs]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState("");
  const [activeType,  setActiveType]  = useState("All");
  const [fetchedAt,   setFetchedAt]   = useState(null);
  const [searchInput, setSearchInput] = useState("");

  const fetchJobs = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (forceRefresh) params.append("refresh", "1");
      const res = await api.get(`/api/internships?${params}`);
      setJobs((res.data.data || []).map(normaliseJob));
      setFetchedAt(res.data.fetchedAt);
    } catch (err) {
      setError("Could not load listings. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  /* Client-side filter */
  const filtered = jobs.filter(j => {
    const matchSearch = !search.trim() ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.location.toLowerCase().includes(search.toLowerCase());

    const matchType = activeType === "All" ||
      (activeType === "Remote"
        ? j.remote || j.location.toLowerCase().includes("remote")
        : j.type?.toLowerCase().includes(activeType.toLowerCase()));

    return matchSearch && matchType;
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  /* ── Styles ── */
  const S = {
    page:    { minHeight:"100vh", background:"#fafaf9", fontFamily:"'DM Sans',system-ui,sans-serif", color:"#1a1a18", fontSize:14 },
    wrap:    { maxWidth:600, margin:"0 auto", padding:"20px 16px 88px" },
    hdr:     { display:"flex", alignItems:"center", gap:12, marginBottom:22 },
    backBtn: { width:34, height:34, borderRadius:9, border:"1px solid #e5e3dc", background:"#fff", cursor:"pointer", fontSize:17, color:"#6b6860", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
    btn:     { padding:"8px 14px", borderRadius:10, border:"none", background:"#1a1a18", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" },
    input:   { width:"100%", padding:"9px 12px", borderRadius:10, border:"1px solid #e5e3dc", background:"#fff", fontSize:13, fontFamily:"inherit", color:"#1a1a18", outline:"none", boxSizing:"border-box" },
    tag:     (a) => ({ padding:"5px 12px", borderRadius:100, fontSize:11, fontWeight:600, border:"none", cursor:"pointer", background:a?"#1a1a18":"#f0ede8", color:a?"#fff":"#6b6860", transition:"all .13s", whiteSpace:"nowrap", flexShrink:0 }),
  };

  return (
    <div style={S.page}>
      <div style={S.wrap}>

        {/* Header */}
        <div style={S.hdr}>
          <button style={S.backBtn} onClick={() => navigate("/")}>‹</button>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:18, fontWeight:800, letterSpacing:"-.3px" }}>Internships & Jobs</div>
            <div style={{ fontSize:11, color:"#9b9890", marginTop:1 }}>
              {fetchedAt
                ? `Updated ${timeAgo(fetchedAt)} · ${jobs.length} listings`
                : "Live listings"}
            </div>
          </div>
          <button style={S.btn} onClick={() => fetchJobs(true)} title="Refresh listings">
            ↻
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ display:"flex", gap:8, marginBottom:12 }}>
          <input
            style={S.input}
            placeholder="Search by role, company or location…"
            value={searchInput}
            onChange={e => {
              setSearchInput(e.target.value);
              if (!e.target.value.trim()) setSearch("");
            }}
          />
          {searchInput && (
            <button type="button" onClick={() => { setSearchInput(""); setSearch(""); }}
              style={{ padding:"9px 12px", borderRadius:10, border:"1px solid #e5e3dc", background:"#f5f4f0", color:"#9b9890", fontSize:12, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
              Clear
            </button>
          )}
        </form>

        {/* Type filters */}
        <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4, marginBottom:16 }}>
          {TYPE_FILTERS.map(t => (
            <button key={t} style={S.tag(activeType===t)} onClick={() => setActiveType(t)}>{t}</button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <div style={{ width:28, height:28, border:"2.5px solid #e5e3dc", borderTopColor:"#1a1a18", borderRadius:"50%", animation:"spin .7s linear infinite", margin:"0 auto 12px" }} />
            <div style={{ fontSize:12, color:"#9b9890" }}>Fetching listings…</div>
            <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
          </div>

        ) : error ? (
          <div style={{ textAlign:"center", padding:"48px", background:"#fff", border:"1px solid #e5e3dc", borderRadius:14 }}>
            <div style={{ fontSize:28, marginBottom:8 }}>⚠️</div>
            <div style={{ fontWeight:700, marginBottom:4 }}>Failed to load</div>
            <div style={{ fontSize:12, color:"#9b9890", marginBottom:16 }}>{error}</div>
            <button style={S.btn} onClick={() => fetchJobs(true)}>Try again</button>
          </div>

        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"48px", background:"#fff", border:"1px solid #e5e3dc", borderRadius:14 }}>
            <div style={{ fontSize:28, marginBottom:8 }}>🔍</div>
            <div style={{ fontWeight:700, marginBottom:4 }}>No results</div>
            <div style={{ fontSize:12, color:"#9b9890", marginBottom:16 }}>
              {search ? `Nothing matching "${search}"` : "No listings for this filter"}
            </div>
            <button style={{ ...S.btn, background:"#f0ede8", color:"#1a1a18" }}
              onClick={() => { setSearch(""); setSearchInput(""); setActiveType("All"); }}>
              Clear filters
            </button>
          </div>

        ) : (
          <>
            <div style={{ fontSize:11, color:"#9b9890", marginBottom:10 }}>
              {filtered.length} {filtered.length === 1 ? "listing" : "listings"}
              {activeType !== "All" && ` · ${activeType}`}
              {search && ` · "${search}"`}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {filtered.map(job => <JobCard key={job.id} job={job} />)}
            </div>
          </>
        )}

      </div>
    </div>
  );
}