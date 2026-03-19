import crypto from "crypto";
import QRCode from "qrcode";
import { contract, provider } from "../utils/blockchain.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//
// ✅ REGISTER MEDICINE (BLOCKCHAIN)
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

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        txHash: tx.hash,
        qrHash,
        imageUrl,
      },
      "Medicine registered on blockchain"
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
// ✅ UPDATE SHIPMENT (BLOCKCHAIN)
//
export const updateShipment = asyncHandler(async (req, res) => {
  const { batchId, toAddress, location, status } = req.body;

  const user = req.user;

  const tx = await contract.updateShipment(
    batchId,
    toAddress,
    location,
    status
  );

  await tx.wait();

  return res.status(200).json(
    new ApiResponse(
      200,
      { txHash: tx.hash },
      "Shipment updated on blockchain"
    )
  );
});

//
// ✅ CONFIRM RECEIPT (BLOCKCHAIN)
//
export const confirmReceipt = asyncHandler(async (req, res) => {
  const { batchId, location } = req.body;

  const tx = await contract.confirmReceipt(batchId, location);

  await tx.wait();

  return res.status(200).json(
    new ApiResponse(
      200,
      { txHash: tx.hash },
      "Receipt confirmed on blockchain"
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