import crypto from "crypto";
import QRCode from "qrcode";

import { contract } from "../utils/blockchain.js"; // ONLY for read
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { Medicine } from "../models/Medicine.model.js";

//
// ✅ REGISTER MEDICINE (NO BLOCKCHAIN WRITE HERE)
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

  if (!txHash) {
    throw new ApiError(400, "Transaction hash required");
  }

  // 🔗 Generate verify URL
  const verifyUrl = `http://localhost:5173/verify/${batchId}?hash=${qrHash}`;
  const imageUrl = await QRCode.toDataURL(verifyUrl);

  // 🏥 SAVE TO DB
  const medicine = await Medicine.create({
    name,
    batchId,
    manufacturerName,
    licenseNo,
    quantity,
    manufactureDate,
    expiryDate,
    description,
    manufacturer: user.walletAddress,
    currentHolder: user.walletAddress,
    ownerRole: "Manufacturer",
    qrHash,
    qrDataString,
    imageUrl,
    status: "Registered",
    history: [
      {
        from: "0x0000000000000000000000000000000000000000",
        to: user.walletAddress,
        location: "Manufacturer Facility",
        status: "Registered",
        timestamp: Math.floor(Date.now() / 1000),
        transactionHash: txHash,
      },
    ],
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        txHash,
        qrHash,
        imageUrl,
        medicine,
      },
      "Medicine registered successfully"
    )
  );
});

//
// ✅ GET MEDICINE (FROM BLOCKCHAIN - READ ONLY)
//
export const getMedicineByBatchId = asyncHandler(async (req, res) => {
  const { batchId } = req.params;

  const data = await contract.getMedicine(batchId);

  if (!data.exists) {
    throw new ApiError(404, "Medicine not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
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
      "Fetched from blockchain"
    )
  );
});

//
// ✅ UPDATE SHIPMENT (NO BLOCKCHAIN WRITE HERE)
//
export const updateShipment = asyncHandler(async (req, res) => {
  const { batchId, toAddress, location, status, txHash } = req.body;
  const user = req.user;

  if (!txHash) {
    throw new ApiError(400, "Transaction hash required");
  }

  const medicine = await Medicine.findOne({ batchId });

  if (!medicine) {
    throw new ApiError(404, "Medicine not found");
  }

  // 🏥 UPDATE DB
  medicine.status = "InTransit";

  medicine.history.push({
    from: user.walletAddress,
    to: receiver.walletAddress,
    location,
    status,
    timestamp: Math.floor(Date.now() / 1000),
    transactionHash: txHash,
  });

  // 🔍 Find receiver user
  const receiver = await User.findOne({
    walletAddress: toAddress.toLowerCase(),
  });

  if (!receiver) {
    throw new ApiError(404, "Receiver wallet not registered");
  }

  // ❌ Prevent invalid role flow
  if (
    receiver.role !== "distributor" &&
    receiver.role !== "pharmacy"
  ) {
    throw new ApiError(400, "Invalid receiver role");
  }

  // 🏥 Update medicine
  medicine.currentHolder = receiver.walletAddress;

  // Optional: track role
  medicine.ownerRole =
    receiver.role === "pharmacy" ? "Pharmacy" : "Distributor";

  await medicine.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { txHash },
      "Shipment updated successfully"
    )
  );
});

//
// ✅ CONFIRM RECEIPT (NO BLOCKCHAIN WRITE HERE)
//
export const confirmReceipt = asyncHandler(async (req, res) => {
  const { batchId, location, txHash } = req.body;
  const user = req.user;

  if (!txHash) {
    throw new ApiError(400, "Transaction hash required");
  }

  const medicine = await Medicine.findOne({ batchId });

  if (!medicine) {
    throw new ApiError(404, "Medicine not found");
  }

  // 🏥 UPDATE DB
  medicine.status = "Delivered";

  medicine.history.push({
    from: medicine.currentHolder, // previous holder
    to: user.walletAddress,
    location,
    status: "Delivered",
    timestamp: Math.floor(Date.now() / 1000),
    transactionHash: txHash,
  });

  medicine.currentHolder = user.walletAddress;
  medicine.ownerRole = user.role === "pharmacy" ? "Pharmacy" : "Distributor";

  await medicine.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { txHash },
      "Receipt confirmed successfully"
    )
  );
});

//
// ✅ GET HISTORY (FROM BLOCKCHAIN)
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

  return res.status(200).json(
    new ApiResponse(200, formatted, "History fetched")
  );
});

//
// ✅ VERIFY MEDICINE (BLOCKCHAIN READ)
//
export const verifyMedicine = asyncHandler(async (req, res) => {
  const { batchId, qrHash } = req.body;

  // 1️⃣ CHECK BACKEND DB
  const medicine = await Medicine.findOne({ batchId });
  if (!medicine) {
    return res.status(200).json(
      new ApiResponse(
        200,
        { isValid: false, reason: "Not found in database" },
        "Medicine not registered on backend"
      )
    );
  }

  // 2️⃣ CHECK BLOCKCHAIN
  let isVerifiedOnChain = false;
  let isExpired = false;

  if (qrHash) {
    // QR Scan: Secure verification with hash
    const blockchainResult = await contract.verifyMedicine(batchId, qrHash);
    isVerifiedOnChain = blockchainResult[0];
    isExpired = blockchainResult[1];
  } else {
    // Manual Entry: Verify registration exists on-chain
    const blockchainResult = await contract.getMedicine(batchId);
    isVerifiedOnChain = blockchainResult.exists;
    isExpired = Number(medicine.expiryDate) < Math.floor(Date.now() / 1000);
  }

  // Final validation: On-chain existence and (if QR) hash match
  // For QR, hash must match DB. For Manual, we've already checked on-chain existence.
  const finalIsValid = isVerifiedOnChain && (qrHash ? (medicine.qrHash === qrHash) : true);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isValid: finalIsValid,
        verifiedBy: qrHash ? "QR Code" : "Batch ID",
        batchId: medicine.batchId,
        isExpired,
        name: medicine.name,
        manufacturer: medicine.manufacturerName,
        imageUrl: medicine.imageUrl,
        status: medicine.status,
        expiryDate: medicine.expiryDate,
        manufactureDate: medicine.manufactureDate,
        currentHolder: medicine.currentHolder,
      },
      finalIsValid ? "Verification successful" : "Verification failed"
    )
  );
});