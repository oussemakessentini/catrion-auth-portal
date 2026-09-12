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
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">CATRION</div>

          <span className="sidebar-subtitle">
            Access Portal
          </span>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? "sidebar-link active"
                : "sidebar-link"
            }
          >
            <span className="sidebar-link-icon">▦</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive
                ? "sidebar-link active"
                : "sidebar-link"
            }
          >
            <span className="sidebar-link-icon">●</span>
            <span>Profile</span>
          </NavLink>

          {hasRole("ROLE_ADMIN") && (
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
            >
              <span className="sidebar-link-icon">👥</span>
              <span>Users</span>
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-security">
            <span className="security-dot" />

            <div>
              <strong>Secure Session</strong>
              <span>JWT Protected</span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="topbar">
          <div className="topbar-title">
            <h1>CATRION Access Portal</h1>

            <p>
              Secure application access and account
              management
            </p>
          </div>

          <div className="topbar-user">
            <div className="user-avatar">
              {user?.fullName
                ?.charAt(0)
                .toUpperCase() || "U"}
            </div>

            <div className="topbar-user-info">
              <strong>
                {user?.fullName || "CATRION User"}
              </strong>

              <span>
                {user?.email || ""}
              </span>
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