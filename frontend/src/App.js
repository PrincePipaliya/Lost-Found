import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import MyPosts from "./pages/MyPosts";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import ItemDetail from "./pages/ItemDetail";
import Layout from "./Layout";

/* =====================
   AUTH GUARDS
===================== */

/* Logged-in users */
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

/* Admin-only */
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to="/dashboard" replace />;

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔹 Layout ALWAYS renders Navbar */}
        <Route element={<Layout />}>

          {/* ===== PUBLIC ===== */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ✅ SINGLE PAGE: About + Contact */}
          <Route path="/about" element={<About />} />

          <Route path="/how-it-works" element={<HowItWorks />} />

          {/* Public item detail */}
          <Route path="/items/:id" element={<ItemDetail />} />

          {/* ===== USER ===== */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/my-posts"
            element={
              <PrivateRoute>
                <MyPosts />
              </PrivateRoute>
            }
          />

          {/* ===== ADMIN ===== */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />

          {/* ===== DEFAULT ===== */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}
