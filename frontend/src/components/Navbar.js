import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Menu,
  X,
  Search,
  Home,
  FileText,
  CheckCircle,
  Info,
  Shield
} from "lucide-react";

export default function Navbar() {

  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const accessToken = localStorage.getItem("accessToken");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const isLoggedIn = Boolean(accessToken);
  const isAdmin = user?.role === "admin";

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const logout = () => {

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });

  };

  const handleSearch = (e) => {

    e.preventDefault();

    if (!search.trim()) return;

    navigate(`/dashboard?search=${search}`);

  };

  return (

    <nav className="bg-white border-b sticky top-0 z-50">

      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* LOGO */}

        <Link
          to="/dashboard"
          className="text-xl font-extrabold tracking-wide"
        >
          <span className="text-blue-600">we</span>
          <span className="text-gray-900">FOUND</span>
          <span className="text-green-600">it</span>
        </Link>


        {/* SEARCH BAR */}

        {isLoggedIn && (

          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-1.5 w-64"
          >

            <Search size={16} className="text-gray-500 mr-2"/>

            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm w-full"
            />

          </form>

        )}


        {/* ICON NAVIGATION */}

        <div className="hidden md:flex items-center gap-3">

          <IconNav
            to="/dashboard"
            active={pathname === "/dashboard"}
            icon={<Home size={20}/>}
          />

          <IconNav
            to="/my-posts"
            active={pathname === "/my-posts"}
            icon={<FileText size={20}/>}
          />

          <IconNav
            to="/returned"
            active={pathname === "/returned"}
            icon={<CheckCircle size={20}/>}
          />

          <IconNav
            to="/about"
            active={pathname === "/about"}
            icon={<Info size={20}/>}
          />

          {isAdmin && (

            <IconNav
              to="/admin"
              active={pathname === "/admin"}
              icon={<Shield size={20}/>}
            />

          )}

        </div>


        {/* USER */}

        {isLoggedIn && (

          <div className="hidden md:flex items-center gap-3 ml-4">

            <span className="font-semibold text-gray-700">
              {user?.name}
            </span>

            {isAdmin && (

              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">
                ADMIN
              </span>

            )}

            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm transition"
            >
              Logout
            </button>

          </div>

        )}


        {/* MOBILE BUTTON */}

        <button
          onClick={()=>setOpen(!open)}
          className="md:hidden"
        >
          {open ? <X size={26}/> : <Menu size={26}/>}
        </button>

      </div>


      {/* MOBILE MENU */}

      {open && (

        <div className="md:hidden border-t">

          <MobileItem to="/dashboard" setOpen={setOpen}>Dashboard</MobileItem>
          <MobileItem to="/my-posts" setOpen={setOpen}>My Posts</MobileItem>
          <MobileItem to="/returned" setOpen={setOpen}>Returned</MobileItem>
          <MobileItem to="/about" setOpen={setOpen}>About</MobileItem>

          {isAdmin && (
            <MobileItem to="/admin" setOpen={setOpen}>Admin</MobileItem>
          )}

          <button
            onClick={logout}
            className="block w-full text-left px-6 py-3 text-red-600 hover:bg-red-50"
          >
            Logout
          </button>

        </div>

      )}

    </nav>

  );

}


/* ICON NAV ITEM */

function IconNav({ to, icon, active }) {

  return (

    <Link
      to={to}
      className={`p-2 rounded-lg transition
      ${active
        ? "bg-blue-100 text-blue-600"
        : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"}`}
    >

      {icon}

    </Link>

  );

}


/* MOBILE ITEM */

function MobileItem({ to, children, setOpen }) {

  return (

    <Link
      to={to}
      onClick={()=>setOpen(false)}
      className="block px-6 py-3 text-gray-700 hover:bg-gray-100"
    >

      {children}

    </Link>

  );

}