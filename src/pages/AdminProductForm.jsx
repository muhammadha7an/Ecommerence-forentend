import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import authService from "../services/authService";
import { getImageUrl } from "../services/api";
import {
  addProductLocally,
  updateProductLocally,
} from "../redux/slices/productsSlice";

function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    salePrice: "",
    category: "",
    stock: 10,
    inStock: true,
    image: "",
    isFeatured: false,
    isNew: false,
  });

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  // Load categories and product data if editing
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const catRes = await authService.getCategories();
        if (isMounted) {
          setCategories(catRes.categories || []);
          if (!isEditing && catRes.categories?.length > 0) {
            setForm((f) => ({ ...f, category: catRes.categories[0].name }));
          }
        }

        if (isEditing) {
          const prodRes = await authService.getProduct(id);
          const p = prodRes.product;
          if (isMounted && p) {
            setForm({
              name: p.name || "",
              description: p.description || "",
              price: p.price ?? "",
              salePrice: p.salePrice ?? "",
              category: p.category || "",
              stock: p.stock ?? 10,
              inStock: p.inStock !== false,
              image: p.image || "",
              isFeatured: Boolean(p.isFeatured),
              isNew: Boolean(p.isNew || p.isNewProduct),
            });
            setPreviewUrl(p.image || "");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to load product details");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "image") {
      setPreviewUrl(value);
    }
  };

  // Image Upload Handler
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localBlob = URL.createObjectURL(file);
    setPreviewUrl(localBlob);

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    setError("");

    try {
      const uploadRes = await authService.uploadImage(formData);
      if (uploadRes.success && uploadRes.url) {
        setForm((prev) => ({ ...prev, image: uploadRes.url }));
        setPreviewUrl(uploadRes.url);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Image upload failed. You can paste an image URL manually."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Product title is required.");
      return;
    }
    if (form.price === "" || Number(form.price) < 0) {
      setError("Please specify a valid price.");
      return;
    }
    if (!form.category) {
      setError("Please select a category.");
      return;
    }
    if (!form.image.trim()) {
      setError("Please upload a product image or enter an image URL.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        salePrice: form.salePrice !== "" ? Number(form.salePrice) : null,
        category: form.category,
        stock: Number(form.stock || 0),
        inStock: Boolean(form.inStock && Number(form.stock) > 0),
        image: form.image.trim(),
        isFeatured: form.isFeatured,
        isNew: form.isNew,
      };

      if (isEditing) {
        const res = await authService.updateProduct(id, payload);
        dispatch(updateProductLocally(res.product));
      } else {
        const res = await authService.createProduct(payload);
        dispatch(addProductLocally(res.product));
      }

      navigate("/admin/products");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <span className="dashboard-welcome">Catalog Editing</span>
            <h1>{isEditing ? `Edit Product` : `Add New Product`}</h1>
            <p>Fill in product attributes, inventory numbers, and upload photography</p>
          </div>

          <div className="dashboard-actions">
            <Link className="dashboard-outline-btn" to="/admin/products">
              ← Cancel & Back
            </Link>
          </div>
        </div>

        {error && <div className="alert-message error-message">{error}</div>}

        {/* Product Form Card */}
        <div className="dashboard-panel">
          <form className="admin-product-form" onSubmit={handleSubmit}>
            <div className="product-form-layout">
              {/* Left Column: Details */}
              <div className="form-col-details">
                <div className="form-group">
                  <label htmlFor="prod-name">Product Name *</label>
                  <input
                    id="prod-name"
                    type="text"
                    name="name"
                    placeholder="e.g. Minimalist Ceramic Vase"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="prod-description">Product Description</label>
                  <textarea
                    id="prod-description"
                    rows="4"
                    name="description"
                    placeholder="Describe product craftsmanship, materials, and dimensions..."
                    value={form.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label htmlFor="prod-price">Retail Price ($) *</label>
                    <input
                      id="prod-price"
                      type="number"
                      step="0.01"
                      min="0"
                      name="price"
                      placeholder="0.00"
                      value={form.price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="prod-saleprice">Sale Price ($ optional)</label>
                    <input
                      id="prod-saleprice"
                      type="number"
                      step="0.01"
                      min="0"
                      name="salePrice"
                      placeholder="0.00"
                      value={form.salePrice}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label htmlFor="prod-category">Category *</label>
                    <select
                      id="prod-category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category...</option>
                      {categories.map((c) => (
                        <option key={c._id || c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="prod-stock">Stock Quantity</label>
                    <input
                      id="prod-stock"
                      type="number"
                      min="0"
                      name="stock"
                      value={form.stock}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-checkbox-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="inStock"
                      checked={form.inStock}
                      onChange={handleChange}
                    />
                    <span>Available for purchase (In Stock)</span>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={form.isFeatured}
                      onChange={handleChange}
                    />
                    <span>Feature on Homepage Slider</span>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isNew"
                      checked={form.isNew}
                      onChange={handleChange}
                    />
                    <span>Display 'New' Badge</span>
                  </label>
                </div>
              </div>

              {/* Right Column: Image Upload & Preview */}
              <div className="form-col-media">
                <div className="media-upload-card">
                  <h3>Product Image *</h3>
                  <p>Upload a clean photo from your device or paste a URL</p>

                  {/* Image Preview Box */}
                  <div className="image-preview-box">
                    {previewUrl ? (
                      <img
                        src={getImageUrl(previewUrl)}
                        alt="Product preview"
                        onError={() => setPreviewUrl("")}
                      />
                    ) : (
                      <div className="preview-placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <span>No image selected</span>
                      </div>
                    )}
                  </div>

                  {/* File Upload Dropzone */}
                  <div className="upload-dropzone">
                    <label className="upload-file-button" htmlFor="product-file-input">
                      {uploading ? "Uploading to Server..." : "Choose File to Upload"}
                    </label>
                    <input
                      id="product-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={uploading}
                      style={{ display: "none" }}
                    />
                    <small className="upload-note">PNG, JPG, WEBP up to 5MB</small>
                  </div>

                  {/* Or Manual URL Input */}
                  <div className="manual-url-wrap">
                    <label htmlFor="prod-image-url">Or Image URL</label>
                    <input
                      id="prod-image-url"
                      type="text"
                      name="image"
                      placeholder="https://images.unsplash.com/... or /uploads/..."
                      value={form.image}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="form-submit-row">
              <Link to="/admin/products" className="dashboard-outline-btn">
                Cancel
              </Link>
              <button
                type="submit"
                className="dashboard-view-btn"
                disabled={saving || uploading}
              >
                {saving
                  ? "Saving Product..."
                  : isEditing
                  ? "Save Changes"
                  : "Publish Product to Store"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminProductForm;

