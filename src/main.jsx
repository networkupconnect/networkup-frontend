import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Resources from "./pages/Resources";
import DashboardLayout from "./components/DashboardLayout.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import BuySell from "./pages/BuySell.jsx";
import Profile from "./pages/Profile.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import Cart from "./pages/Cart.jsx";
import SellerDashboard from "./pages/seller/SellerDashboard.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import NotFound from "./pages/NotFound.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderSuccess from "./pages/OrderSuccess.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import Setting from "./pages/Setting.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { PostsProvider } from "./context/PostsContext.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Chat from "./pages/Chat.jsx";
import Messages from "./pages/Messages.jsx";
import Connections from "./pages/Connections.jsx";
import Confessions from "./pages/Confessions";
import Internships from "./pages/Internships.jsx";
import Feedback from "./pages/Feedback.jsx";
import Assignments from "./pages/Assignments.jsx";
import LostFound from "./context/LostFound.jsx";
import RoomFinder from "./pages/RoomFinder.jsx";
import Attendance from "./pages/Attendance.jsx";
import OnboardingFlow from "./pages/OnboardingFlow.jsx";



const router = createBrowserRouter([
  // ── PUBLIC AUTH ──
  { path: "/login", element: <AuthPage /> },
  { path: "/signup", element: <AuthPage /> },
  { path: "/Signup", element: <Navigate to="/signup" replace /> },




  // ── ONBOARDING (protected — must be logged in, but not yet onboarded) ──
  {
    path: "/onboarding",
    element: (
      <ProtectedRoute>
        <OnboardingFlow />
      </ProtectedRoute>
    ),
  },

  // ── CHAT (standalone, no sidebar) ──
  {
    path: "/chat/:userId",
    element: (
      <ProtectedRoute>
        <Chat />
      </ProtectedRoute>
    ),
  },

  // ── PROFILE (standalone, no sidebar) ──
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },

  // ── DASHBOARD LAYOUT ──
  {
    path: "/",
    element: <DashboardLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <DashboardHome /> },

      { path: "resources", element: <Resources /> },
      { path: "confessions", element: <Confessions /> },
      { path: "messages", element: <Messages /> },
      { path: "connections", element: <Connections /> },
      { path: "Internships", element: <Internships /> },
      { path: "assignments", element: <Assignments /> },
      { path: "lostfound", element: <LostFound /> },
      { path: "rooms", element: <RoomFinder /> },
      { path: "buy-sell", element: <BuySell /> },
      { path: "cart", element: <Cart /> },
      { path: "checkout", element: <Checkout /> },
      { path: "order-success", element: <OrderSuccess /> },
      { path: "user/:userId", element: <UserProfile /> },
      { path: "attendance", element: <Attendance /> },

      {
        path: "feedback",
        element: (
          <ProtectedRoute>
            <Feedback />
          </ProtectedRoute>
        ),
      },
      {
        path: "setting",
        element: (
          <ProtectedRoute>
            <Setting />
          </ProtectedRoute>
        ),
      },
      {
        path: "seller",
        element: (
          <ProtectedRoute roles={["seller", "admin"]}>
            <SellerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // ── FALLBACK ──
  { path: "*", element: <NotFound /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <PostsProvider>
        <RouterProvider router={router} />
      </PostsProvider>
    </AuthProvider>
  </React.StrictMode>,
);