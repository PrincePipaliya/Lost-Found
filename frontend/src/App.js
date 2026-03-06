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
   AUTH HELPERS
===================== */

const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const isAuthenticated = () => {
  return !!localStorage.getItem("accessToken");
};

/* =====================
   AUTH GUARDS
===================== */

const PrivateRoute = ({ children }) => {
  return isAuthenticated()
    ? children
    : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const user = getUser();

  if (!isAuthenticated())
    return <Navigate to="/login" replace />;

  if (user?.role !== "admin")
    return <Navigate to="/dashboard" replace />;

  return children;
};

/* Prevent logged-in users from seeing login/register */
const PublicRoute = ({ children }) => {
  return isAuthenticated()
    ? <Navigate to="/dashboard" replace />
    : children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>

          {/* ===== PUBLIC ===== */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
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
          <Route
            path="/"
            element={
              isAuthenticated()
                ? <Navigate to="/dashboard" replace />
                : <Navigate to="/login" replace />
            }
          />

          <Route
            path="*"
            element={
              isAuthenticated()
                ? <Navigate to="/dashboard" replace />
                : <Navigate to="/login" replace />
            }
          />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}