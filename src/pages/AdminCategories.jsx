import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import authService from "../services/authService";
import { getImageUrl } from "../services/api";
import {
  addCategoryLocally,
  updateCategoryLocally,
  removeCategoryLocally,
} from "../redux/slices/categoriesSlice";

function AdminCategories() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState("");

  // Modal states for Create / Edit
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [activeCategory, setActiveCategory] = useState({
    name: "",
    description: "",
    image: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authService.getCategories();
      setCategories(data.categories || []);
      setError("");
    } catch (err) {
      if (err.response?.status === 401) {
        authService.logout();
        navigate("/admin/login");
        return;
      }
      setError(err.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
  }, [categories, search]);

  const openCreateModal = () => {
    setActiveCategory({ name: "", description: "", image: "" });
    setFormError("");
    setModalMode("create");
  };

  const openEditModal = (cat) => {
    setActiveCategory({
      id: cat._id || cat.id,
      name: cat.name || "",
      description: cat.description || "",
      image: cat.image || "",
    });
    setFormError("");
    setModalMode("edit");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    setFormError("");
    try {
      const res = await authService.uploadImage(formData);
      if (res.success && res.url) {
        setActiveCategory((prev) => ({ ...prev, image: res.url }));
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Image upload failed. You can paste a URL."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!activeCategory.name.trim()) {
      setFormError("Category name is required.");
      return;
    }

    setSaving(true);
    try {
      if (modalMode === "create") {
        const res = await authService.createCategory({
          name: activeCategory.name.trim(),
          description: activeCategory.description.trim(),
          image: activeCategory.image.trim(),
        });
        dispatch(addCategoryLocally(res.category));
        setCategories((prev) => [...prev, res.category]);
        setFeedback(`Category "${res.category.name}" created successfully.`);
      } else {
        const catId = activeCategory.id;
        const res = await authService.updateCategory(catId, {
          name: activeCategory.name.trim(),
          description: activeCategory.description.trim(),
          image: activeCategory.image.trim(),
        });
        dispatch(updateCategoryLocally(res.category));
        setCategories((prev) =>
          prev.map((c) => ((c._id || c.id) === catId ? { ...c, ...res.category } : c))
        );
        setFeedback(`Category "${res.category.name}" updated successfully.`);
      }

      setModalMode(null);
      setTimeout(() => setFeedback(""), 4000);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const targetId = deleteTarget._id || deleteTarget.id;
      await authService.deleteCategory(targetId);
      dispatch(removeCategoryLocally(targetId));
      setCategories((prev) => prev.filter((c) => (c._id || c.id) !== targetId));
      setFeedback(`Category "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
      setTimeout(() => setFeedback(""), 4000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete category");
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
            <span className="dashboard-welcome">Catalog Organization</span>
            <h1>Categories ({categories.length})</h1>
            <p>Define product groupings, cover imagery, and storefront filters</p>
          </div>

          <div className="dashboard-actions">
            <button className="dashboard-view-btn" onClick={openCreateModal}>
              + Add New Category
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
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="dashboard-loading">
            <div className="dashboard-spinner"></div>
            <p>Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="dashboard-empty-panel">
            <div className="dashboard-empty-icon">📁</div>
            <h2>No categories found</h2>
            <p>Add your first category to start classifying items.</p>
            <button className="dashboard-view-btn" onClick={openCreateModal}>
              Create Category
            </button>
          </div>
        ) : (
          <div className="dashboard-panel order-table-wrap">
            <table className="dashboard-table admin-categories-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Linked Products</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat) => {
                  const catId = cat._id || cat.id;
                  const img = getImageUrl(cat.image);

                  return (
                    <tr key={catId}>
                      <td>
                        <div className="table-product-cell">
                          <img
                            src={img}
                            alt={cat.name}
                            className="product-table-thumb"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=100&q=80";
                            }}
                          />
                          <div>
                            <strong>{cat.name}</strong>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-muted">
                          {cat.description || "No description set"}
                        </span>
                      </td>
                      <td>
                        <span className="badge-pill count-badge">
                          {cat.productCount ?? "—"} products
                        </span>
                      </td>
                      <td>
                        <div className="table-actions-cell">
                          <button
                            type="button"
                            className="btn-action-edit"
                            onClick={() => openEditModal(cat)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-action-delete"
                            onClick={() => setDeleteTarget(cat)}
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

        {/* Add / Edit Category Modal */}
        {modalMode && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3>{modalMode === "create" ? "Create New Category" : "Edit Category"}</h3>

              {formError && <div className="alert-message error-message">{formError}</div>}

              <form onSubmit={handleSaveCategory} className="modal-form">
                <div className="form-group">
                  <label htmlFor="cat-name">Category Name *</label>
                  <input
                    id="cat-name"
                    type="text"
                    value={activeCategory.name}
                    onChange={(e) =>
                      setActiveCategory({ ...activeCategory, name: e.target.value })
                    }
                    placeholder="e.g. Living Room Decor"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cat-desc">Description</label>
                  <textarea
                    id="cat-desc"
                    rows="3"
                    value={activeCategory.description}
                    onChange={(e) =>
                      setActiveCategory({ ...activeCategory, description: e.target.value })
                    }
                    placeholder="Brief overview of items in this category..."
                  />
                </div>

                <div className="form-group">
                  <label>Category Cover Image</label>
                  <div className="image-preview-box mini">
                    {activeCategory.image ? (
                      <img
                        src={getImageUrl(activeCategory.image)}
                        alt="Preview"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    ) : (
                      <span className="text-muted">No image</span>
                    )}
                  </div>

                  <div className="upload-dropzone">
                    <label className="upload-file-button" htmlFor="cat-file-input">
                      {uploading ? "Uploading..." : "Upload Cover Image"}
                    </label>
                    <input
                      id="cat-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      style={{ display: "none" }}
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Or enter image URL..."
                    value={activeCategory.image}
                    onChange={(e) =>
                      setActiveCategory({ ...activeCategory, image: e.target.value })
                    }
                    style={{ marginTop: "8px" }}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="dashboard-outline-btn"
                    onClick={() => setModalMode(null)}
                    disabled={saving || uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="dashboard-view-btn"
                    disabled={saving || uploading}
                  >
                    {saving ? "Saving..." : "Save Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3>Delete Category</h3>
              <p>
                Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>?
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
                  {deleting ? "Deleting..." : "Yes, Delete Category"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCategories;

