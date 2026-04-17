import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

function Avatar({ name = "", src }) {
  return src ? (
    <img src={src} alt={name} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "1.5px solid #ebebeb" }} />
  ) : (
    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#888" }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/api/rooms/${id}`);
        setListing(res.data);
      } catch {
        setToast("Failed to load listing");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await api.delete(`/api/rooms/${id}`);
      navigate(-1);
    } catch {
      setToast("Failed to delete");
    }
  };

  const canDelete =
    user?._id === listing?.postedBy?._id?.toString() ||
    user?._id === String(listing?.postedBy?._id) ||
    user?.role === "admin";

  /* ── styles ── */
  const S = {
    page: {
      fontFamily: "'Instrument Sans', system-ui, sans-serif",
      minHeight: "100vh", background: "#fff", color: "#111",
    },
    wrap: { maxWidth: 620, margin: "0 auto", padding: "0 20px 80px" },
  };

  if (loading) return (
    <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ width: 22, height: 22, border: "2px solid #e5e5e5", borderTopColor: "#111", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!listing) return (
    <div style={{ ...S.page, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 12 }}>
      <p style={{ fontSize: 32 }}>🏚️</p>
      <p style={{ fontWeight: 700 }}>Listing not found</p>
      <button onClick={() => navigate(-1)} style={{ padding: "9px 20px", borderRadius: 10, border: "1.5px solid #ebebeb", background: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}>Go Back</button>
    </div>
  );

  const images = listing.images || [];
  const facilities = listing.facilities || [];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .detail-fade { animation: fadeUp 0.25s ease both; }
      `}</style>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, cursor: "zoom-out" }}>
          <img src={lightbox} alt="" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 12, objectFit: "contain" }} />
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 90, background: "#111", color: "#fff", fontSize: 12, fontWeight: 600, padding: "9px 18px", borderRadius: 100, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,0.18)" }}>
          {toast}
        </div>
      )}

      <div style={S.page}>
        <div style={S.wrap}>

          {/* ── Header ── */}
          <div style={{ padding: "20px 0 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => navigate(-1)}
              style={{ width: 34, height: 34, borderRadius: 9, border: "1.5px solid #ebebeb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
              onMouseLeave={e => e.currentTarget.style.background = "#fff"}
            >
              <svg width="14" height="14" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Room Details</p>
              <p style={{ fontSize: 11, color: "#aaa", margin: "1px 0 0" }}>Full listing info</p>
            </div>
          </div>

          <div className="detail-fade">

            {/* ── Image Gallery ── */}
            {images.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                {/* Main image */}
                <div style={{ borderRadius: 14, overflow: "hidden", border: "1.5px solid #ebebeb", marginBottom: 8 }}>
                  <img
                    src={images[activeImg]}
                    alt=""
                    onClick={() => setLightbox(images[activeImg])}
                    style={{ width: "100%", height: 240, objectFit: "cover", cursor: "zoom-in", display: "block" }}
                  />
                </div>
                {/* Thumbnails */}
                {images.length > 1 && (
                  <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
                    {images.map((img, i) => (
                      <img key={i} src={img} alt=""
                        onClick={() => setActiveImg(i)}
                        style={{
                          width: 60, height: 44, objectFit: "cover", borderRadius: 8, flexShrink: 0,
                          border: `2px solid ${i === activeImg ? "#111" : "#ebebeb"}`,
                          cursor: "pointer", transition: "border-color 0.15s", opacity: i === activeImg ? 1 : 0.75,
                        }} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Title + Status + Rent ── */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
                  <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "#111" }}>{listing.title}</h1>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 100,
                    background: listing.isAvailable ? "#f0faf5" : "#fff0f0",
                    color: listing.isAvailable ? "#1a9e6a" : "#d03030",
                    border: `1px solid ${listing.isAvailable ? "#c6eed9" : "#f5c0c0"}`,
                  }}>
                    {listing.isAvailable ? "Available" : "Taken"}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "#aaa", margin: 0, fontWeight: 500 }}>📍 {listing.location}</p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ fontSize: 26, fontWeight: 800, color: "#111", margin: 0 }}>₹{listing.rent.toLocaleString()}</p>
                <p style={{ fontSize: 11, color: "#bbb", margin: "2px 0 0" }}>/month</p>
              </div>
            </div>

            <div style={{ height: 1, background: "#f0f0f0", marginBottom: 16 }} />

            {/* ── Description ── */}
            {listing.description && (
              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>About</p>
                <p style={{ fontSize: 13, color: "#555", lineHeight: 1.65, margin: 0 }}>{listing.description}</p>
              </div>
            )}

            {/* ── Facilities ── */}
            {facilities.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Facilities</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {facilities.map((f, i) => (
                    <span key={i} style={{ background: "#f5f5f5", color: "#444", fontSize: 12, fontWeight: 600, padding: "6px 13px", borderRadius: 100, border: "1px solid #ebebeb" }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ height: 1, background: "#f0f0f0", marginBottom: 16 }} />

            {/* ── Posted By ── */}
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Posted By</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={listing.postedBy?.name || "?"} src={listing.postedBy?.profileImage} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{listing.postedBy?.name || "—"}</p>
                  {listing.contactName && listing.contactName !== listing.postedBy?.name && (
                    <p style={{ fontSize: 11, color: "#aaa", margin: "2px 0 0" }}>Contact: {listing.contactName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Contact Actions ── */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {listing.contactPhone && (
                <a href={`tel:${listing.contactPhone}`} style={{
                  flex: 1, minWidth: 120,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "13px 20px", borderRadius: 12,
                  background: "#f0faf5", border: "1.5px solid #c6eed9",
                  color: "#1a9e6a", fontSize: 13, fontWeight: 700,
                  textDecoration: "none", transition: "background 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "#ddf5ea"}
                  onMouseLeave={e => e.currentTarget.style.background = "#f0faf5"}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  Call {listing.contactPhone}
                </a>
              )}
              {listing.contactPhone && (
                <a href={`https://wa.me/${listing.contactPhone.replace(/\D/g, "")}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    flex: 1, minWidth: 120,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "13px 20px", borderRadius: 12,
                    background: "#f0faf5", border: "1.5px solid #c6eed9",
                    color: "#1a9e6a", fontSize: 13, fontWeight: 700,
                    textDecoration: "none", transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#ddf5ea"}
                  onMouseLeave={e => e.currentTarget.style.background = "#f0faf5"}
                >
                  💬 WhatsApp
                </a>
              )}
            </div>

            {/* ── Delete ── */}
            {canDelete && (
              <button
                onClick={handleDelete}
                style={{
                  width: "100%", marginTop: 12, padding: "12px", borderRadius: 12,
                  border: "1.5px solid #fad4d4", background: "#fff5f5",
                  color: "#cc3333", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#ffe8e8"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff5f5"}
              >
                🗑 Delete Listing
              </button>
            )}

          </div>
        </div>
      </div>
    </>
  );
}