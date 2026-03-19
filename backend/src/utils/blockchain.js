import dotenv from "dotenv";
import { ethers } from "ethers";
import fs from "fs";

dotenv.config();

/* 🔐 ENV VALIDATION */
const requiredEnv = ["SEPOLIA_RPC_URL", "PRIVATE_KEY", "CONTRACT_ADDRESS"];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing ${key} in environment variables`);
  }
});

/* 📦 LOAD ABI */
const abi = JSON.parse(
  fs.readFileSync(
    new URL("../abi/medichain.json", import.meta.url),
    "utf-8"
  )
);

/* 🌐 PROVIDER */
export const provider = new ethers.JsonRpcProvider(
  process.env.SEPOLIA_RPC_URL
);

/* 🔑 SIGNER (ADMIN WALLET) */
export const signer = new ethers.Wallet(
  process.env.PRIVATE_KEY,
  provider
);

/* 📜 CONTRACT INSTANCE */
export const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  abi.abi,
  signer
);