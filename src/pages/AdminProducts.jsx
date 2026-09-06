import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import authService from "../services/authService";
import { getImageUrl } from "../services/api";
import { removeProductLocally } from "../redux/slices/productsSlice";

function AdminProducts() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState("");

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const [prodData, catData] = await Promise.all([
        authService.getProducts(),
        authService.getCategories(),
      ]);
      setProducts(prodData.products || []);
      setCategories(catData.categories || []);
      setError("");
    } catch (err) {
      if (err.response?.status === 401) {
        authService.logout();
        navigate("/admin/login");
        return;
      }
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat =
        categoryFilter === "all" ||
        p.category === categoryFilter ||
        String(p.categoryId) === String(categoryFilter);

      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [products, categoryFilter, search]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const targetId = deleteTarget._id || deleteTarget.id;
      await authService.deleteProduct(targetId);
      dispatch(removeProductLocally(targetId));
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== targetId));
      setFeedback(`Product "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
      setTimeout(() => setFeedback(""), 4000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <span className="dashboard-welcome">Catalog Management</span>
            <h1>Products ({products.length})</h1>
            <p>Add, edit, upload images, and manage store inventory</p>
          </div>

          <div className="dashboard-actions">
            <Link className="dashboard-view-btn" to="/admin/products/add">
              + Add New Product
            </Link>
          </div>
        </div>

        {feedback && <div className="alert-message success-message">{feedback}</div>}
        {error && <div className="dashboard-panel dashboard-error">{error}</div>}

        {/* Search & Filter Toolbar */}
        <div className="admin-toolbar-row">
          <div className="admin-search-input">
            <input
              type="text"
              placeholder="Search by product name or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="admin-filter-dropdowns">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id || c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="dashboard-loading">
            <div className="dashboard-spinner"></div>
            <p>Loading catalog products from database...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="dashboard-empty-panel">
            <div className="dashboard-empty-icon">🏷️</div>
            <h2>No products found</h2>
            <p>
              {products.length === 0
                ? "No products exist in the database yet."
                : "No products match your search/filter criteria."}
            </p>
            <Link className="dashboard-view-btn" to="/admin/products/add">
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="dashboard-panel order-table-wrap">
            <table className="dashboard-table admin-products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const prodId = product._id || product.id;
                  const img = getImageUrl(product.image);

                  return (
                    <tr key={prodId}>
                      <td>
                        <div className="table-product-cell">
                          <img
                            src={img}
                            alt={product.name}
                            className="product-table-thumb"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1544816155-12df9643f363?w=100&q=80";
                            }}
                          />
                          <div>
                            <strong>{product.name}</strong>
                            {product.isFeatured && (
                              <span className="badge-pill featured">Featured</span>
                            )}
                            {(product.isNew || product.isNewProduct) && (
                              <span className="badge-pill new">New</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{product.category || "Uncategorized"}</td>
                      <td>
                        <strong>${Number(product.price || 0).toFixed(2)}</strong>
                        {product.salePrice && (
                          <span className="sale-strike">
                            ${Number(product.salePrice).toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`stock-indicator ${
                            Number(product.stock) <= 5 ? "low" : "ok"
                          }`}
                        >
                          {product.stock ?? 10} units
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            product.inStock !== false && Number(product.stock) > 0
                              ? "delivered"
                              : "cancelled"
                          }`}
                        >
                          {product.inStock !== false && Number(product.stock) > 0
                            ? "In Stock"
                            : "Out of Stock"}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions-cell">
                          <Link
                            className="btn-action-edit"
                            to={`/admin/products/edit/${prodId}`}
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="btn-action-delete"
                            onClick={() => setDeleteTarget(product)}
                          >
                            Delete
                          </button>
                        </div>
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
              <h3>Delete Product</h3>
              <p>
                Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>?
                This action will remove it from the store catalog permanently.
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
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Yes, Delete Product"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProducts;

