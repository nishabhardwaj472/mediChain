import { User } from "../models/User.model.js";
import { contract } from "../utils/blockchain.js";
import { ethers } from "ethers";

/* =====================================================
   CONSTANTS
===================================================== */
const ADMIN_EMAIL = "ayushjais766@gmail.com";
const ADMIN_PASSWORD = "12345678";

/* =====================================================
   LOGIN USER
===================================================== */
export const loginUser = async (req, res) => {
  try {
    const { email, password, walletAddress } = req.body;

    if (!email || !password || !walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Email, password and wallet address are required",
      });
    }

    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet address",
      });
    }

    const wallet = walletAddress.toLowerCase();

    /* =====================================================
       🔐 ADMIN LOGIN (ONLY ONE ADMIN)
    ===================================================== */
    if (email === ADMIN_EMAIL) {
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({
          success: false,
          message: "Invalid admin credentials",
        });
      }

      let admin = await User.findOne({ email: ADMIN_EMAIL });

      // create admin if not exists
      if (!admin) {
        admin = await User.create({
          fullName: "System Admin",
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          role: "admin",
          walletAddress: wallet,
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

    /* =====================================================
       👤 NORMAL USER LOGIN
    ===================================================== */
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
        message: "Account is deactivated",
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
        message: "All fields are required",
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
        message: "Email or wallet already registered",
      });
    }

    const autoApprovedRoles = ["consumer"];

    await User.create({
      fullName,
      email: email.toLowerCase(),
      role,
      password,
      walletAddress: wallet,
      isApproved: autoApprovedRoles.includes(role),
    });

    return res.status(201).json({
      success: true,
      message:
        autoApprovedRoles.includes(role)
          ? "Registered successfully"
          : "Registered successfully. Wait for approval.",
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
    const user = await User.findById(req.user._id).select(
      "-password -refreshToken"
    );

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
      role: targetRole,
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
   APPROVE USER (BLOCKCHAIN)
===================================================== */
export const approveUser = async (req, res) => {
  try {
    const { userId } = req.body;

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

    let tx;

    switch (target.role) {
      case "manufacturer":
        tx = await contract.approveManufacturer(target.walletAddress);
        break;
      case "distributor":
        tx = await contract.approveDistributor(target.walletAddress);
        break;
      case "pharmacy":
        tx = await contract.approvePharmacy(target.walletAddress);
        break;
    }

    await tx.wait();

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

/* =====================================================
   REJECT USER
===================================================== */
export const rejectUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User rejected",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   VERIFY USER ON BLOCKCHAIN
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
      data: { isApproved, role },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};