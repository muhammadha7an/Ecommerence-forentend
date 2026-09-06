import axios from "axios";
import { API_BASE_URL } from "./api";

const API_URL = `${API_BASE_URL}/api/auth`;

const authHeaders = (isMultipart = false) => {
  const token = localStorage.getItem("token");
  const headers = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (isMultipart) {
    headers["Content-Type"] = "multipart/form-data";
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
const uploadImage = async (formData) => {
  const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
    headers: authHeaders(true),
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
  getAdminUsers,
  updateUserRole,
  deleteUser,
  getAdminOrders,
  getAdminOrder,
  updateAdminOrderStatus,
};

export default authService;