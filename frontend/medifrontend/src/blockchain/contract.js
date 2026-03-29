import { ethers } from "ethers";
import MediChainABI from "../abi/MediChain.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

let contract;

export const getContract = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  contract = new ethers.Contract(CONTRACT_ADDRESS,MediChainABI.abi, signer);

  return contract;
};

// default export (easy use)
export default {
  confirmReceipt: async (batchId, location) => {
    const contract = await getContract();
    return contract.confirmReceipt(batchId, location);
  },
};