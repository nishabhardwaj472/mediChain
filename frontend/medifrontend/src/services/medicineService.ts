import { getContract } from "@/blockchain/contract.js";

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
// 🧾 REGISTER MEDICINE (FRONTEND → BLOCKCHAIN → BACKEND)
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
  const contract = await getContract();

  // 🔐 generate QR hash same as backend (or move logic here fully)
  const qrDataString = JSON.stringify({
    batchId: payload.batchId,
    timestamp: Date.now(),
  });

  const encoder = new TextEncoder();
  const data = encoder.encode(qrDataString);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const qrHash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  const imageUrl = ""; // optional: generate here or let backend do it

  // 🧾 BLOCKCHAIN CALL (USER SIGNS)
  const tx = await contract.registerMedicine(
    payload.name,
    payload.batchId,
    payload.manufacturerName,
    payload.licenseNo,
    payload.quantity,
    payload.manufactureDate,
    payload.expiryDate,
    payload.description,
    qrHash,
    imageUrl
  );

  const receipt = await tx.wait();

  // 🏥 SEND TO BACKEND
  return request("/medicine/register", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      qrHash,
      qrDataString,
      txHash: receipt.hash,
    }),
  });
};

//
// 🚚 UPDATE SHIPMENT (FRONTEND → BLOCKCHAIN → BACKEND)
//
export const updateShipment = async (payload: {
  batchId: string;
  toAddress: string;
  location: string;
  status: string;
}) => {
  const contract = await getContract();

  const tx = await contract.updateShipment(
    payload.batchId,
    payload.toAddress,
    payload.location,
    payload.status
  );

  const receipt = await tx.wait();

  return request("/shipment/create", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      txHash: receipt.hash,
    }),
  });
};

//
// ✅ CONFIRM RECEIPT (FRONTEND → BLOCKCHAIN → BACKEND)
//
export const confirmReceipt = async (payload: {
  batchId: string;
  location: string;
}) => {
  const contract = await getContract();

  const tx = await contract.confirmReceipt(
    payload.batchId,
    payload.location
  );

  const receipt = await tx.wait();

  return request("/medicine/confirm-receipt", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      txHash: receipt.hash,
    }),
  });
};

//
// 🔍 GET MEDICINE (READ → BACKEND)
//
export const getMedicineByBatchId = async (batchId: string) => {
  return request(`/medicine/${batchId}`, {
    method: "GET",
  });
};

//
// 📊 GET HISTORY (READ → BACKEND)
//
export const getMedicineHistory = async (batchId: string) => {
  return request(`/medicine/history/${batchId}`, {
    method: "GET",
  });
};

//
// 🔐 VERIFY (DIRECT BLOCKCHAIN READ)
//
export const verifyMedicine = async (payload: {
  batchId: string;
  qrHash: string;
}) => {
  const contract = await getContract();

  const result = await contract.verifyMedicine(
    payload.batchId,
    payload.qrHash
  );

  return {
    isValid: result[0],
    isExpired: result[1],
    name: result[2],
    manufacturer: result[3],
    imageUrl: result[4],
  };
};

//
// 📊 GET DASHBOARD STATS (READ → BACKEND)
//
export const getDashboardStats = async () => {
  return request("/medicine/dashboard/stats", {
    method: "GET",
  });
};