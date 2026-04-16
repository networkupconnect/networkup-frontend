import { useEffect, useState, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import api from "../api/axios";

// ── Sell Modal ─────────────────────────────────────────────────────────────
function SellModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: "", price: "", image: "" });
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      setForm((f) => ({ ...f, image: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return setError("Title is required.");
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
      return setError("Enter a valid price.");
    setError("");
    setSubmitting(true);
    try {
      await api.post("/api/seller/products", {
        title: form.title.trim(),
        price: Number(form.price),
        image: form.image || undefined,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to list item. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Sheet */}
      <div
        className="w-full sm:w-[420px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: "slideUp 0.28s cubic-bezier(.32,1.12,.42,1) both" }}
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2 sm:pt-5">
          <h2 className="text-base font-bold text-gray-900 tracking-tight">
            List an Item
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 pb-6 space-y-4">
          {/* Image picker */}
          <div
            onClick={() => fileRef.current.click()}
            className="relative w-full h-40 rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-all group"
          >
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center mb-2 transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-gray-500">Tap to add photo</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Optional but recommended</p>
              </>
            )}
            {preview && (
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs font-semibold bg-black/40 px-3 py-1 rounded-full">Change photo</span>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

          {/* Title */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
              Item Title
            </label>
            <input
              type="text"
              placeholder="e.g. Calculus Textbook, iPhone Charger…"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
            />
          </div>

          {/* Price */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
              Price (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">₹</span>
              <input
                type="number"
                placeholder="0"
                min="1"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Listing…" : "List for Sale"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(60px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function BuySell() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const [showSell, setShowSell] = useState(false);

  const { addToCart, cart = [] } = useOutletContext() || {};
  const navigate = useNavigate();

  const cartCount = cart.reduce((s, i) => s + (i.quantity || 1), 0);

  const fetchProducts = () => {
    setLoading(true);
    api
      .get("/api/seller/products")
      .then((res) => {
        if (Array.isArray(res.data)) setProducts(res.data);
        else if (Array.isArray(res.data?.products)) setProducts(res.data.products);
        else setProducts([]);
      })
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setLoading(false));
  };

  useEffect(fetchProducts, []);

  const handleAdd = (item) => {
    addToCart(item);
    setAddedId(item._id);
    setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Sticky header ── */}
      <div className="sticky top-1 z-20 bg-gray-100 rounded-3xl m-1 px-4 h-14 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-gray-900 tracking-tight">Campus Shop</h1>
          {!loading && (
            <p className="text-[11px] text-gray-600">
              {products.length} listing{products.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <button
          onClick={() => navigate("/cart")}
          className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.874-7.148a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 pb-28">
        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-44 bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-8 bg-gray-100 rounded mt-3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && products.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-3xl mb-3">🛍️</p>
            <p className="text-sm font-medium text-gray-600">No listings yet</p>
            <p className="text-xs text-gray-400 mt-1">Be the first to sell something!</p>
          </div>
        )}

        {/* Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {products.map((item) => {
              const inCart = cart.some((c) => (c._id || c.id) === (item._id || item.id));
              const justAdded = addedId === (item._id || item.id);
              return (
                <article
                  key={item._id || item.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="relative h-44 bg-gray-50 overflow-hidden">
                    <img
                      src={item.image || "/images/no-image.png"}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm border border-gray-100 text-gray-900 text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                      ₹{item.price}
                    </div>
                  </div>
                  <div className="p-3">
                    <h2 className="text-sm font-semibold text-gray-800 truncate mb-3 leading-tight">
                      {item.title}
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAdd(item)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                          justAdded
                            ? "bg-green-600 text-white scale-95"
                            : inCart
                              ? "bg-blue-50 text-blue-600 border border-blue-200"
                              : "bg-gray-900 text-white hover:bg-gray-700"
                        }`}
                      >
                        {justAdded ? "Added ✓" : inCart ? "In Cart" : "Add"}
                      </button>
                      <button
                        onClick={() => { addToCart(item); navigate("/cart"); }}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Sell FAB ──────────────────────────────────────────────────────── */}
      {/*  Mobile: centered bottom  |  Desktop (sm+): bottom-right           */}
      <button
        onClick={() => setShowSell(true)}
        aria-label="Sell an item"
        className={`
          fixed z-30 shadow-xl transition-all duration-200 active:scale-95
          flex items-center justify-center gap-2
          /* mobile: pill centered at bottom */
          bottom-5 left-1/2 -translate-x-1/2
          px-6 h-12 rounded-full
          bg-gray-900 text-white text-sm font-bold
          hover:bg-gray-700
          /* desktop: square FAB bottom-right */
          sm:left-auto sm:right-6 sm:translate-x-0
          sm:w-14 sm:h-14 sm:px-0 sm:rounded-2xl
        `}
      >
        {/* Plus icon — always visible */}
        <svg className="w-5 h-5 flex-shrink-0" style={{ transform: "translateY(-12px)" }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        {/* Label — only on mobile (hidden on sm+) */}
        <span className="sm:hidden">Sell</span>
      </button>

      {/* ── Sell Modal ── */}
      {showSell && (
        <SellModal
          onClose={() => setShowSell(false)}
          onSuccess={fetchProducts}   // refresh listing after posting
        />
      )}
    </div>
  );
}