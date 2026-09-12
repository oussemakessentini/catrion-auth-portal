import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-brand-panel">
        <div className="brand-content">

          <div className="brand-logo-text">
            CATRION
          </div>

          <h1>Welcome to CATRION</h1>

          <p>
            Secure access to your CATRION applications
            and services.
          </p>

          <div className="brand-footer">
            Secure • Reliable • Connected
          </div>

        </div>
      </div>

      <div className="auth-form-panel">

        <div className="auth-card">

          <div className="mobile-logo">
            CATRION
          </div>

          <div className="auth-header">
            <h2>Sign in</h2>

            <p>
              Enter your credentials to access the portal
            </p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                placeholder="name@catrion.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>

            <button
              className="primary-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>

          <div className="auth-bottom-text">
            Don't have an account?{" "}
            <Link to="/register">
              Create account
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}