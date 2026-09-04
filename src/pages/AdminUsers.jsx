import { useCallback, useEffect, useState } from "react";
import authService from "../services/authService";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (term = search) => {
    setLoading(true);
    try { const data = await authService.getAdminUsers(term); setUsers(data.users || []); setError(""); }
    catch (requestError) { setError(requestError.response?.data?.message || "Unable to load users"); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(""); }, [load]);

  return <div className="dashboard-page"><div className="dashboard-container"><div className="dashboard-header"><div><span className="dashboard-welcome">Admin panel</span><h1>Users</h1><p>Customer accounts and roles.</p></div><form onSubmit={(event) => { event.preventDefault(); load(); }}><input aria-label="Search users" placeholder="Search name or email" value={search} onChange={(event) => setSearch(event.target.value)} /></form></div>{error && <div className="dashboard-panel dashboard-error">{error}</div>}{loading ? <div className="dashboard-panel">Loading users...</div> : <div className="dashboard-panel order-table-wrap"><table className="dashboard-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Registration date</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td>{user.role}</td><td>{new Date(user.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>}</div></div>;
}

export default AdminUsers;
