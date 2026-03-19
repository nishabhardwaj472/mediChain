const hre = require("hardhat");

async function main() {
  const MediChain = await hre.ethers.getContractFactory("MediChain");

  console.log("Deploying contract...");

  const contract = await MediChain.deploy();

  await contract.waitForDeployment();

  console.log("✅ MediChain deployed to:", contract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});