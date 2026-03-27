import { User } from "../models/User.model.js";
import { contract } from "../utils/blockchain.js";
import { ethers } from "ethers";

/* =====================================================
   CONSTANTS
===================================================== */
const ADMIN_EMAIL = "ayushjais766@gmail.com";
const ADMIN_PASSWORD = "12345678";
const ADMIN_WALLET = "0x1b0a9d47f9428fa43605b0ca087062a4c367ccf5".toLowerCase();

/* =====================================================
   LOGIN USER
===================================================== */
export const loginUser = async (req, res) => {
  try {
    const { email, password, walletAddress } = req.body;

    if (!email || !password || !walletAddress) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet address",
      });
    }

    const wallet = walletAddress.toLowerCase();

    /* ================= ADMIN LOGIN ================= */
    if (email === ADMIN_EMAIL) {
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({
          success: false,
          message: "Invalid admin credentials",
        });
      }

      if (wallet !== ADMIN_WALLET) {
        return res.status(403).json({
          success: false,
          message: "Invalid admin wallet",
        });
      }

      let admin = await User.findOne({ email: ADMIN_EMAIL });

      if (!admin) {
        admin = await User.create({
          fullName: "System Admin",
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          role: "admin",
          walletAddress: ADMIN_WALLET,
          isApproved: true,
        });
      }

      const accessToken = admin.generateAccessToken();
      const refreshToken = admin.generateRefreshToken();

      admin.refreshToken = refreshToken;
      await admin.save({ validateBeforeSave: false });

      const adminData = admin.toObject();
      delete adminData.password;
      delete adminData.refreshToken;

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.status(200).json({
        success: true,
        message: "Admin login successful",
        data: {
          user: { ...adminData, onChainApproved: true },
          accessToken,
        },
      });
    }

    /* ================= NORMAL USER ================= */
    const user = await User.findOne({
      email: email.toLowerCase(),
      walletAddress: wallet,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or wallet mismatch",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account deactivated",
      });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const onChainApproved = await contract.approved(wallet);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const userData = user.toObject();
    delete userData.password;
    delete userData.refreshToken;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: { ...userData, onChainApproved },
        accessToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   REGISTER USER
===================================================== */
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, role, password, walletAddress } = req.body;

    if (!fullName || !email || !role || !password || !walletAddress) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin cannot be registered",
      });
    }

    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet address",
      });
    }

    const wallet = walletAddress.toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { walletAddress: wallet }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or wallet already exists",
      });
    }

    await User.create({
      fullName,
      email: email.toLowerCase(),
      role,
      password,
      walletAddress: wallet,
      isApproved: role === "consumer",
    });

    return res.status(201).json({
      success: true,
      message: "Registered successfully. Await approval.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   APPROVE USER (BLOCKCHAIN VERIFIED)
===================================================== */
export const approveUser = async (req, res) => {
  try {
    const { userId, txHash } = req.body;

    if (!txHash) {
      return res.status(400).json({
        success: false,
        message: "Transaction hash required",
      });
    }

    const approver = await User.findById(req.user._id);
    const target = await User.findById(userId);

    if (!target) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const roleMap = {
      admin: "manufacturer",
      manufacturer: "distributor",
      distributor: "pharmacy",
    };

    if (target.role !== roleMap[approver.role]) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized action",
      });
    }

    // 🔒 Admin wallet validation
    if (approver.role === "admin" && approver.walletAddress !== ADMIN_WALLET) {
      return res.status(403).json({
        success: false,
        message: "Invalid admin wallet",
      });
    }

    // 🔍 Verify transaction
    const provider = contract.runner?.provider;

    if (!provider) {
      throw new Error("Provider not found");
    }

    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt || receipt.status !== 1) {
      return res.status(400).json({
        success: false,
        message: "Transaction failed or not mined",
      });
    }

    // 🔍 Verify role on-chain
    const role = await contract.roles(target.walletAddress);

    if (Number(role) === 0) {
      return res.status(400).json({
        success: false,
        message: "User not registered on blockchain",
      });
    }

    target.isApproved = true;
    await target.save();

    return res.status(200).json({
      success: true,
      message: `${target.role} approved successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserByWallet = async (req, res) => {
  const { wallet } = req.params;

  const user = await User.findOne({
    walletAddress: wallet.toLowerCase(),
  }).select("role walletAddress");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: user,
  });
};

/* =====================================================
   GET PENDING USERS
===================================================== */
export const getPendingUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    const roleMap = {
      admin: "manufacturer",
      manufacturer: "distributor",
      distributor: "pharmacy",
    };

    const targetRole = roleMap[currentUser.role];

    if (!targetRole) {
      return res.status(403).json({
        success: false,
        message: "Not allowed",
      });
    }

    const users = await User.find({
      role: targetRole,
      isApproved: false,
      isActive: true,
    }).select("-password -refreshToken");

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   VERIFY USER ON CHAIN
===================================================== */
export const verifyUserOnChain = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet address",
      });
    }

    const isApproved = await contract.approved(walletAddress);
    const role = await contract.roles(walletAddress);

    return res.status(200).json({
      success: true,
      data: {
        isApproved,
        role: Number(role),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   LOGOUT USER
===================================================== */
export const logoutUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { refreshToken: 1 },
    });

    res.clearCookie("refreshToken");

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   GET CURRENT USER
===================================================== */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const onChainApproved = await contract.approved(user.walletAddress);

    return res.status(200).json({
      success: true,
      data: { ...user.toObject(), onChainApproved },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};