import express from "express";
import {
   loginUser,
   registerUser,
   logoutUser,
   getCurrentUser,
   approveUser,
   rejectUser,
   getUsersByHierarchy,
   verifyUserOnChain,
} from "../controllers/user.controllers.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* =====================================================
   PUBLIC ROUTES
===================================================== */

// Auth
router.post("/register", registerUser);
router.post("/login", loginUser);

// Blockchain check (optional public)
router.post("/verify-onchain", verifyUserOnChain);

/* =====================================================
   PROTECTED ROUTES
===================================================== */

router.use(verifyJWT); // 🔐 all routes below require login

// Auth
router.post("/logout", logoutUser);

// User
router.get("/me", getCurrentUser);

// Approval system
router.post("/approve", approveUser);
router.post("/reject", rejectUser);

// Role-based users
router.get("/users", getUsersByHierarchy);

export default router;