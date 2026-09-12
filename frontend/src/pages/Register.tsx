import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register(fullName, email, password);

      navigate("/login");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Unable to create account.";

      setError(message);
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

          <h1>Join the CATRION Portal</h1>

          <p>
            Create your secure account and access
            authorized CATRION services.
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
            <h2>Create account</h2>

            <p>
              Enter your information to register.
            </p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">
                Full name
              </label>

              <input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                placeholder="name@example.com"
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
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                minLength={8}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirm password
              </label>

              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                minLength={8}
                required
              />
            </div>

            <button
              className="primary-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create account"}
            </button>
          </form>

          <div className="auth-bottom-text">
            Already have an account?{" "}
            <Link to="/login">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}