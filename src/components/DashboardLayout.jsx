import React, { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Navbar from "../pages/Navbar.jsx";
import { useAuth } from "../context/AuthContext";

/* ─────────────────────────────────────────────────────────────────────────────
   DASHBOARD LAYOUT
   Solid purple nav (#5B21B6). Scroll-reactive gradient bg. WhatsApp texture.
   ───────────────────────────────────────────────────────────────────────────── */

const TEXTURE_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Ccircle cx='10' cy='10' r='2.2' fill='rgba(255,255,255,0.07)'/%3E%3Ccircle cx='40' cy='10' r='1.4' fill='rgba(255,255,255,0.04)'/%3E%3Ccircle cx='70' cy='10' r='2.2' fill='rgba(255,255,255,0.07)'/%3E%3Ccircle cx='25' cy='28' r='1.8' fill='rgba(255,255,255,0.05)'/%3E%3Ccircle cx='55' cy='28' r='1.8' fill='rgba(255,255,255,0.05)'/%3E%3Ccircle cx='10' cy='48' r='1.4' fill='rgba(255,255,255,0.04)'/%3E%3Ccircle cx='40' cy='48' r='2.2' fill='rgba(255,255,255,0.07)'/%3E%3Ccircle cx='70' cy='48' r='1.4' fill='rgba(255,255,255,0.04)'/%3E%3Ccircle cx='25' cy='68' r='1.8' fill='rgba(255,255,255,0.05)'/%3E%3Ccircle cx='55' cy='68' r='1.8' fill='rgba(255,255,255,0.05)'/%3E%3Crect x='6' y='36' width='8' height='8' rx='1' fill='rgba(255,255,255,0.03)' transform='rotate(45 10 40)'/%3E%3Crect x='36' y='56' width='8' height='8' rx='1' fill='rgba(255,255,255,0.03)' transform='rotate(45 40 60)'/%3E%3Crect x='66' y='36' width='8' height='8' rx='1' fill='rgba(255,255,255,0.03)' transform='rotate(45 70 40)'/%3E%3C/svg%3E")`;

if (typeof document !== "undefined" && !document.getElementById("dl-nav-styles")) {
  const style = document.createElement("style");
  style.id = "dl-nav-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

    :root {
      --scroll-t: 0;
      --grad-h1: 250;
      --grad-h2: 290;
      --grad-h3: 330;
    }

    /* ── Scroll-reactive background on main content ── */
    .dl-main-bg {
      background:
        ${TEXTURE_SVG},
        linear-gradient(
          160deg,
          hsl(calc(250 + var(--scroll-t) * 110), 72%, 22%) 0%,
          hsl(calc(286 + var(--scroll-t) * 55),  68%, 29%) 35%,
          hsl(calc(328 + var(--scroll-t) * 80),  72%, 32%) 65%,
          hsl(calc(22  + var(--scroll-t) * 40),  78%, 36%) 85%,
          hsl(calc(42  + var(--scroll-t) * 20),  80%, 38%) 100%
        );
      background-attachment: local;
      background-size: 80px 80px, cover;
      transition: background 0.15s ease;
    }

    /* ── Bottom nav — solid purple ── */
    .dl-bottom-nav {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      z-index: 20;
      background: #5B21B6;
      border-top: 1.5px solid rgba(255,255,255,0.12);
      display: flex;
      justify-content: stretch;
      align-items: center;
      height: 54px;
      padding: 0 4px;
    }

    .dl-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      flex: 1;
      padding: 5px 2px;
      text-decoration: none;
      border: none;
      background: transparent;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .dl-tab-icon {
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      transition: background 0.12s;
    }

    .dl-tab.active .dl-tab-icon {
      background: rgba(251,191,36,0.22);
    }

    .dl-tab-label {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.55);
      font-family: 'Nunito', sans-serif;
      line-height: 1;
    }

    .dl-tab.active .dl-tab-label {
      color: #FCD34D;
    }
  `;
  document.head.appendChild(style);
}

export default function DashboardLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const mainRef = useRef(null);

  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (!savedCart || savedCart === "undefined" || savedCart === "null") return [];
      return JSON.parse(savedCart);
    } catch {
      localStorage.removeItem("cart");
      return [];
    }
  });

  const [products, setProducts] = useState([]);
  const [authMsg, setAuthMsg] = useState(null);

  /* Scroll-reactive gradient */
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const onScroll = () => {
      const t = el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight);
      el.style.setProperty("--scroll-t", t.toFixed(4));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    try { localStorage.setItem("cart", JSON.stringify(cart)); } catch {}
  }, [cart]);

  const getItemId = (item) => item._id || item.id;
  const clearCart = () => { setCart([]); localStorage.removeItem("cart"); };

  const addToCart = (product) => {
    if (!product.sellerId) { alert("This product cannot be added to cart"); return; }
    setCart((prev) => {
      const productId = getItemId(product);
      const existing = prev.find((item) => getItemId(item) === productId);
      if (existing) return prev.map((item) => getItemId(item) === productId ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { _id: product._id, title: product.title, price: product.price, image: product.image, quantity: 1, sellerId: product.sellerId }];
    });
  };

  const increaseQty = (id) => setCart((prev) => prev.map((item) => getItemId(item) === id ? { ...item, quantity: item.quantity + 1 } : item));
  const decreaseQty = (id) => setCart((prev) => prev.map((item) => getItemId(item) === id ? { ...item, quantity: item.quantity - 1 } : item).filter((item) => item.quantity > 0));

  const showAuthToast = (msg) => { setAuthMsg(msg); setTimeout(() => setAuthMsg(null), 3000); };

  const allLinks1 = [
    { name: "Home",        path: "/",            imgsrc: "/images/home.svg",        authType: null },
    ...(user ? [{ name: "Connections", path: "/connections", imgsrc: "/images/connections.svg", authType: null }] : []),
    { name: "Shop",        path: "/buy-sell",    imgsrc: "/images/cart.svg",        authType: null },
    { name: "Attendance",  path: "/attendance",  imgsrc: "/images/attendance.svg",  authType: null },
    { name: "Chat",        path: "/messages",    imgsrc: "/images/chat.svg",        authType: null },
  ];
  const allLinks2 = [
    { name: "Rooms",        path: "/rooms",       imgsrc: "/images/room.svg",        authType: null },
    { name: "Confessions",  path: "/confessions", imgsrc: "/images/inc.svg",         authType: null },
    { name: "PYQS & Notes", path: "/resources",   imgsrc: "/images/book.svg",        authType: null },
    { name: "Assignments",  path: "/assignments", imgsrc: "/images/assignment.svg",  authType: "profile" },
    { name: "Course",       path: "/course",      imgsrc: "/images/course.svg",      authType: null },
    { name: "Feedback",     path: "/feedback",    imgsrc: "/images/feedback.svg",    authType: "login" },
    ...(user && (user.role === "seller" || user.role === "admin")
      ? [{ name: "Seller Dashboard", path: "/seller", imgsrc: "/images/seller-cart.svg", authType: null }] : []),
    ...(user && user.role === "admin"
      ? [{ name: "Admin Dashboard", path: "/admin", imgsrc: "/images/admin.svg", authType: null }] : []),
  ];

  const mobileNavTabs = [
    { name: "Home",      path: "/",            icon: "home" },
    { name: "Resources", path: "/resources",   icon: "resources" },
    { name: "Explore",   path: "/explore",     icon: "explore" },
    { name: "Connect",   path: "/connections", icon: "connect" },
    { name: "Profile",   path: "/profile",     icon: "profile" },
  ];

  const handleNavClick = (e, link) => {
    if (!link.authType) return;
    if (!user) { e.preventDefault(); showAuthToast(link.authType === "profile" ? "Please setup your profile first — add Branch, Year and Section" : "Please login first to access this feature"); return; }
    if (link.authType === "profile" && (!user.branch || !user.year || !user.section)) { e.preventDefault(); showAuthToast("Please setup your profile first — add Branch, Year and Section"); }
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 transition-colors ${isActive ? "bg-violet-100 font-semibold text-violet-900" : "hover:bg-gray-200"}`;

  const TabIcon = ({ type, isActive }) => {
    const color = isActive ? "#FCD34D" : "rgba(255,255,255,0.75)";

    if (type === "home") return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"/>
      </svg>
    );
    if (type === "resources") return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    );
    if (type === "explore") return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={color} strokeWidth="0"/>
      </svg>
    );
    if (type === "connect") return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="7" r="3"/>
        <circle cx="16" cy="10" r="3"/>
        <path d="M3 21C3 17.686 5.686 15 9 15H13"/>
        <path d="M16 21C16 18.239 17.343 16 19 15"/>
      </svg>
    );
    if (type === "profile") return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20C4 16.686 7.582 14 12 14C16.418 14 20 16.686 20 20"/>
      </svg>
    );
    return null;
  };

  return (
    <div className="overflow-hidden relative h-screen flex flex-col">
      <Navbar />

      {authMsg && (
        <div style={{
          position:"fixed", top:16, left:"50%", transform:"translateX(-50%)",
          zIndex:50, background:"#5B21B6", color:"#fff",
          fontSize:13, fontWeight:700, padding:"11px 20px",
          borderRadius: 12,
          border:"1.5px solid rgba(255,255,255,0.2)",
          maxWidth:300, textAlign:"center", fontFamily:"'Nunito', sans-serif",
        }}>
          {authMsg}
        </div>
      )}

      <div className="color flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden sm:flex flex-col w-44 shrink-0 bg-gray-100 overflow-y-auto">
          <div className="color:gray-100 flex flex-col p-2 gap-0.5">
            {allLinks1.map((link) => (
              <NavLink key={link.name} to={link.path} onClick={(e) => handleNavClick(e, link)} className={navLinkClass}>
                <img className={`w-5 h-5 shrink-0 ${link.name === "My Profile" ? "rounded-full object-cover" : ""}`} src={link.imgsrc} alt="" />
                <span className="truncate">{link.name}</span>
              </NavLink>
            ))}
          </div>
          <div className="border-t border-gray-300 mx-2 my-1" />
          <div className="color:gray-100 flex flex-col p-2 pb-8 gap-0.5">
            {allLinks2.map((link) => (
              <NavLink key={link.name} to={link.path} onClick={(e) => handleNavClick(e, link)} className={navLinkClass}>
                <img className="w-5 h-5 shrink-0" src={link.imgsrc} alt="" />
                <span className="truncate">{link.name}</span>
              </NavLink>
            ))}
          </div>
        </aside>

        {/* Mobile bottom nav */}
        <nav className="sm:hidden dl-bottom-nav">
          {mobileNavTabs.map((tab) => (
            <NavLink
              key={tab.name}
              to={tab.path}
              end={tab.path === "/"}
              className={({ isActive }) => `dl-tab${isActive ? " active" : ""}`}
            >
              {({ isActive }) => (
                <>
                  <span className="dl-tab-icon">
                    <TabIcon type={tab.icon} isActive={isActive} />
                  </span>
                  <span className="dl-tab-label">{tab.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Main content — scroll-reactive gradient background */}
        <main
          ref={mainRef}
          className="dl-main-bg flex-1 overflow-y-auto hide-scrollbar pb-16 sm:pb-0"
          style={{ "--scroll-t": "0" }}
        >
          <Outlet
            context={{
              cart, addToCart, increaseQty, decreaseQty,
              products, setProducts, clearCart,
            }}
          />
        </main>
      </div>
    </div>
  );
}