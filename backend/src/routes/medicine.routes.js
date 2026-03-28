import { Router } from "express";
import {
  registerMedicine,
  getMedicineByBatchId,
  updateShipment,
  confirmReceipt,
  getMedicineHistory,
  verifyMedicine,
  getDashboardStats,
} from "../controllers/medicine.controllers.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//
// 🔐 PROTECTED ROUTES
//

// ✅ Register Medicine (Manufacturer only)
router.post("/register", verifyJWT, registerMedicine);

// ✅ Get Dashboard Stats
router.get("/dashboard/stats", verifyJWT, getDashboardStats);


// ✅ Update Shipment (Distributor / Manufacturer)
router.post("/shipment", verifyJWT, updateShipment);

// ✅ Confirm Receipt (Pharmacy)
router.post("/confirm-receipt", verifyJWT, confirmReceipt);


//
// 🌐 PUBLIC ROUTES
//

// ✅ Get Medicine by Batch ID (used in verification UI)
router.get("/:batchId", getMedicineByBatchId);

// ✅ Get History (tracking page)
router.get("/history/:batchId", getMedicineHistory);

// ✅ Verify Medicine (QR / manual verify)
router.post("/verify", verifyMedicine);


export default router;