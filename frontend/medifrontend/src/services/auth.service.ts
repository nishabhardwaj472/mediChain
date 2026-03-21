const BASE_URL = "http://localhost:3000/api/v1";

/* =====================================================
   TOKEN HANDLING
===================================================== */
const getToken = () => localStorage.getItem("accessToken");

const setToken = (token: string) => {
  localStorage.setItem("accessToken", token);
};

const removeToken = () => {
  localStorage.removeItem("accessToken");
};

/* =====================================================
   CORE REQUEST HANDLER
===================================================== */
const request = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        ...(options.headers || {}),
      },
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || "Network error");
  }
};

/* =====================================================
   AUTH APIs
===================================================== */

// 🔐 LOGIN
export const loginUser = async (payload: {
  email: string;
  password: string;
  walletAddress: string;
}) => {
  const res = await request("/users/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  setToken(res.data.accessToken);
  return res.data;
};

// 📝 REGISTER
export const registerUser = async (payload: {
  fullName: string;
  email: string;
  role: "manufacturer" | "distributor" | "pharmacy" | "consumer";
  password: string;
  walletAddress: string;
}) => {
  return request("/users/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// 🚪 LOGOUT
export const logoutUser = async () => {
  await request("/users/logout", {
    method: "POST",
  });

  removeToken();
};

/* =====================================================
   USER APIs
===================================================== */

// 👤 CURRENT USER
export const getCurrentUser = async () => {
  return request("/users/me", {
    method: "GET",
  });
};

/* =====================================================
   APPROVAL SYSTEM
===================================================== */

// 📊 GET PENDING USERS
export const getPendingUsers = async () => {
  return request("/users/pending-users", {
    method: "GET",
  });
};

// ✅ APPROVE USER (FIXED)
export const approveUser = async (
  userId: string,
  txHash: string
) => {
  if (!txHash) {
    throw new Error("Transaction hash is required");
  }

  return request("/users/approve", {
    method: "POST",
    body: JSON.stringify({ userId, txHash }),
  });
};

// ❌ REJECT USER
export const rejectUser = async (userId: string) => {
  return request("/users/reject", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
};

/* =====================================================
   BLOCKCHAIN
===================================================== */

// 🔗 VERIFY USER ON CHAIN
export const verifyUserOnChain = async (walletAddress: string) => {
  return request("/users/verify-onchain", {
    method: "POST",
    body: JSON.stringify({ walletAddress }),
  });
};