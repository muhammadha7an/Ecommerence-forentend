import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

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
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `${API_URL}/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

const updateProfile = async (userData) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `${API_URL}/profile`,
    userData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `${API_URL}/change-password`,
    passwordData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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

const authService = {
  signup,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
};

export default authService;