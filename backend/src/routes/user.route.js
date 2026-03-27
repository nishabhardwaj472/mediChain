import express from "express";
import {
   loginUser,
   registerUser,
   logoutUser,
   getCurrentUser,
   approveUser,
   //   rejectUser,
   getPendingUsers,
   verifyUserOnChain,
   getUserByWallet,
} from "../controllers/user.controllers.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* =====================================================
   PUBLIC ROUTES
===================================================== */

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-onchain", verifyUserOnChain);
router.get("/by-wallet/:wallet", getUserByWallet);

/* =====================================================
   PROTECTED ROUTES
===================================================== */

router.use(verifyJWT);

// Auth
router.post("/logout", logoutUser);

// User
router.get("/me", verifyJWT, getCurrentUser);

// Approval system
router.get("/pending-users", getPendingUsers);
router.post("/approve", approveUser);
// router.post("/reject", rejectUser);

export default router;