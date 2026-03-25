// components/LoginPopup.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const BACKEND = "https://network.networkup.in";

export default function LoginPopup() {
  const { user, login } = useAuth();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) return;
    const timer = setTimeout(() => setShow(true), 10000);
    return () => clearTimeout(timer);
  }, [user]);

  // Auto close when user logs in
  useEffect(() => {
    if (user) setShow(false);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Email is required");
    if (!password) return setError("Password is required");

    try {
      setLoading(true);
      const res = await api.post("/api/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });
      login({ token: res.data.token, user: res.data.user });
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${BACKEND}/api/auth/google`;
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif", padding: "16px",
      }}
    >
      <div
        style={{
          background: "#fff", borderRadius: "16px", padding: "36px",
          width: "100%", maxWidth: "400px", position: "relative",
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "6px", color: "#1a1a1a" }}>
          Welcome to NetworkUp
        </h2>
        <p style={{ fontSize: "14px", color: "#737373", marginBottom: "24px" }}>
          Sign in to get the full experience
        </p>

        {/* Error */}
        {error && (
          <div style={{
            background: "#fff5f5", border: "1px solid #fca5a5", color: "#dc2626",
            borderRadius: "8px", padding: "10px 14px", fontSize: "13.5px", marginBottom: "16px",
          }}>
            {error}
          </div>
        )}

        {/* Google button */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: "100%", padding: "11px 14px", border: "1.5px solid #e5e5e0",
            borderRadius: "10px", background: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "10px", fontSize: "14px", fontWeight: 500, marginBottom: "20px",
            fontFamily: "inherit",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ flex: 1, height: "1px", background: "#e5e5e0" }} />
          <span style={{ fontSize: "12px", color: "#a3a3a3" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "#e5e5e0" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "13px", fontWeight: 500, color: "#737373", display: "block", marginBottom: "5px" }}>
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              style={{
                width: "100%", padding: "11px 14px", border: "1.5px solid #e5e5e0",
                borderRadius: "10px", fontSize: "14.5px", outline: "none",
                fontFamily: "inherit", boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "13px", fontWeight: 500, color: "#737373", display: "block", marginBottom: "5px" }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={{
                width: "100%", padding: "11px 14px", border: "1.5px solid #e5e5e0",
                borderRadius: "10px", fontSize: "14.5px", outline: "none",
                fontFamily: "inherit", boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "12px", background: "#1a1a1a", color: "#fff",
              border: "none", borderRadius: "10px", fontSize: "14.5px", fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
              fontFamily: "inherit", marginBottom: "16px",
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: "13.5px", color: "#737373" }}>
          No account?{" "}
          <a href="/signup" style={{ color: "#1a1a1a", fontWeight: 500 }}>
            Sign up free
          </a>
        </p>
      </div>
    </div>
  );
}