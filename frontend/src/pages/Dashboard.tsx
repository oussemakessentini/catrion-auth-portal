import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "40px" }}>
      <h1>CATRION Dashboard</h1>

      <p>
        Welcome, {user?.fullName}
      </p>

      <p>
        {user?.email}
      </p>

      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
}