import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";

export default function DashboardLayout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          CATRION
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard">
            Dashboard
          </NavLink>

          <NavLink to="/profile">
            Profile
          </NavLink>

          {hasRole("ROLE_ADMIN") && (
            <NavLink to="/admin/users">
                Users
            </NavLink>
          )}
        </nav>

        <button
          className="sidebar-logout"
          onClick={handleLogout}
        >
          Sign out
        </button>
      </aside>

      <div className="dashboard-main">
        <header className="topbar">
          <div>
            <h2>CATRION Access Portal</h2>
          </div>

          <div className="topbar-user">
            <div className="user-avatar">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user?.fullName}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}