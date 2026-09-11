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
import Icon from "../components/Icon";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";

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
  const [deleteError, setDeleteError] = useState("");

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
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type) || file.size > 5 * 1024 * 1024) {
      setFormError("Please choose a JPG, PNG, WEBP or GIF image up to 5MB.");
      input.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    setFormError("");
    try {
      const res = await authService.uploadImage(formData, "categories");
      if (res.success && res.url) {
        setActiveCategory((prev) => ({ ...prev, image: res.url }));
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Image upload failed. You can paste a URL."
      );
    } finally {
      setUploading(false);
      input.value = "";
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
    setDeleteError("");
    try {
      const targetId = deleteTarget._id || deleteTarget.id;
      await authService.deleteCategory(targetId);
      dispatch(removeCategoryLocally(targetId));
      setCategories((prev) => prev.filter((c) => (c._id || c.id) !== targetId));
      setFeedback(`Category "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
      setTimeout(() => setFeedback(""), 4000);
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="console-page">
      {/* Header */}
      <div className="console-head">
        <div>
          <span className="console-head__eyebrow">Catalog organization</span>
          <h1>
            Categories <span className="console-count">{categories.length}</span>
          </h1>
          <p>Define product groupings, cover imagery and storefront filters.</p>
        </div>

        <div className="console-head__actions">
          <button type="button" className="ui-btn" onClick={openCreateModal}>
            <Icon name="plus" />
            Add New Category
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

      {/* Search */}
      <div className="console-toolbar">
        <label className="ui-input-icon">
          <Icon name="search" />
          <span className="visually-hidden">Search categories</span>
          <input
            type="search"
            className="ui-input"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {loading ? (
        <div className="console-panel">
          <div className="ui-loading">
            <span className="ui-spinner ui-spinner--lg" aria-hidden="true"></span>
            <p>Loading categories...</p>
          </div>
        </div>
      ) : filteredCategories.length === 0 ? (
        <EmptyState
          icon="folder"
          title="No categories found"
          text={categories.length === 0 ? "Add your first category to start organizing products." : "No categories match your search."}
        >
          <button type="button" className="ui-btn" onClick={openCreateModal}>
            <Icon name="plus" />
            Create Category
          </button>
        </EmptyState>
      ) : (
        <div className="console-panel">
          <div className="console-table-wrap">
            <table className="console-table console-table--stack">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Linked products</th>
                  <th className="is-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat) => {
                  const catId = cat._id || cat.id;
                  const img = getImageUrl(cat.image);

                  return (
                    <tr key={catId}>
                      <td className="is-primary" data-label="Category">
                        <div className="console-cell">
                          <img
                            src={img}
                            alt={cat.name}
                            className="console-thumb"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=100&q=80";
                            }}
                          />
                          <div className="console-cell__stack">
                            <strong>{cat.name}</strong>
                          </div>
                        </div>
                      </td>
                      <td data-label="Description" style={{ maxWidth: 360 }}>
                        <span className="console-muted" style={{ fontSize: "inherit" }}>
                          {cat.description || "No description set"}
                        </span>
                      </td>
                      <td data-label="Products">
                        <span className="ui-badge ui-badge--sage">
                          {cat.productCount ?? "—"} products
                        </span>
                      </td>
                      <td data-label="" className="is-right">
                        <div className="console-actions">
                          <button
                            type="button"
                            className="ui-btn ui-btn--secondary ui-btn--sm"
                            onClick={() => openEditModal(cat)}
                          >
                            <Icon name="edit" />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="ui-btn ui-btn--danger-soft ui-btn--sm ui-btn--icon"
                            onClick={() => {
                              setDeleteError("");
                              setDeleteTarget(cat);
                            }}
                            aria-label={`Delete ${cat.name}`}
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

      {/* Create / Edit modal */}
      {modalMode && (
        <Modal
          title={modalMode === "create" ? "Create new category" : "Edit category"}
          subtitle="Categories appear as filters and collections on the storefront."
          locked={saving || uploading}
          onClose={() => setModalMode(null)}
          footer={
            <>
              <button
                type="button"
                className="ui-btn ui-btn--secondary"
                onClick={() => setModalMode(null)}
                disabled={saving || uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="category-form"
                className="ui-btn"
                disabled={saving || uploading}
              >
                {saving ? (
                  <>
                    <span className="ui-spinner" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  "Save Category"
                )}
              </button>
            </>
          }
        >
          {formError && (
            <div className="ui-alert ui-alert--error" role="alert">
              <Icon name="alertCircle" />
              <span>{formError}</span>
            </div>
          )}

          <form id="category-form" onSubmit={handleSaveCategory} className="console-form-fields">
            <div className="ui-field">
              <label className="ui-label" htmlFor="cat-name">
                <span>Category name <span className="ui-required">*</span></span>
              </label>
              <input
                id="cat-name"
                className="ui-input"
                type="text"
                value={activeCategory.name}
                onChange={(e) =>
                  setActiveCategory({ ...activeCategory, name: e.target.value })
                }
                placeholder="e.g. Living Room Decor"
                required
              />
            </div>

            <div className="ui-field">
              <label className="ui-label" htmlFor="cat-desc">Description</label>
              <textarea
                id="cat-desc"
                className="ui-textarea"
                rows="3"
                value={activeCategory.description}
                onChange={(e) =>
                  setActiveCategory({ ...activeCategory, description: e.target.value })
                }
                placeholder="Brief overview of items in this category..."
              />
            </div>

            <div className="ui-field">
              <span className="ui-label">Cover image</span>
              <div className="console-uploader">
                <div className="console-uploader__preview console-uploader__preview--sm">
                  {activeCategory.image ? (
                    <img
                      src={getImageUrl(activeCategory.image)}
                      alt="Preview"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <div className="console-uploader__empty">
                      <Icon name="image" />
                      <span>No image</span>
                    </div>
                  )}
                </div>

                <label
                  className={`console-uploader__drop ${uploading ? "is-busy" : ""}`}
                  htmlFor="cat-file-input"
                >
                  {uploading ? <span className="ui-spinner" aria-hidden="true"></span> : <Icon name="upload" />}
                  {uploading ? "Uploading..." : "Upload cover image"}
                </label>
                <input
                  id="cat-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="visually-hidden"
                />

                <input
                  type="text"
                  className="ui-input"
                  placeholder="Or enter image URL..."
                  aria-label="Cover image URL"
                  value={activeCategory.image}
                  onChange={(e) =>
                    setActiveCategory({ ...activeCategory, image: e.target.value })
                  }
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <Modal
          title="Delete category"
          subtitle="Products keep their category text, but the category is removed from filters."
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
                  "Yes, Delete Category"
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
            Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>?
          </p>
        </Modal>
      )}
    </div>
  );
}

export default AdminCategories;
