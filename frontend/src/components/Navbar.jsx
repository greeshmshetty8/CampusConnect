/**
 * Navbar.jsx — the links at the top of every page.
 * Which links appear depends on whether somebody is logged in and on their role.
 */
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="bg-slate-900 text-white">
      <nav className="mx-auto max-w-5xl px-4 py-3 flex flex-wrap items-center gap-4">
        <Link to="/" className="font-bold text-lg mr-auto">
          CampusConnect
        </Link>
        <Link to="/events" className="hover:underline">
          Events
        </Link>
        {user && (
          <>
            <Link to="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link to="/my-registrations" className="hover:underline">
              My Registrations
            </Link>
          </>
        )}
        {user?.role === "admin" && (
          <Link to="/admin" className="hover:underline">
            Admin
          </Link>
        )}
        {user ? (
          <>
            <span className="text-slate-300 text-sm">Hi, {user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-amber-500 text-slate-900 px-3 py-1 rounded font-medium"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-amber-500 text-slate-900 px-3 py-1 rounded font-medium"
            >
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
