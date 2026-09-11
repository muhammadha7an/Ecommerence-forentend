import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import authService from "../services/authService";
import { getImageUrl } from "../services/api";
import { removeProductLocally } from "../redux/slices/productsSlice";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import { getStockStatus, LOW_STOCK_LEVEL } from "../utils/commerce";

const STOCK_BADGE = {
  in: { label: "In Stock", tone: "success" },
  low: { label: "Low Stock", tone: "warning" },
  out: { label: "Out of Stock", tone: "danger" },
};

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
  const [deleteError, setDeleteError] = useState("");

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
    setDeleteError("");
    try {
      const targetId = deleteTarget._id || deleteTarget.id;
      await authService.deleteProduct(targetId);
      dispatch(removeProductLocally(targetId));
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== targetId));
      setFeedback(`Product "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
      setTimeout(() => setFeedback(""), 4000);
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  const lowStockCount = products.filter((p) => getStockStatus(p) === "low").length;
  const outOfStockCount = products.filter((p) => getStockStatus(p) === "out").length;

  return (
    <div className="console-page">
      {/* Header */}
      <div className="console-head">
        <div>
          <span className="console-head__eyebrow">Catalog management</span>
          <h1>
            Products <span className="console-count">{products.length}</span>
          </h1>
          <p>Add, edit, upload images and manage store inventory.</p>
        </div>

        <div className="console-head__actions">
          <Link className="ui-btn" to="/admin/products/add">
            <Icon name="plus" />
            Add New Product
          </Link>
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

      {!loading && products.length > 0 && (
        <div className="console-stats console-stats--3">
          <div className="console-stat">
            <div className="console-stat__top">
              <span>Total products</span>
              <span className="console-stat__icon"><Icon name="tag" /></span>
            </div>
            <strong className="console-stat__value">{products.length}</strong>
          </div>
          <div className="console-stat">
            <div className="console-stat__top">
              <span>Low stock ({LOW_STOCK_LEVEL} or fewer)</span>
              <span className="console-stat__icon console-stat__icon--warning"><Icon name="alertTriangle" /></span>
            </div>
            <strong className="console-stat__value">{lowStockCount}</strong>
          </div>
          <div className="console-stat">
            <div className="console-stat__top">
              <span>Out of stock</span>
              <span className="console-stat__icon console-stat__icon--clay"><Icon name="package" /></span>
            </div>
            <strong className="console-stat__value">{outOfStockCount}</strong>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="console-toolbar">
        <label className="ui-input-icon">
          <Icon name="search" />
          <span className="visually-hidden">Search products</span>
          <input
            type="search"
            className="ui-input"
            placeholder="Search by product name or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <select
          className="ui-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c._id || c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <div className="console-toolbar__spacer" />
        {!loading && (
          <span className="console-toolbar__meta">
            {filteredProducts.length} of {products.length} shown
          </span>
        )}
      </div>

      {loading ? (
        <div className="console-panel">
          <div className="ui-loading">
            <span className="ui-spinner ui-spinner--lg" aria-hidden="true"></span>
            <p>Loading catalog products from database...</p>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon="tag"
          title="No products found"
          text={
            products.length === 0
              ? "No products exist in the database yet."
              : "No products match your search or filter."
          }
        >
          <Link className="ui-btn" to="/admin/products/add">
            <Icon name="plus" />
            Add Your First Product
          </Link>
        </EmptyState>
      ) : (
        <div className="console-panel">
          <div className="console-table-wrap">
            <table className="console-table console-table--stack">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th className="is-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const prodId = product._id || product.id;
                  const img = getImageUrl(product.image);
                  const stockStatus = getStockStatus(product);
                  const badge = STOCK_BADGE[stockStatus];

                  return (
                    <tr key={prodId}>
                      <td className="is-primary" data-label="Product">
                        <div className="console-cell">
                          <img
                            src={img}
                            alt={product.name}
                            className="console-thumb"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1544816155-12df9643f363?w=100&q=80";
                            }}
                          />
                          <div className="console-cell__stack">
                            <strong>{product.name}</strong>
                            {(product.isFeatured || product.isNew || product.isNewProduct) && (
                              <span className="console-tags">
                                {product.isFeatured && <span className="ui-badge ui-badge--clay">Featured</span>}
                                {(product.isNew || product.isNewProduct) && (
                                  <span className="ui-badge ui-badge--info">New</span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td data-label="Category">{product.category || "Uncategorized"}</td>
                      <td data-label="Price" className="is-num">
                        <div className="console-cell__stack">
                          <strong>${Number(product.price || 0).toFixed(2)}</strong>
                          {product.salePrice && (
                            <span className="console-muted">Sale ${Number(product.salePrice).toFixed(2)}</span>
                          )}
                        </div>
                      </td>
                      <td data-label="Stock" className="is-num">
                        <span className={`admin-stock admin-stock--${stockStatus}`}>
                          {stockStatus !== "in" && <Icon name="alertTriangle" />}
                          {product.stock ?? 0} {Number(product.stock) === 1 ? "unit" : "units"}
                        </span>
                      </td>
                      <td data-label="Status">
                        <StatusBadge status={stockStatus} label={badge.label} tone={badge.tone} />
                      </td>
                      <td data-label="" className="is-right">
                        <div className="console-actions">
                          <Link
                            className="ui-btn ui-btn--secondary ui-btn--sm"
                            to={`/admin/products/edit/${prodId}`}
                          >
                            <Icon name="edit" />
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="ui-btn ui-btn--danger-soft ui-btn--sm ui-btn--icon"
                            onClick={() => {
                              setDeleteError("");
                              setDeleteTarget(product);
                            }}
                            aria-label={`Delete ${product.name}`}
                            title="Delete"
                          >
                            <Icon name="trash" />
                          </button>
                        </div>
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
          title="Delete product"
          subtitle="This action cannot be undone."
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
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="ui-spinner" aria-hidden="true"></span>
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete Product"
                )}
              </button>
            </>
          }
        >
          {deleteError && (
            <div className="ui-alert ui-alert--error" role="alert">
              <Icon name="alertCircle" />
              <span>{deleteError}</span>
            </div>
          )}
          <p>
            Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>? It will be removed from the
            store catalog permanently.
          </p>
        </Modal>
      )}
    </div>
  );
}

export default AdminProducts;
