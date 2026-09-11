import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import authService from "../services/authService";
import { getImageUrl } from "../services/api";
import {
  addProductLocally,
  updateProductLocally,
} from "../redux/slices/productsSlice";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";
import { LOW_STOCK_LEVEL } from "../utils/commerce";

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
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
      setError("Please choose a JPG, PNG, WEBP or GIF image.");
      input.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image is too large. Maximum size is 5MB.");
      input.value = "";
      return;
    }

    // Show a local preview immediately; keep the current image until the upload succeeds.
    const previousImage = form.image;
    const localBlob = URL.createObjectURL(file);
    setPreviewUrl(localBlob);

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    setError("");

    try {
      const uploadRes = await authService.uploadImage(formData, "products");
      if (uploadRes.success && uploadRes.url) {
        setForm((prev) => ({ ...prev, image: uploadRes.url }));
        setPreviewUrl(uploadRes.url);
      } else {
        throw new Error("Upload did not return an image URL");
      }
    } catch (err) {
      setPreviewUrl(previousImage || "");
      setError(
        err.response?.data?.message ||
          "Image upload failed. You can paste an image URL manually."
      );
    } finally {
      URL.revokeObjectURL(localBlob);
      setUploading(false);
      input.value = "";
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
      <div className="console-page">
        <div className="ui-loading">
          <span className="ui-spinner ui-spinner--lg" aria-hidden="true"></span>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="console-page">
      {/* Header */}
      <div className="console-head">
        <div>
          <span className="console-head__eyebrow">Catalog editing</span>
          <h1>{isEditing ? "Edit product" : "Add new product"}</h1>
          <p>Fill in product details, inventory and photography.</p>
        </div>

        <div className="console-head__actions">
          <Link className="ui-btn ui-btn--secondary" to="/admin/products">
            <Icon name="arrowLeft" />
            Back to Products
          </Link>
        </div>
      </div>

      {error && (
        <div className="ui-alert ui-alert--error" role="alert">
          <Icon name="alertCircle" />
          <span>{error}</span>
        </div>
      )}

      <form className="console-form-stack" onSubmit={handleSubmit}>
        <div className="console-form-layout">
          {/* Left: details */}
          <div className="console-form-stack">
            <section className="console-panel">
              <div className="console-panel__head">
                <div>
                  <h2>Product details</h2>
                  <p>Name and description shown on the storefront.</p>
                </div>
              </div>
              <div className="console-panel__body console-form-fields">
                <div className="ui-field">
                  <label className="ui-label" htmlFor="prod-name">
                    <span>Product name <span className="ui-required">*</span></span>
                  </label>
                  <input
                    id="prod-name"
                    className="ui-input"
                    type="text"
                    name="name"
                    placeholder="e.g. Minimalist Ceramic Vase"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="ui-field">
                  <label className="ui-label" htmlFor="prod-description">Product description</label>
                  <textarea
                    id="prod-description"
                    className="ui-textarea"
                    rows="5"
                    name="description"
                    placeholder="Describe craftsmanship, materials and dimensions..."
                    value={form.description}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            <section className="console-panel">
              <div className="console-panel__head">
                <div>
                  <h2>Pricing &amp; inventory</h2>
                  <p>Prices are in US dollars.</p>
                </div>
              </div>
              <div className="console-panel__body console-form-fields">
                <div className="ui-form-grid">
                  <div className="ui-field">
                    <label className="ui-label" htmlFor="prod-price">
                      <span>Retail price ($) <span className="ui-required">*</span></span>
                    </label>
                    <input
                      id="prod-price"
                      className="ui-input"
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

                  <div className="ui-field">
                    <label className="ui-label" htmlFor="prod-saleprice">Sale price ($, optional)</label>
                    <input
                      id="prod-saleprice"
                      className="ui-input"
                      type="number"
                      step="0.01"
                      min="0"
                      name="salePrice"
                      placeholder="0.00"
                      value={form.salePrice}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="ui-field">
                    <label className="ui-label" htmlFor="prod-category">
                      <span>Category <span className="ui-required">*</span></span>
                    </label>
                    <select
                      id="prod-category"
                      className="ui-select"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select category...</option>
                      {categories.map((c) => (
                        <option key={c._id || c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="ui-field">
                    <label className="ui-label" htmlFor="prod-stock">Stock quantity</label>
                    <input
                      id="prod-stock"
                      className="ui-input"
                      type="number"
                      min="0"
                      name="stock"
                      value={form.stock}
                      onChange={handleChange}
                    />
                    <span className="ui-hint admin-stock-hint">
                      {form.stock === "" ? null : Number(form.stock) <= 0 ? (
                        <StatusBadge status="out" label="Out of Stock" tone="danger" />
                      ) : Number(form.stock) <= LOW_STOCK_LEVEL ? (
                        <StatusBadge status="low" label="Low Stock" tone="warning" />
                      ) : (
                        <StatusBadge status="in" label="In Stock" tone="success" />
                      )}
                      {LOW_STOCK_LEVEL} or fewer units are flagged as low stock. 0 units cannot be purchased.
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="console-panel">
              <div className="console-panel__head">
                <div>
                  <h2>Visibility</h2>
                  <p>Control how this product appears in the store.</p>
                </div>
              </div>
              <div className="console-panel__body console-switches">
                <label className="ui-check">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={form.inStock}
                    onChange={handleChange}
                  />
                  <span>Available for purchase</span>
                </label>
                <p className="ui-hint">
                  Products with 0 stock are always shown as out of stock. Saving with stock above 0 makes the
                  product available again.
                </p>

                <label className="ui-check">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={form.isFeatured}
                    onChange={handleChange}
                  />
                  <span>Feature on the homepage</span>
                </label>

                <label className="ui-check">
                  <input
                    type="checkbox"
                    name="isNew"
                    checked={form.isNew}
                    onChange={handleChange}
                  />
                  <span>Show the "New" badge</span>
                </label>
              </div>
            </section>
          </div>

          {/* Right: image */}
          <section className="console-panel">
            <div className="console-panel__head">
              <div>
                <h2>Product image <span className="ui-required">*</span></h2>
                <p>Upload a photo or paste an image URL.</p>
              </div>
            </div>
            <div className="console-panel__body console-uploader">
              <div className="console-uploader__preview">
                {previewUrl ? (
                  <img
                    src={getImageUrl(previewUrl)}
                    alt="Product preview"
                    onError={() => setPreviewUrl("")}
                  />
                ) : (
                  <div className="console-uploader__empty">
                    <Icon name="image" />
                    <span>No image selected</span>
                  </div>
                )}
              </div>

              <label
                className={`console-uploader__drop ${uploading ? "is-busy" : ""}`}
                htmlFor="product-file-input"
              >
                {uploading ? <span className="ui-spinner" aria-hidden="true"></span> : <Icon name="upload" />}
                {uploading ? "Uploading to server..." : "Choose file to upload"}
                <small>PNG, JPG, WEBP up to 5MB</small>
              </label>
              <input
                id="product-file-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageFileChange}
                disabled={uploading}
                className="visually-hidden"
              />

              <div className="ui-field">
                <label className="ui-label" htmlFor="prod-image-url">Or image URL</label>
                <input
                  id="prod-image-url"
                  className="ui-input"
                  type="text"
                  name="image"
                  placeholder="https://images.unsplash.com/... or /uploads/..."
                  value={form.image}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Submit bar */}
        <div className="console-form-actions">
          <Link to="/admin/products" className="ui-btn ui-btn--secondary">
            Cancel
          </Link>
          <button
            type="submit"
            className="ui-btn"
            disabled={saving || uploading}
          >
            {saving ? (
              <>
                <span className="ui-spinner" aria-hidden="true"></span>
                Saving product...
              </>
            ) : isEditing ? (
              <>
                <Icon name="check" />
                Save Changes
              </>
            ) : (
              <>
                <Icon name="plus" />
                Publish Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminProductForm;
