import QRCode from "qrcode";

import { contract } from "../utils/blockchain.js"; // read-only
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { Medicine } from "../models/Medicine.model.js";
import { User } from "../models/User.model.js";

//
// ✅ REGISTER MEDICINE
//
export const registerMedicine = asyncHandler(async (req, res) => {
  const {
    name,
    batchId,
    manufacturerName,
    licenseNo,
    quantity,
    manufactureDate,
    expiryDate,
    description,
    qrHash,
    qrDataString,
    txHash,
  } = req.body;

  const user = req.user;

  if (user.role !== "manufacturer") {
    throw new ApiError(403, "Only manufacturers allowed");
  }

  if (!batchId || !name || !txHash) {
    throw new ApiError(400, "Required fields missing");
  }

  // 🔗 QR URL
  const verifyUrl = `http://localhost:5173/verify/${batchId}?hash=${qrHash}`;
  const imageUrl = await QRCode.toDataURL(verifyUrl);

  const medicine = await Medicine.create({
    name,
    batchId,
    manufacturerName,
    licenseNo,
    quantity,
    manufactureDate,
    expiryDate,
    description,
    manufacturer: user.walletAddress.toLowerCase(),
    currentHolder: user.walletAddress.toLowerCase(),
    ownerRole: "Manufacturer",
    qrHash,
    qrDataString,
    imageUrl,
    status: "Registered",
    history: [
      {
        from: "0x0000000000000000000000000000000000000000",
        to: user.walletAddress.toLowerCase(),
        location: "Manufacturer Facility",
        status: "Registered",
        timestamp: Math.floor(Date.now() / 1000),
        transactionHash: txHash,
      },
    ],
  });

  return res.status(200).json({
    success: true,
    data: { medicine, txHash, qrHash, imageUrl },
    message: "Medicine registered successfully",
  });
});

//
// ✅ GET MEDICINE (BLOCKCHAIN READ)
//
export const getMedicineByBatchId = asyncHandler(async (req, res) => {
  const { batchId } = req.params;

  const data = await contract.getMedicine(batchId);

  if (!data.exists) {
    throw new ApiError(404, "Medicine not found");
  }

  return res.status(200).json({
    success: true,
    data: {
      name: data.name,
      batchId: data.batchId,
      manufacturerName: data.manufacturerName,
      licenseNo: data.licenseNo,
      quantity: Number(data.quantity),
      manufactureDate: Number(data.manufactureDate),
      expiryDate: Number(data.expiryDate),
      description: data.description,
      manufacturer: data.manufacturer,
      qrHash: data.qrHash,
      imageUrl: data.imageUrl,
    },
    message: "Fetched from blockchain",
  });
});

//
// ✅ UPDATE SHIPMENT
//
export const updateShipment = asyncHandler(async (req, res) => {
  const { batchId, toAddress, location, status, txHash } = req.body;
  const user = req.user;

  if (!batchId || !toAddress || !location || !status || !txHash) {
    throw new ApiError(400, "All fields are required");
  }

  const medicine = await Medicine.findOne({ batchId });

  if (!medicine) {
    throw new ApiError(404, "Medicine not found");
  }

  // 🔍 Find receiver FIRST
  const receiver = await User.findOne({
    walletAddress: toAddress.toLowerCase(),
  });

  if (!receiver) {
    throw new ApiError(404, "Receiver not found");
  }

  if (
    receiver.role !== "distributor" &&
    receiver.role !== "pharmacy"
  ) {
    throw new ApiError(400, "Invalid receiver role");
  }

  // 🏥 Update DB
  medicine.status = "InTransit";

  medicine.history.push({
    from: user.walletAddress.toLowerCase(),
    to: receiver.walletAddress.toLowerCase(),
    location,
    status,
    timestamp: Math.floor(Date.now() / 1000),
    transactionHash: txHash,
  });

  medicine.currentHolder = receiver.walletAddress.toLowerCase();
  medicine.ownerRole =
    receiver.role === "pharmacy" ? "Pharmacy" : "Distributor";

  await medicine.save();

  return res.status(200).json({
    success: true,
    data: { txHash },
    message: "Shipment updated successfully",
  });
});

