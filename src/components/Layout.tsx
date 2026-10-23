import { useState } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import {
  Compass,
  Ticket,
  LayoutDashboard,
  CalendarDays,
  Bell,
  UserRound,
  LogOut,
  ArrowUpRight,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../auth";
import { ErrorNotice } from "./Feedback";
export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const links =
    user?.role === "ADMIN"
      ? [
          { to: "/admin", label: "Overview", icon: LayoutDashboard },
          { to: "/admin/events", label: "My events", icon: CalendarDays },
          { to: "/admin/reminders", label: "Reminders", icon: Bell },
        ]
      : user
        ? [{ to: "/bookings", label: "My bookings", icon: Ticket }]
        : [];
  async function signOut() {
    setBusy(true);
    try {
      await logout();
      navigate("/");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="app-shell">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <aside id="main-sidebar" className={open ? "sidebar open" : "sidebar"}>
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">g</span>gather
          <span className="brand-dot">.</span>
        </Link>
        <button
          className="mobile-close icon-button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        >
          <X />
        </button>
        <div className="nav-label">YOUR SPACE</div>
        <nav aria-label="Main navigation">
          <NavLink to="/" end onClick={() => setOpen(false)}>
            <Compass size={19} />
            Discover events
          </NavLink>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink to={to} end key={to} onClick={() => setOpen(false)}>
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
          {user && (
            <NavLink to="/profile" onClick={() => setOpen(false)}>
              <UserRound size={19} />
              My profile
            </NavLink>
          )}
        </nav>
        <div className="sidebar-note">
          <span>
            GOOD PEOPLE.
            <br />
            GREAT EXPERIENCES.
          </span>
          <p>
            A little time together
            <br />
            goes a long way.
          </p>
          <span className="note-star">✳</span>
        </div>
        <div className="account">
          {user ? (
            <>
              <span className="avatar">{user.name.charAt(0)}</span>
              <div>
                <strong>{user.name}</strong>
                <small>{user.role === "ADMIN" ? "Organizer" : "Member"}</small>
              </div>
              <button
                className="icon-button"
                aria-label="Sign out"
                disabled={busy}
                onClick={signOut}
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link to="/login">
              Your next experience awaits <ArrowUpRight size={18} />
            </Link>
          )}
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            aria-label="Open navigation"
            aria-expanded={open}
            aria-controls="main-sidebar"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>
          <span>Make room for something good.</span>
          <div>
            <Link to="/about">
              About Gather <ArrowUpRight size={14} />
            </Link>
            {!user && (
              <Link className="button small" to="/login">
                Sign in
              </Link>
            )}
            {user && (
              <span className="role-tag">
                {user.role === "ADMIN"
                  ? "Organizer workspace"
                  : "Member workspace"}
              </span>
            )}
          </div>
        </header>
        <main id="main">
          {error && <ErrorNotice message={error} />}
          <Outlet />
        </main>
        <footer>
          Gather · Event Management System{" "}
          <span>Made for moments that matter.</span>
        </footer>
      </div>
    </div>
  );
}
