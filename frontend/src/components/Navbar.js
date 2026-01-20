import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    setOpen(false);
    navigate("/login");
  };

  const NavItem = ({ to, children }) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className={`block px-4 py-2 text-lg font-medium transition
        ${
          location.pathname === to
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

        {/* Logo */}
        <Link
  to="/"
  className="text-2xl font-extrabold tracking-wide hover:scale-105 transition-transform"
>
  <span className="text-blue-600">we</span>
  <span className="text-gray-900">FOUND</span>
  <span className="text-green-600">it</span>
</Link>


        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          {!isLoggedIn && (
            <>
              <DesktopLink to="/login" active={location.pathname === "/login"}>
                Login
              </DesktopLink>
              <DesktopLink to="/register" active={location.pathname === "/register"}>
                Register
              </DesktopLink>
            </>
          )}

          {isLoggedIn && (
            <>
              <DesktopLink to="/" active={location.pathname === "/"}>
                Dashboard
              </DesktopLink>
              <DesktopLink to="/admin" active={location.pathname === "/admin"}>
                Admin
              </DesktopLink>

              <button
                onClick={logout}
                className="ml-2 px-4 py-2 rounded bg-red-500 text-white
                  hover:bg-red-600 hover:shadow-lg active:scale-95 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col gap-1.5"
        >
          <span className={`hamburger ${open ? "open" : ""}`} />
          <span className={`hamburger ${open ? "open" : ""}`} />
          <span className={`hamburger ${open ? "open" : ""}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300
          ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="bg-white border-t py-4 space-y-2 animate-fadeIn">
          {!isLoggedIn && (
            <>
              <NavItem to="/login">Login</NavItem>
              <NavItem to="/register">Register</NavItem>
            </>
          )}

          {isLoggedIn && (
            <>
              <NavItem to="/">Dashboard</NavItem>
              <NavItem to="/admin">Admin</NavItem>

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

/* Desktop link with underline animation */
function DesktopLink({ to, children, active }) {
  return (
    <Link
      to={to}
      className={`relative px-3 py-2 font-medium transition
        ${
          active
            ? "text-blue-600"
            : "text-gray-700 hover:text-blue-600"
        }`}
    >
      {children}
      <span
        className={`absolute left-0 -bottom-1 h-0.5 bg-blue-600 transition-all duration-300
          ${active ? "w-full" : "w-0 hover:w-full"}`}
      />
    </Link>
  );
}
