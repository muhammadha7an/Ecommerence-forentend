function AdminCatalogPlaceholder({ resource }) {
  return <div className="dashboard-page"><div className="dashboard-container"><div className="dashboard-header"><div><span className="dashboard-welcome">Admin panel</span><h1>{resource} management</h1><p>This catalog is currently provided by the frontend Redux store.</p></div></div><div className="dashboard-panel"><h2>Database migration required</h2><p>There is no backend {resource.toLowerCase()} model or API in the current application. Product and category CRUD should be introduced only after moving the existing Redux catalog to MongoDB, so customer browsing and checkout are not split across two sources of truth.</p></div></div></div>;
}

export default AdminCatalogPlaceholder;
