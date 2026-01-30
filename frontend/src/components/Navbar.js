import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const pathname = location.pathname || "/";

  // 🔐 Auth data
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  // 🚫 Force PUBLIC navbar on auth pages
  const isAuthPage =
    pathname === "/login" || pathname === "/register";

  const isLoggedIn = Boolean(token) && !isAuthPage;
  const isAdmin = role === "admin";

  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.clear();
    setOpen(false);
    navigate("/login", { replace: true });
  };

  const NavItem = ({ to, children }) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className={`block px-4 py-2 text-lg font-medium transition
        ${
          pathname === to
            ? "text-blue-600"
            : "text-gray-700 hover:text-blue-600"
        }`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 animate-slideDown">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">

        {/* LOGO */}
        <Link
          to={isLoggedIn ? "/dashboard" : "/login"}
          className="text-2xl font-extrabold tracking-wide hover:scale-105 transition-transform"
        >
          <span className="text-blue-600">we</span>
          <span className="text-gray-900">FOUND</span>
          <span className="text-green-600">it</span>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-4">

          {/* ✅ SINGLE INFO PAGE */}
          <DesktopLink to="/about" active={pathname === "/about"}>
            About
          </DesktopLink>

          {!isLoggedIn && (
            <>
              <DesktopLink to="/login" active={pathname === "/login"}>
                Login
              </DesktopLink>
              <DesktopLink to="/register" active={pathname === "/register"}>
                Register
              </DesktopLink>
            </>
          )}

          {isLoggedIn && (
            <>
              <DesktopLink to="/dashboard" active={pathname === "/dashboard"}>
                Dashboard
              </DesktopLink>

              <DesktopLink to="/my-posts" active={pathname === "/my-posts"}>
                My Posts
              </DesktopLink>

              {isAdmin && (
                <DesktopLink to="/admin" active={pathname === "/admin"}>
                  Admin
                </DesktopLink>
              )}

              {/* USER INFO */}
              <div className="flex items-center gap-2 ml-3">
                <span className="font-semibold text-gray-700">
                  {name || "User"}
                </span>
                {isAdmin && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-purple-100 text-purple-700">
                    ADMIN
                  </span>
                )}
              </div>

              <button
                onClick={logout}
                className="ml-3 px-4 py-2 rounded bg-red-500 text-white
                  hover:bg-red-600 hover:shadow-lg active:scale-95 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* HAMBURGER */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col gap-1.5"
        >
          <span className={`hamburger ${open ? "open" : ""}`} />
          <span className={`hamburger ${open ? "open" : ""}`} />
          <span className={`hamburger ${open ? "open" : ""}`} />
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300
          ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="bg-white border-t py-4 space-y-2 animate-fadeIn">

          <NavItem to="/about">About</NavItem>

          {!isLoggedIn && (
            <>
              <NavItem to="/login">Login</NavItem>
              <NavItem to="/register">Register</NavItem>
            </>
          )}

          {isLoggedIn && (
            <>
              <NavItem to="/dashboard">Dashboard</NavItem>
              <NavItem to="/my-posts">My Posts</NavItem>
              {isAdmin && <NavItem to="/admin">Admin</NavItem>}

              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-lg
                  text-red-600 hover:bg-red-50 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

/* DESKTOP LINK */
function DesktopLink({ to, children, active }) {
  return (
    <Link
      to={to}
      className={`relative px-3 py-2 font-medium transition
        ${active ? "text-blue-600" : "text-gray-700 hover:text-blue-600"}`}
    >
      {children}
      <span
        className={`absolute left-0 -bottom-1 h-0.5 bg-blue-600 transition-all
          ${active ? "w-full" : "w-0 hover:w-full"}`}
      />
    </Link>
  );
}
