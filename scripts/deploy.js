const hre = require("hardhat");

async function main() {
  const TeaSupplyChain = await hre.ethers.getContractFactory("TeaSupplyChain");
  const teaSupplyChain = await TeaSupplyChain.deploy();

  await teaSupplyChain.waitForDeployment();

  console.log("TeaSupplyChain deployed to:", await teaSupplyChain.getAddress());
  
  const fs = require('fs');
  const contractAddress = await teaSupplyChain.getAddress();
  
  const config = {
    contractAddress: contractAddress,
    networkId: hre.network.config.chainId || 11155111,
    networkName: hre.network.name === 'sepolia' ? 'Sepolia Testnet' : hre.network.name,
    rpcUrl: hre.network.config.url || "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"
  };
  
  fs.writeFileSync('./src/config.json', JSON.stringify(config, null, 2));
  console.log("Contract address saved to src/config.json");
  console.log("Network:", config.networkName);
  console.log("Chain ID:", config.networkId);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});