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
// 🧾 REGISTER MEDICINE (BACKEND → QR + BLOCKCHAIN)
//
export const registerMedicine = async (payload: {
  name: string;
  batchId: string;
  manufacturerName: string;
  licenseNo: string;
  quantity: number;
  manufactureDate: number;
  expiryDate: number;
  description: string;
}) => {
  return request("/medicine/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

//
// 🔍 GET MEDICINE BY BATCH ID (BLOCKCHAIN VIA BACKEND)
//
export const getMedicineByBatchId = async (batchId: string) => {
  return request(`/medicine/${batchId}`, {
    method: "GET",
  });
};

//
// 📊 GET MEDICINE HISTORY (BLOCKCHAIN)
//
export const getMedicineHistory = async (batchId: string) => {
  return request(`/medicine/history/${batchId}`, {
    method: "GET",
  });
};

//
// 🔐 VERIFY MEDICINE (BLOCKCHAIN)
//
export const verifyMedicine = async (payload: {
  batchId: string;
  qrHash?: string;
}) => {
  return request("/medicine/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};