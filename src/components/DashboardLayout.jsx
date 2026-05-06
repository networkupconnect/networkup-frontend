import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Navbar from "../pages/Navbar.jsx";
import { useAuth } from "../context/AuthContext";

/* ─────────────────────────────────────────────────────────────────────────────
   DASHBOARD LAYOUT — Vibrant Brutalist bottom nav
   Dark gradient bar. All icons white. Active: amber pill. Zero radius.
   Explore icon: improved compass/grid SVG.
   ───────────────────────────────────────────────────────────────────────────── */

/* Inject bottom nav styles */
if (typeof document !== "undefined" && !document.getElementById("dl-nav-styles")) {
  const style = document.createElement("style");
  style.id = "dl-nav-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

    .dl-bottom-nav {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      z-index: 20;
      background: linear-gradient(90deg, #3730A3 0%, #6D28D9 40%, #BE185D 80%, #EA580C 100%);
      border-top: 2px solid rgba(255,255,255,0.15);
      display: flex;
      justify-content: stretch;
      align-items: center;
      height: 58px;
      padding: 0 4px;
    }

    .dl-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      flex: 1;
      padding: 6px 2px;
      text-decoration: none;
      border: none;
      background: transparent;
      cursor: pointer;
      transition: none;
      -webkit-tap-highlight-color: transparent;
    }

    .dl-tab-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.12s;
    }

    .dl-tab.active .dl-tab-icon {
      background: #FBBF24;
    }

    .dl-tab svg,
    .dl-tab img {
      filter: brightness(0) invert(1);
      opacity: 0.75;
      width: 20px;
      height: 20px;
    }

    .dl-tab.active svg,
    .dl-tab.active img {
      filter: brightness(0);
      opacity: 1;
    }

    .dl-tab-label {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.6);
      font-family: 'Nunito', sans-serif;
      line-height: 1;
    }

    .dl-tab.active .dl-tab-label {
      color: #FBBF24;
    }
  `;
  document.head.appendChild(style);
}

export default function DashboardLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  /* Desktop sidebar links */
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
    { name: "Internships",  path: "/Internships", imgsrc: "/images/alert.svg",       authType: null },
    { name: "Feedback",     path: "/feedback",    imgsrc: "/images/feedback.svg",    authType: "login" },
    ...(user && (user.role === "seller" || user.role === "admin")
      ? [{ name: "Seller Dashboard", path: "/seller", imgsrc: "/images/seller-cart.svg", authType: null }] : []),
    ...(user && user.role === "admin"
      ? [{ name: "Admin Dashboard", path: "/admin", imgsrc: "/images/admin.svg", authType: null }] : []),
  ];

  /* Mobile bottom nav — 5 tabs */
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
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 transition-colors ${isActive ? "bg-blue-100 font-semibold text-black" : "hover:bg-gray-200"}`;

  /* Icon SVGs — all same white color, rendered as inline SVG for nav */
  const TabIcon = ({ type, isActive }) => {
    const color = isActive ? "#1a1200" : "white";
    const op    = isActive ? 1 : 0.75;

    if (type === "home") return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:op }}>
        <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"/>
      </svg>
    );
    if (type === "resources") return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:op }}>
        <rect x="4" y="3" width="6" height="18" rx="0"/>
        <rect x="14" y="3" width="6" height="18" rx="0"/>
      </svg>
    );
    if (type === "explore") return (
      /* Compass needle — distinct from grid icons */
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:op }}>
        <circle cx="12" cy="12" r="9"/>
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={color} stroke={color} strokeWidth="0"/>
      </svg>
    );
    if (type === "connect") return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:op }}>
        <circle cx="9" cy="7" r="3"/>
        <circle cx="16" cy="10" r="3"/>
        <path d="M3 21C3 17.686 5.686 15 9 15H13"/>
        <path d="M16 21C16 18.239 17.343 16 19 15"/>
      </svg>
    );
    if (type === "profile") return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:op }}>
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
          zIndex:50, background:"#1e1b4b", color:"#fff",
          fontSize:13, fontWeight:700, padding:"11px 20px",
          border:"2px solid rgba(255,255,255,0.2)",
          maxWidth:300, textAlign:"center", fontFamily:"'Nunito', sans-serif",
        }}>
          {authMsg}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden sm:flex flex-col w-44 shrink-0 bg-gray-100 overflow-y-auto">
          <div className="flex flex-col p-2 gap-0.5">
            {allLinks1.map((link) => (
              <NavLink key={link.name} to={link.path} onClick={(e) => handleNavClick(e, link)} className={navLinkClass}>
                <img className={`w-5 h-5 shrink-0 ${link.name === "My Profile" ? "rounded-full object-cover" : ""}`} src={link.imgsrc} alt="" />
                <span className="truncate">{link.name}</span>
              </NavLink>
            ))}
          </div>
          <div className="border-t border-gray-300 mx-2 my-1" />
          <div className="flex flex-col p-2 pb-8 gap-0.5">
            {allLinks2.map((link) => (
              <NavLink key={link.name} to={link.path} onClick={(e) => handleNavClick(e, link)} className={navLinkClass}>
                <img className="w-5 h-5 shrink-0" src={link.imgsrc} alt="" />
                <span className="truncate">{link.name}</span>
              </NavLink>
            ))}
          </div>
        </aside>

        {/* Mobile bottom nav — dark gradient, white icons, amber active pill */}
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

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-white hide-scrollbar pb-16 sm:pb-0">
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