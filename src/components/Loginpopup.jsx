import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthPage from "../pages/AuthPage"; // 👈 import your existing page

export default function LoginPopup() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (user) return; // already logged in
    if (sessionStorage.getItem("popupDismissed")) return; // already dismissed

    const timer = setTimeout(() => {
      setShow(true);
    }, 10000); 

    return () => clearTimeout(timer);
  }, [user]);

  // Auto close when user logs in
  useEffect(() => {
    if (user) setShow(false);
  }, [user]);

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem("popupDismissed", "true");
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ✅ Your existing AuthPage directly inside popup */}
        <AuthPage />
      </div>
    </div>
  );
}