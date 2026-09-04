
import axios from "axios";
import { API_BASE_URL } from "./api";

const API_URL = `${API_BASE_URL}/api/auth`;

const authHeaders = () => {
  const token = localStorage.getItem("token");

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

const signup = async (userData) => {
  const response = await axios.post(
    `${API_URL}/signup`,
    userData
  );

  return response.data;
};

const login = async (userData) => {
  const response = await axios.post(
    `${API_URL}/login`,
    userData
  );

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem(
      "user",
      JSON.stringify(response.data.user)
    );
  }

  return response.data;
};

const getMe = async () => {
  const response = await axios.get(
    `${API_URL}/me`,
    {
      headers: authHeaders(),
    }
  );

  return response.data;
};

const updateProfile = async (userData) => {
  const response = await axios.put(
    `${API_URL}/profile`,
    userData,
    {
      headers: authHeaders(),
    }
  );

  if (response.data.user) {
    localStorage.setItem(
      "user",
      JSON.stringify(response.data.user)
    );
  }

  return response.data;
};

const changePassword = async (passwordData) => {
  const response = await axios.put(
    `${API_URL}/change-password`,
    passwordData,
    {
      headers: authHeaders(),
    }
  );

  return response.data;
};

const forgotPassword = async (email) => {
  const response = await axios.post(
    `${API_URL}/forgot-password`,
    { email }
  );

  return response.data;
};

const resetPassword = async (token, password) => {
  const response = await axios.post(
    `${API_URL}/reset-password/${token}`,
    { password }
  );

  return response.data;
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

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

const getAdminOverview = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/admin/overview`, {
    headers: authHeaders(),
  });

  return response.data;
};

const getAdminUsers = async (search = "") => {
  const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
    headers: authHeaders(),
    params: search ? { search } : {},
  });

  return response.data;
};

const getAdminOrders = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/admin/orders`, {
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
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
  getOrders,
  getOrder,
  getAdminOverview,
  getAdminUsers,
  getAdminOrders,
  updateAdminOrderStatus,
};

export default authService;