import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import type { Profile as ProfileType } from "../types/profile";

export default function Profile() {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response =
          await axiosClient.get<ProfileType>("/user/profile");

        setProfile(response.data);
      } catch {
        setError("Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (error) {
    return <div className="profile-error">{error}</div>;
  }

  if (!profile) {
    return null;
  }

  return (
    <div>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>
          View your account information and access details.
        </p>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          {profile.fullName.charAt(0).toUpperCase()}
        </div>

        <div className="profile-main-info">
          <h2>{profile.fullName}</h2>
          <p>{profile.email}</p>

          <span
            className={
              profile.enabled
                ? "status-badge active"
                : "status-badge disabled"
            }
          >
            {profile.enabled ? "Active" : "Disabled"}
          </span>
        </div>

        <div className="profile-details">
          <div>
            <span>User ID</span>
            <strong>{profile.id}</strong>
          </div>

          <div>
            <span>Email</span>
            <strong>{profile.email}</strong>
          </div>

          <div>
            <span>Account Status</span>
            <strong>
              {profile.enabled ? "Active" : "Disabled"}
            </strong>
          </div>

          <div>
            <span>Roles</span>

            <div className="role-list">
              {profile.roles.map((role) => (
                <span
                  className="role-badge"
                  key={role}
                >
                  {role.replace("ROLE_", "")}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}