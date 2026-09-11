import { useCallback, useEffect, useState, useMemo } from "react";
import authService from "../services/authService";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [actionError, setActionError] = useState("");

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
    setActionError("");
    try {
      const res = await authService.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setFeedback(res.message || "User role updated successfully");
      setTimeout(() => setFeedback(""), 3000);
    } catch (err) {
      setActionError(err.response?.data?.message || "Unable to update role");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const confirmDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setActionError("");
    try {
      await authService.deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setFeedback(`User "${deleteTarget.name}" was removed.`);
      setDeleteTarget(null);
      setTimeout(() => setFeedback(""), 3000);
    } catch (err) {
      setActionError(err.response?.data?.message || "Unable to delete user");
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

  const adminCount = users.filter((u) => u.role === "admin").length;
  const buyersCount = users.filter((u) => (u.orderCount || 0) > 0).length;

  return (
    <div className="console-page">
      {/* Header */}
      <div className="console-head">
        <div>
          <span className="console-head__eyebrow">Account directory</span>
          <h1>
            Registered users <span className="console-count">{users.length}</span>
          </h1>
          <p>Inspect customer accounts, order counts and administrator access.</p>
        </div>

        <div className="console-head__actions">
          <button type="button" className="ui-btn ui-btn--secondary" onClick={() => loadUsers("")}>
            <Icon name="refresh" />
            Refresh Users
          </button>
        </div>
      </div>

      {feedback && (
        <div className="ui-alert ui-alert--success" role="status">
          <Icon name="checkCircle" />
          <span>{feedback}</span>
        </div>
      )}
      {error && (
        <div className="ui-alert ui-alert--error" role="alert">
          <Icon name="alertCircle" />
          <span>{error}</span>
        </div>
      )}
      {actionError && !deleteTarget && (
        <div className="ui-alert ui-alert--error" role="alert">
          <Icon name="alertCircle" />
          <span>{actionError}</span>
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="console-stats console-stats--3">
          <div className="console-stat">
            <div className="console-stat__top">
              <span>Total accounts</span>
              <span className="console-stat__icon"><Icon name="users" /></span>
            </div>
            <strong className="console-stat__value">{users.length}</strong>
          </div>
          <div className="console-stat">
            <div className="console-stat__top">
              <span>Customers with orders</span>
              <span className="console-stat__icon console-stat__icon--success"><Icon name="bag" /></span>
            </div>
            <strong className="console-stat__value">{buyersCount}</strong>
          </div>
          <div className="console-stat">
            <div className="console-stat__top">
              <span>Administrators</span>
              <span className="console-stat__icon console-stat__icon--clay"><Icon name="shieldCheck" /></span>
            </div>
            <strong className="console-stat__value">{adminCount}</strong>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="console-toolbar">
        <label className="ui-input-icon">
          <Icon name="search" />
          <span className="visually-hidden">Search users</span>
          <input
            type="search"
            className="ui-input"
            placeholder="Search user name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {loading ? (
        <div className="console-panel">
          <div className="ui-loading">
            <span className="ui-spinner ui-spinner--lg" aria-hidden="true"></span>
            <p>Loading registered accounts...</p>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState icon="users" title="No users found" text="No customer accounts match your search." />
      ) : (
        <div className="console-panel">
          <div className="console-table-wrap">
            <table className="console-table console-table--stack">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Orders</th>
                  <th>Total spent</th>
                  <th>Registered</th>
                  <th className="is-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isCurrent =
                    String(user.id) === String(currentUser?.id || currentUser?._id);
                  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";

                  return (
                    <tr key={user.id}>
                      <td className="is-primary" data-label="User">
                        <div className="console-cell">
                          <span className={`console-avatar console-avatar--sm ${user.role === "admin" ? "console-avatar--ink" : ""}`}>
                            {initial}
                          </span>
                          <div className="console-cell__stack">
                            <strong>
                              {user.name} {isCurrent && <span className="console-muted">(You)</span>}
                            </strong>
                            <span className="console-muted">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Role">
                        <select
                          className="ui-select ui-select--sm"
                          style={{ width: "auto", minWidth: 110 }}
                          value={user.role || "user"}
                          disabled={isCurrent || updatingUserId === user.id}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          aria-label={`Role for ${user.name}`}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td data-label="Orders">
                        <span className="ui-badge ui-badge--sage">
                          {user.orderCount || 0} order(s)
                        </span>
                      </td>
                      <td data-label="Total spent" className="is-num">
                        <strong>${(user.totalSpent || 0).toFixed(2)}</strong>
                      </td>
                      <td data-label="Registered">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td data-label="" className="is-right">
                        {isCurrent ? (
                          <StatusBadge status="active" label="Active session" />
                        ) : (
                          <div className="console-actions">
                            <button
                              type="button"
                              className="ui-btn ui-btn--danger-soft ui-btn--sm"
                              onClick={() => {
                                setActionError("");
                                setDeleteTarget(user);
                              }}
                            >
                              <Icon name="trash" />
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <Modal
          title="Delete user account"
          subtitle="The user will no longer be able to sign in."
          icon="trash"
          locked={deleting}
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <button
                type="button"
                className="ui-btn ui-btn--secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ui-btn ui-btn--danger"
                onClick={confirmDeleteUser}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="ui-spinner" aria-hidden="true"></span>
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete User"
                )}
              </button>
            </>
          }
        >
          {actionError && (
            <div className="ui-alert ui-alert--error" role="alert">
              <Icon name="alertCircle" />
              <span>{actionError}</span>
            </div>
          )}
          <p>
            Are you sure you want to remove <strong>"{deleteTarget.name}"</strong> ({deleteTarget.email})?
          </p>
        </Modal>
      )}
    </div>
  );
}

export default AdminUsers;
