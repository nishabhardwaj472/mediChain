import express from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
//   getCurrentUser,
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

/* =====================================================
   PROTECTED ROUTES
===================================================== */

router.use(verifyJWT);

// Auth
router.post("/logout", logoutUser);

// User
// router.get("/me", getCurrentUser);

// Approval system
router.get("/pending-users", getPendingUsers);
router.post("/approve", approveUser);
router.get("/users/by-wallet/:wallet",getUserByWallet)
// router.post("/reject", rejectUser);

export default router;