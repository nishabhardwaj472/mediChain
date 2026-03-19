const BASE_URL = "http://localhost:3000/api/v1";

const getToken = () => localStorage.getItem("accessToken");

const request = async (endpoint: string, options: RequestInit = {}) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: getToken() ? `Bearer ${getToken()}` : "",
      ...(options.headers || {}),
    },
    credentials: "include", // important for cookies (refreshToken)
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

//
// 🔐 LOGIN
//
export const loginUser = async (payload: {
  email: string;
  password: string;
  walletAddress: string;
}) => {
  const res = await request("/users/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  localStorage.setItem("accessToken", res.data.accessToken);
  return res.data;
};

//
// 📝 REGISTER
//
export const registerUser = async (payload: {
  fullName: string;
  email: string;
  role: string;
  password: string;
  walletAddress: string;
}) => {
  return request("/users/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

//
// 🚪 LOGOUT
//
export const logoutUser = async () => {
  await request("/users/logout", {
    method: "POST",
  });

  localStorage.removeItem("accessToken");
};

//
// 👤 GET CURRENT USER
//
export const getCurrentUser = async () => {
  return request("/users/me", {
    method: "GET",
  });
};

//
// ✅ APPROVE USER (ADMIN FLOW)
//
export const approveUser = async (userId: string) => {
  return request("/users/approve", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
};

//
// ❌ REJECT USER
//
export const rejectUser = async (userId: string) => {
  return request("/users/reject", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
};

//
// 📊 GET USERS BY ROLE HIERARCHY
//
export const getUsersByHierarchy = async () => {
  return request("/users/hierarchy", {
    method: "GET",
  });
};

//
// 🔗 VERIFY USER ON BLOCKCHAIN
//
export const verifyUserOnChain = async (walletAddress: string) => {
  return request("/users/verify", {
    method: "POST",
    body: JSON.stringify({ walletAddress }),
  });
};