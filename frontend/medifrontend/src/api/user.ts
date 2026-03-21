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
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "API Error");
  }

  return data;
};

//
// 👤 GET USER BY WALLET ADDRESS
//
export const getUserByWallet = async (wallet: string) => {
  return request(`/users/by-wallet/${wallet}`, {
    method: "GET",
  });
};

//
// 👥 GET USERS BY ROLE (useful for dropdowns)
//
export const getUsersByRole = async (role: string) => {
  return request(`/users/by-role?role=${role}`, {
    method: "GET",
  });
};

//
// ⏳ GET PENDING USERS (for approval flow)
//
export const getPendingUsers = async () => {
  return request(`/users/pending`, {
    method: "GET",
  });
};

//
// ✅ APPROVE USER
//
export const approveUser = async (payload: {
  userId: string;
  txHash: string;
}) => {
  return request(`/users/approve`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};