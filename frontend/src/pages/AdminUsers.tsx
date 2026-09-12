import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import type { AdminUser } from "../types/admin";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setError("");

      const response =
        await axiosClient.get<AdminUser[]>("/admin/users");

      setUsers(response.data);
    } catch {
      setError(
        "Unable to load users. You may not have permission."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleStatus = async (user: AdminUser) => {
    try {
      await axiosClient.patch(
        `/admin/users/${user.id}/status`,
        null,
        {
          params: {
            enabled: !user.enabled,
          },
        }
      );

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === user.id
            ? {
                ...currentUser,
                enabled: !currentUser.enabled,
              }
            : currentUser
        )
      );
    } catch {
      setError("Unable to update user status.");
    }
  };

  if (loading) {
    return <p>Loading users...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>User Management</h1>
        <p>
          Manage portal users and account access.
        </p>
      </div>

      {error && (
        <div className="profile-error">
          {error}
        </div>
      )}

      <div className="users-card">
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th className="actions-column">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="table-user">
                      <div className="table-avatar">
                        {user.fullName
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {user.fullName}
                        </strong>

                        <span>
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="role-list">
                      {user.roles.map((role) => (
                        <span
                          className="role-badge"
                          key={role}
                        >
                          {role.replace(
                            "ROLE_",
                            ""
                          )}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td>
                    <span
                      className={
                        user.enabled
                          ? "status-badge active"
                          : "status-badge disabled"
                      }
                    >
                      {user.enabled
                        ? "Active"
                        : "Disabled"}
                    </span>
                  </td>

                  <td className="actions-column">
                    <button
                      className={
                        user.enabled
                          ? "disable-button"
                          : "enable-button"
                      }
                      onClick={() =>
                        toggleStatus(user)
                      }
                    >
                      {user.enabled
                        ? "Disable"
                        : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}