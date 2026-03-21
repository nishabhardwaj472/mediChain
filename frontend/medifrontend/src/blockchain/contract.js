import { ethers } from "ethers";
import MediChainABI from "../abi/MediChain.json";

const CONTRACT_ADDRESS = "0x94D684f72654180fe63D97e3D6290e74f9F250FA";

export const getContract = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, MediChainABI.abi, signer);
};