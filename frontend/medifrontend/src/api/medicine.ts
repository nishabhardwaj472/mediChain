import { getContract } from "../blockchain/contract.js";

const BASE_URL = "http://localhost:3000/api/v1";

// 🔐 Token helper
const getToken = () => localStorage.getItem("accessToken");

// 🌐 Common request handler
const request = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Invalid server response");
  }

  if (!res.ok) {
    throw new Error(data.message || "API Error");
  }

  return data;
};

//
// 🚚 UPDATE SHIPMENT
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
// ✅ CONFIRM RECEIPT
//
export const confirmReceipt = async (data: {
  batchId: string;
  location: string;
  txHash: string;
}) => {
  return request("/medicine/confirm-receipt", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

//
// 🧾 REGISTER MEDICINE
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

  // 🔐 Generate QR Hash
  const qrDataString = JSON.stringify({
    batchId: payload.batchId,
    timestamp: Date.now(),
  });

  const encoder = new TextEncoder();
  const data = encoder.encode(qrDataString);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const qrHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const imageUrl = "";

  // 🔗 Blockchain call
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
// 🔍 GET MEDICINE
//
export const getMedicineByBatchId = async (batchId: string) => {
  return request(`/medicine/${batchId}`);
};

//
// 📊 GET HISTORY
//
export const getMedicineHistory = async (batchId: string) => {
  return request(`/medicine/history/${batchId}`);
};

//
// 🔎 VERIFY MEDICINE
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