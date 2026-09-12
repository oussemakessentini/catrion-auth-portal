import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.fullName}</h1>
          <p>
            Manage your account and access CATRION services.
          </p>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <span>Account Status</span>
          <strong>Active</strong>
          <p>Your account is currently active.</p>
        </div>

        <div className="dashboard-card">
          <span>Security</span>
          <strong>JWT Protected</strong>
          <p>Your current session is authenticated.</p>
        </div>

        <div className="dashboard-card">
          <span>Access</span>
          <strong>Role Based</strong>
          <p>Portal access is controlled using RBAC.</p>
        </div>
      </div>
    </div>
  );
}