//
// ✅ CONFIRM RECEIPT
//
export const confirmReceipt = asyncHandler(async (req, res) => {
  const { batchId, location, txHash } = req.body;
  const user = req.user;

  // ✅ Basic validation
  if (!batchId || !location || !txHash) {
    throw new ApiError(400, "All fields are required");
  }

  const medicine = await Medicine.findOne({ batchId });

  if (!medicine) {
    throw new ApiError(404, "Medicine not found");
  }

  const userAddress = user.walletAddress.toLowerCase();

  // ✅ Prevent duplicate delivery (idempotent behavior)
  if (medicine.status === "Delivered") {
    return res.status(200).json({
      success: true,
      message: "Medicine already delivered",
      data: {
        txHash,
        status: medicine.status,
      },
    });
  }

  // ✅ Prevent same holder confirming again
  if (medicine.currentHolder === userAddress) {
    return res.status(200).json({
      success: true,
      message: "Already received by this user",
      data: {
        txHash,
        status: medicine.status,
      },
    });
  }

  // ✅ Optional: Only pharmacy should confirm
  if (user.role !== "pharmacy") {
    throw new ApiError(403, "Only pharmacy can confirm receipt");
  }

  // ✅ Update medicine state
  medicine.status = "Delivered";

  // ✅ Add history entry (safe + meaningful)
  medicine.history.push({
    from: medicine.currentHolder, // distributor
    to: userAddress,              // pharmacy
    location,
    status: "Delivered",
    timestamp: Math.floor(Date.now() / 1000),
    transactionHash: txHash,
  });

  // ✅ Update ownership
  medicine.currentHolder = userAddress;
  medicine.ownerRole = "Pharmacy";

  await medicine.save();

  return res.status(200).json({
    success: true,
    data: {
      txHash,
      batchId,
      status: "Delivered",
    },
    message: "Receipt confirmed successfully",
  });
});

//
// ✅ GET HISTORY (BLOCKCHAIN)
//
export const getMedicineHistory = asyncHandler(async (req, res) => {
  const { batchId } = req.params;

  const history = await contract.getHistory(batchId);

  const formatted = history.map((h) => ({
    from: h.from,
    to: h.to,
    location: h.location,
    timestamp: Number(h.timestamp),
    status: h.status,
  }));

  return res.status(200).json({
    success: true,
    data: formatted,
    message: "History fetched",
  });
});

//
// ✅ VERIFY MEDICINE
//
export const verifyMedicine = asyncHandler(async (req, res) => {
  const { batchId, qrHash } = req.body;

  const medicine = await Medicine.findOne({ batchId });

  if (!medicine) {
    return res.status(200).json({
      success: true,
      data: { isValid: false, reason: "Not found in DB" },
      message: "Medicine not registered",
    });
  }

  let isVerifiedOnChain = false;
  let isExpired = false;

  if (qrHash) {
    const result = await contract.verifyMedicine(batchId, qrHash);
    isVerifiedOnChain = result[0];
    isExpired = result[1];
  } else {
    const result = await contract.getMedicine(batchId);
    isVerifiedOnChain = result.exists;
    isExpired =
      Number(medicine.expiryDate) < Math.floor(Date.now() / 1000);
  }

  const isValid =
    isVerifiedOnChain &&
    (qrHash ? medicine.qrHash === qrHash : true);

  return res.status(200).json({
    success: true,
    data: {
      isValid,
      verifiedBy: qrHash ? "QR Code" : "Batch ID",
      batchId: medicine.batchId,
      name: medicine.name,
      manufacturer: medicine.manufacturerName,
      imageUrl: medicine.imageUrl,
      status: medicine.status,
      isExpired,
      expiryDate: medicine.expiryDate,
      manufactureDate: medicine.manufactureDate,
      currentHolder: medicine.currentHolder,
    },
    message: isValid ? "Verification successful" : "Verification failed",
  });
});

//
// 📊 GET DASHBOARD STATS
//
export const getDashboardStats = asyncHandler(async (req, res) => {
  const user = req.user;
  const walletAddress = user.walletAddress.toLowerCase();
  const role = user.role;

  let query = {};
  if (role === "manufacturer") {
    query = { manufacturer: walletAddress };
  } else if (role === "distributor" || role === "pharmacy") {
    query = { currentHolder: walletAddress };
  } else {
    // consumer or admin? for now empty
    query = { currentHolder: walletAddress };
  }

  // 1. Total Batches (Relevant to this user)
  const totalBatches = await Medicine.countDocuments(query);

  // 2. In Transit
  const inTransit = await Medicine.countDocuments({
    ...query,
    status: "InTransit",
  });

  // 3. Delivered / Verified
  const delivered = await Medicine.countDocuments({
    ...query,
    status: "Delivered",
  });

  // 4. Flagged (Expired)
  const now = Math.floor(Date.now() / 1000);
  const flagged = await Medicine.countDocuments({
    ...query,
    expiryDate: { $lt: now },
  });

  // 5. Recent Batches
  const recentBatches = await Medicine.find(query)
    .sort({ createdAt: -1 })
    .limit(3);

  return res.status(200).json({
    success: true,
    data: {
      stats: {
        totalBatches,
        inTransit,
        delivered,
        flagged,
      },
      recentBatches,
    },
    message: "Dashboard stats fetched successfully",
  });
});