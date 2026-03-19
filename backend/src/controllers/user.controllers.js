import { User } from "../models/User.model.js";
import { contract } from "../utils/blockchain.js";
import { ethers } from "ethers";

/* =====================================================
   LOGIN USER
===================================================== */
export const loginUser = async (req, res) => {
  try {
    const { email, password, walletAddress } = req.body;

    // 🔐 Admin bypass (demo only)
    if (email === "ayushjais766@gmail.com" && password === "ayush123") {
      return res.status(200).json({
        success: true,
        message: "Admin login successful",
        data: {
          user: {
            email,
            role: "admin",
            isApproved: true,
          },
          accessToken: "admin-token",
        },
      });
    }

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

    const user = await User.findOne({ email, walletAddress: wallet });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or wallet mismatch",
      });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 🔗 Check blockchain approval
    const isApprovedOnChain = await contract.approved(wallet);

    if (!isApprovedOnChain) {
      return res.status(403).json({
        success: false,
        message: "User not approved on blockchain",
      });
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.isApproved = true; // sync
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
      data: { user: userData, accessToken },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
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

    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet address",
      });
    }

    const wallet = walletAddress.toLowerCase();

    const exists = await User.findOne({
      $or: [{ email }, { walletAddress: wallet }],
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Email or wallet already registered",
      });
    }

    const approvalRoles = ["manufacturer", "distributor", "pharmacy"];

    const user = await User.create({
      fullName,
      email,
      role,
      password,
      walletAddress: wallet,
      isApproved: approvalRoles.includes(role) ? false : true,
    });

    return res.status(201).json({
      success: true,
      message: "Registered successfully. Wait for approval.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
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
      message: "Logged out",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   GET CURRENT USER
===================================================== */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password -refreshToken");

    const onChainApproved = await contract.approved(user.walletAddress);

    return res.status(200).json({
      success: true,
      data: { ...user.toObject(), onChainApproved },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
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

    const roleMap = {
      admin: "manufacturer",
      manufacturer: "distributor",
      distributor: "pharmacy",
    };

    if (target.role !== roleMap[approver.role]) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized approval",
      });
    }

    let tx;

    if (target.role === "manufacturer") {
      tx = await contract.approveManufacturer(target.walletAddress);
    } else if (target.role === "distributor") {
      tx = await contract.approveDistributor(target.walletAddress);
    } else if (target.role === "pharmacy") {
      tx = await contract.approvePharmacy(target.walletAddress);
    }

    await tx.wait();

    target.isApproved = true;
    await target.save();

    return res.status(200).json({
      success: true,
      message: "Approved on blockchain",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   REJECT USER
===================================================== */
export const rejectUser = async (req, res) => {
  try {
    const { userId } = req.body;

    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "User rejected",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   GET USERS BY HIERARCHY
===================================================== */
export const getUsersByHierarchy = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const roleMap = {
      admin: "manufacturer",
      manufacturer: "distributor",
      distributor: "pharmacy",
    };

    const targetRole = roleMap[user.role];

    const users = await User.find({ role: targetRole })
      .select("-password -refreshToken");

    return res.status(200).json({
      success: true,
      role: targetRole,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   VERIFY USER ON BLOCKCHAIN
===================================================== */
export const verifyUserOnChain = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    const isApproved = await contract.approved(walletAddress);
    const role = await contract.roles(walletAddress);

    return res.status(200).json({
      success: true,
      data: { isApproved, role },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};