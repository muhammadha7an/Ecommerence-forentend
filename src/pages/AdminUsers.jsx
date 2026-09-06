import { useCallback, useEffect, useState, useMemo } from "react";
import authService from "../services/authService";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const loadUsers = useCallback(async (term = search) => {
    setLoading(true);
    try {
      const data = await authService.getAdminUsers(term);
      setUsers(data.users || []);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load users");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadUsers("");
  }, [loadUsers]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingUserId(userId);
    try {
      const res = await authService.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setFeedback(res.message || "User role updated successfully");
      setTimeout(() => setFeedback(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Unable to update role");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const confirmDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await authService.deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setFeedback(`User "${deleteTarget.name}" was removed.`);
      setDeleteTarget(null);
      setTimeout(() => setFeedback(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Unable to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <span className="dashboard-welcome">Account Directory</span>
            <h1>Registered Users ({users.length})</h1>
            <p>Inspect customer accounts, order counts, and administrative privileges</p>
          </div>

          <div className="dashboard-actions">
            <button className="dashboard-outline-btn" onClick={() => loadUsers("")}>
              Refresh Users
            </button>
          </div>
        </div>

        {feedback && <div className="alert-message success-message">{feedback}</div>}
        {error && <div className="dashboard-panel dashboard-error">{error}</div>}

        {/* Search */}
        <div className="admin-toolbar-row">
          <div className="admin-search-input">
            <input
              type="text"
              placeholder="Search user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="dashboard-loading">
            <div className="dashboard-spinner"></div>
            <p>Loading registered accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="dashboard-empty-panel">
            <div className="dashboard-empty-icon">👥</div>
            <h2>No users found</h2>
            <p>No customer accounts match your search query.</p>
          </div>
        ) : (
          <div className="dashboard-panel order-table-wrap">
            <table className="dashboard-table admin-users-table">
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Role</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Registration Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isCurrent =
                    String(user.id) === String(currentUser?.id || currentUser?._id);
                  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";

                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="table-product-cell">
                          <span className="user-avatar-circle small">{initial}</span>
                          <div>
                            <strong>
                              {user.name} {isCurrent && <span className="text-muted">(You)</span>}
                            </strong>
                            <br />
                            <small className="text-muted">{user.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          className="status-selector"
                          value={user.role || "user"}
                          disabled={isCurrent || updatingUserId === user.id}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <span className="badge-pill count-badge">
                          {user.orderCount || 0} order(s)
                        </span>
                      </td>
                      <td>
                        <strong>${(user.totalSpent || 0).toFixed(2)}</strong>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        {isCurrent ? (
                          <span className="text-muted">Active Session</span>
                        ) : (
                          <button
                            type="button"
                            className="btn-action-delete"
                            onClick={() => setDeleteTarget(user)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3>Delete User Account</h3>
              <p>
                Are you sure you want to remove <strong>"{deleteTarget.name}"</strong> (
                {deleteTarget.email})?
              </p>
              <div className="modal-actions">
                <button
                  type="button"
                  className="dashboard-outline-btn"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="dashboard-logout-btn"
                  onClick={confirmDeleteUser}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Yes, Delete User"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;
