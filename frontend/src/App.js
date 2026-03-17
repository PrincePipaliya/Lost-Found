import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import MyPosts from "./pages/MyPosts";
import About from "./pages/About";
import ItemDetail from "./pages/ItemDetail";
import ReturnedItems from "./pages/ReturnedItems";

import Layout from "./Layout";

/* ROUTE GUARDS USING CONTEXT */

function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/dashboard" replace />;

  return children;
}

/* ✅ FIXED: PublicRoute NO LONGER REDIRECTS */
function PublicRoute({ children }) {
  return children;
}

/* APP */

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>

            {/* ALWAYS ALLOW LOGIN PAGE */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            <Route path="/about" element={<About />} />
            <Route path="/returned" element={<ReturnedItems />} />
            <Route path="/items/:id" element={<ItemDetail />} />

            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/my-posts" element={<PrivateRoute><MyPosts /></PrivateRoute>} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

            {/* ✅ DEFAULT: ALWAYS GO TO LOGIN */}
            <Route path="/" element={<Navigate to="/login" replace />} />

          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}