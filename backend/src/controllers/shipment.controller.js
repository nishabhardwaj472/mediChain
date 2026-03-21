import { Shipment } from "../models/Shipment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//
// ✅ CREATE / UPDATE SHIPMENT (NO BLOCKCHAIN WRITE)
//
export const createShipment = asyncHandler(async (req, res) => {
  const { batchId, toAddress, location, status, txHash } = req.body;

  const user = req.user;

  if (!batchId || !toAddress || !location || !status) {
    throw new ApiError(400, "All fields are required");
  }

  if (!txHash) {
    throw new ApiError(400, "Transaction hash required");
  }

  if (!toAddress.startsWith("0x")) {
    throw new ApiError(400, "Invalid wallet address");
  }

  // 💾 Save in DB
  const shipment = await Shipment.create({
    batchId,
    from: user.walletAddress,
    to: toAddress,
    location,
    status,
    transactionHash: txHash,
    timestamp: Math.floor(Date.now() / 1000),
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        txHash,
        shipment,
      },
      "Shipment recorded successfully"
    )
  );
});

//
// ✅ GET ALL SHIPMENTS FOR A BATCH
//
export const getShipmentsByBatchId = asyncHandler(async (req, res) => {
  const { batchId } = req.params;

  const shipments = await Shipment.find({ batchId }).sort({ createdAt: 1 });

  return res.status(200).json(
    new ApiResponse(200, shipments, "Shipments fetched")
  );
});

//
// ✅ GET ALL SHIPMENTS (ADMIN / ANALYTICS)
//
export const getAllShipments = asyncHandler(async (req, res) => {
  const shipments = await Shipment.find().sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, shipments, "All shipments fetched")
  );
});