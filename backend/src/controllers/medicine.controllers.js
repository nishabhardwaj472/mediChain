import crypto from "crypto";
import QRCode from "qrcode";
import { contract, provider } from "../utils/blockchain.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { Medicine } from "../models/Medicine.model.js";

//
// ✅ REGISTER MEDICINE (BLOCKCHAIN + MONGODB)
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
  } = req.body;

  const user = req.user;

  if (user.role !== "manufacturer") {
    throw new ApiError(403, "Only manufacturers allowed");
  }

  // 🔐 Generate QR
  const qrDataString = JSON.stringify({
    batchId,
    manufacturer: user.walletAddress,
    timestamp: Date.now(),
  });

  const qrHash = crypto
    .createHash("sha256")
    .update(qrDataString)
    .digest("hex");

  const verifyUrl = `http://localhost:5173/verify?batchId=${batchId}&hash=${qrHash}`;

  const imageUrl = await QRCode.toDataURL(verifyUrl);

  // 🧾 CALL BLOCKCHAIN
  const tx = await contract.registerMedicine(
    name,
    batchId,
    manufacturerName,
    licenseNo,
    quantity,
    manufactureDate,
    expiryDate,
    description,
    qrHash,
    imageUrl
  );

  await tx.wait();

  // 🏥 SAVE TO MONGODB
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
        transactionHash: tx.hash,
      },
    ],
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        txHash: tx.hash,
        qrHash,
        imageUrl,
        medicine,
      },
      "Medicine registered on blockchain & database"
    )
  );
});

//
// ✅ GET MEDICINE FROM BLOCKCHAIN
//
export const getMedicineByBatchId = asyncHandler(async (req, res) => {
  const { batchId } = req.params;

  const data = await contract.getMedicine(batchId);

  if (!data.exists) {
    throw new ApiError(404, "Medicine not found on blockchain");
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
// ✅ UPDATE SHIPMENT (BLOCKCHAIN + MONGODB)
//
export const updateShipment = asyncHandler(async (req, res) => {
  const { batchId, toAddress, location, status } = req.body;

  const user = req.user;

  // 🧾 CALL BLOCKCHAIN
  const tx = await contract.updateShipment(
    batchId,
    toAddress,
    location,
    status
  );

  await tx.wait();

  // 🏥 UPDATE MONGODB
  const medicine = await Medicine.findOne({ batchId });
  if (medicine) {
    medicine.status = "InTransit";
    medicine.currentHolder = toAddress;
    medicine.history.push({
      from: user.walletAddress,
      to: toAddress,
      location: location,
      status: status,
      timestamp: Math.floor(Date.now() / 1000),
      transactionHash: tx.hash,
    });
    await medicine.save();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { txHash: tx.hash },
      "Shipment updated on blockchain & database"
    )
  );
});

//
// ✅ CONFIRM RECEIPT (BLOCKCHAIN + MONGODB)
//
export const confirmReceipt = asyncHandler(async (req, res) => {
  const { batchId, location } = req.body;
  const user = req.user;

  // 🧾 CALL BLOCKCHAIN
  const tx = await contract.confirmReceipt(batchId, location);

  await tx.wait();

  // 🏥 UPDATE MONGODB
  const medicine = await Medicine.findOne({ batchId });
  if (medicine) {
    medicine.status = "Delivered";
    medicine.currentHolder = user.walletAddress;
    medicine.ownerRole = user.role === "pharmacy" ? "Pharmacy" : "Distributor";
    medicine.history.push({
      from: medicine.currentHolder,
      to: user.walletAddress,
      location: location,
      status: "Delivered",
      timestamp: Math.floor(Date.now() / 1000),
      transactionHash: tx.hash,
    });
    await medicine.save();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { txHash: tx.hash },
      "Receipt confirmed on blockchain & database"
    )
  );
});

//
// ✅ GET HISTORY FROM BLOCKCHAIN
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
    new ApiResponse(200, formatted, "History from blockchain")
  );
});

//
// ✅ VERIFY MEDICINE (BLOCKCHAIN)
//
export const verifyMedicine = asyncHandler(async (req, res) => {
  const { batchId, qrHash } = req.body;

  const result = await contract.verifyMedicine(batchId, qrHash);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isValid: result.isValid,
        isExpired: result.isExpired,
        name: result.name,
        manufacturer: result.manufacturer,
        imageUrl: result.imageUrl,
      },
      "Verification from blockchain"
    )
  );
});