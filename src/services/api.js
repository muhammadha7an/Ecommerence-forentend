const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

if (!configuredApiUrl) {
  throw new Error("VITE_API_URL is not configured");
}

const API_BASE_URL = configuredApiUrl.replace(/\/+$/, "");

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80";

/*
 * Resolves every image format stored in the database:
 *   https://… / data: / blob:           → used as-is (external URLs, local previews)
 *   /uploads/products/x.jpg, /uploads/x → served by the backend (uploaded files)
 *   prod-123.jpg, cat-123.jpg           → older uploads saved as a bare filename (backend)
 *   /images/x.jpg, x.jpg                → files in the frontend public/ folder
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== "string") {
    return FALLBACK_IMAGE;
  }

  const path = imagePath.trim();
  if (/^(https?:|data:|blob:)/i.test(path) || path.startsWith("//")) {
    return path;
  }

  const withoutSlash = path.replace(/^\/+/, "");
  if (withoutSlash.startsWith("uploads/")) {
    return `${API_BASE_URL}/${withoutSlash}`;
  }
  if (/^(prod|cat|product|category)-[\w-]+\.(jpe?g|png|webp|gif|svg)$/i.test(withoutSlash)) {
    return `${API_BASE_URL}/uploads/${withoutSlash}`;
  }

  return `/${withoutSlash}`;
};

export { API_BASE_URL };