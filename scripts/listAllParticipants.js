const hre = require("hardhat");
const config = require("../src/config.json");

async function main() {
  const TeaSupplyChain = await hre.ethers.getContractFactory("TeaSupplyChain");
  const contract = TeaSupplyChain.attach(config.contractAddress);
  
  const signers = await hre.ethers.getSigners();
  console.log("Checking all available wallet addresses:\n");
  
  for (let i = 0; i < Math.min(signers.length, 10); i++) {
    const address = signers[i].address;
    try {
      const participant = await contract.getParticipant(address);
      
      if (participant.role.toString() !== "0") {
        const roles = ["None", "Farmer", "Processor", "Warehouse", "Distributor", "Retailer", "Authority"];
        console.log(`Address: ${address}`);
        console.log(`Role: ${roles[participant.role]} (${participant.role})`);
        console.log(`Name: ${participant.name}`);
        console.log(`Location: ${participant.location}`);
        console.log(`Is Active: ${participant.isActive}`);
        console.log("---");
      }
    } catch (error) {
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});