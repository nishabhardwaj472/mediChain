import { Router } from "express";
import {
  createShipment,
  getShipmentsByBatchId,
  getAllShipments,
} from "../controllers/shipment.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//
// 🔐 PROTECTED ROUTES
//

// ✅ Create / Update Shipment (Distributor / Manufacturer)
router.post("/create", verifyJWT, createShipment);

// ✅ Get all shipments (Admin / analytics)
router.get("/", verifyJWT, getAllShipments);


//
// 🌐 PUBLIC / SEMI-PUBLIC ROUTES
//

// ✅ Get shipments by batch (used for tracking UI)
router.get("/:batchId", getShipmentsByBatchId);


export default router;