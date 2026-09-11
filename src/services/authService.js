import axios from "axios";
import { API_BASE_URL } from "./api";

const API_URL = `${API_BASE_URL}/api/auth`;

const authHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

const signup = async (userData) => {
  const response = await axios.post(`${API_URL}/signup`, userData);
  return response.data;
};

const login = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }

  return response.data;
};

const adminLogin = async (credentials) => {
  const response = await axios.post(`${API_URL}/admin-login`, credentials);

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }

  return response.data;
};

const getMe = async () => {
  const response = await axios.get(`${API_URL}/me`, {
    headers: authHeaders(),
  });

  return response.data;
};

const updateProfile = async (userData) => {
  const response = await axios.put(`${API_URL}/profile`, userData, {
    headers: authHeaders(),
  });

  if (response.data.user) {
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }

  return response.data;
};

const changePassword = async (passwordData) => {
  const response = await axios.put(`${API_URL}/change-password`, passwordData, {
    headers: authHeaders(),
  });

  return response.data;
};

const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email });
  return response.data;
};

const resetPassword = async (token, password) => {
  const response = await axios.post(`${API_URL}/reset-password/${token}`, {
    password,
  });
  return response.data;
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Customer Orders
const getOrders = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/orders`, {
    headers: authHeaders(),
  });
  return response.data;
};

const getOrder = async (orderId) => {
  const response = await axios.get(`${API_BASE_URL}/api/orders/${orderId}`, {
    headers: authHeaders(),
  });
  return response.data;
};

// Products Catalog API
const getProducts = async (params = {}) => {
  const response = await axios.get(`${API_BASE_URL}/api/products`, {
    params,
  });
  return response.data;
};

const getProduct = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/api/products/${id}`);
  return response.data;
};

const createProduct = async (productData) => {
  const response = await axios.post(`${API_BASE_URL}/api/products`, productData, {
    headers: authHeaders(),
  });
  return response.data;
};

const updateProduct = async (id, productData) => {
  const response = await axios.put(`${API_BASE_URL}/api/products/${id}`, productData, {
    headers: authHeaders(),
  });
  return response.data;
};

const deleteProduct = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/api/products/${id}`, {
    headers: authHeaders(),
  });
  return response.data;
};

// Categories Catalog API
const getCategories = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/categories`);
  return response.data;
};

const getCategory = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/api/categories/${id}`);
  return response.data;
};

const createCategory = async (categoryData) => {
  const response = await axios.post(`${API_BASE_URL}/api/categories`, categoryData, {
    headers: authHeaders(),
  });
  return response.data;
};

const updateCategory = async (id, categoryData) => {
  const response = await axios.put(`${API_BASE_URL}/api/categories/${id}`, categoryData, {
    headers: authHeaders(),
  });
  return response.data;
};

const deleteCategory = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/api/categories/${id}`, {
    headers: authHeaders(),
  });
  return response.data;
};

// Image Upload API
// folder: "products" | "categories" — decides where the backend stores the file
const uploadImage = async (formData, folder = "products") => {
  const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
    headers: authHeaders(),
    params: { folder },
  });
  return response.data;
};

// Admin Overview & Analytics
const getAdminOverview = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/admin/overview`, {
    headers: authHeaders(),
  });
  return response.data;
};

const getAdminAnalytics = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/admin/analytics`, {
    headers: authHeaders(),
  });
  return response.data;
};


const getAdminDailyEarnings = async (days = 7) => {
  const response = await axios.get(
    `${API_BASE_URL}/api/admin/daily-earnings`,
    {
      headers: authHeaders(),
      params: { days },
    }
  );

  return response.data;
};

// Admin Users Management
const getAdminUsers = async (search = "") => {
  const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
    headers: authHeaders(),
    params: search ? { search } : {},
  });
  return response.data;
};

const updateUserRole = async (userId, role) => {
  const response = await axios.patch(
    `${API_BASE_URL}/api/admin/users/${userId}/role`,
    { role },
    { headers: authHeaders() }
  );
  return response.data;
};

const deleteUser = async (userId) => {
  const response = await axios.delete(`${API_BASE_URL}/api/admin/users/${userId}`, {
    headers: authHeaders(),
  });
  return response.data;
};

// Admin Orders Management
const getAdminOrders = async (params = {}) => {
  const response = await axios.get(`${API_BASE_URL}/api/admin/orders`, {
    headers: authHeaders(),
    params,
  });
  return response.data;
};

const getAdminOrder = async (orderId) => {
  const response = await axios.get(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
    headers: authHeaders(),
  });
  return response.data;
};

const updateAdminOrderStatus = async (orderId, orderStatus) => {
  const response = await axios.patch(
    `${API_BASE_URL}/api/admin/orders/${orderId}/status`,
    { orderStatus },
    { headers: authHeaders() }
  );
  return response.data;
};

// Newsletter Subscription (public)
const subscribeNewsletter = async (email, source = "website") => {
  const response = await axios.post(`${API_BASE_URL}/api/subscribers`, {
    email,
    source,
  });
  return response.data;
};

// Admin Newsletter Subscribers
const getAdminSubscribers = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/admin/subscribers`, {
    headers: authHeaders(),
  });
  return response.data;
};

// Public store settings (shipping rules)
const getStoreSettings = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/settings/public`);
  return response.data;
};

// Contact form
const submitContact = async (payload) => {
  const response = await axios.post(`${API_BASE_URL}/api/contact`, payload);
  return response.data;
};

// Admin settings
const getAdminSettings = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/admin/settings`, {
    headers: authHeaders(),
  });
  return response.data;
};

const updateAdminSettings = async (payload) => {
  const response = await axios.put(`${API_BASE_URL}/api/admin/settings`, payload, {
    headers: authHeaders(),
  });
  return response.data;
};

// Admin profile (name / email / password). A password change returns a fresh token.
const updateAdminProfile = async (payload) => {
  const response = await axios.put(`${API_BASE_URL}/api/admin/profile`, payload, {
    headers: authHeaders(),
  });

  if (response.data?.token) {
    localStorage.setItem("token", response.data.token);
  }
  if (response.data?.user) {
    const stored = JSON.parse(localStorage.getItem("user") || "null") || {};
    localStorage.setItem("user", JSON.stringify({ ...stored, ...response.data.user }));
  }

  return response.data;
};

// Admin contact messages
const getAdminContactMessages = async (params = {}) => {
  const response = await axios.get(`${API_BASE_URL}/api/admin/contact-messages`, {
    headers: authHeaders(),
    params,
  });
  return response.data;
};

const updateContactMessageStatus = async (id, status) => {
  const response = await axios.patch(
    `${API_BASE_URL}/api/admin/contact-messages/${id}`,
    { status },
    { headers: authHeaders() }
  );
  return response.data;
};

const deleteContactMessage = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/api/admin/contact-messages/${id}`, {
    headers: authHeaders(),
  });
  return response.data;
};

const authService = {
  signup,
  login,
  adminLogin,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
  getOrders,
  getOrder,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadImage,
  getAdminOverview,
  getAdminAnalytics,
  getAdminDailyEarnings,
  getAdminUsers,
  updateUserRole,
  deleteUser,
  getAdminOrders,
  getAdminOrder,
  updateAdminOrderStatus,
  subscribeNewsletter,
  getAdminSubscribers,
  getStoreSettings,
  submitContact,
  getAdminSettings,
  updateAdminSettings,
  updateAdminProfile,
  getAdminContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
};

export default authService;