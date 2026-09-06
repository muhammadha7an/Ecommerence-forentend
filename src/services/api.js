const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

if (!configuredApiUrl) {
  throw new Error("VITE_API_URL is not configured");
}

const API_BASE_URL = configuredApiUrl.replace(/\/+$/, "");

export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80";
  }
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${API_BASE_URL}${cleanPath}`;
};

export { API_BASE_URL };