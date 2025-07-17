const hre = require("hardhat");
const config = require("../src/config.json");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Current wallet address:", deployer.address);
  
  const TeaSupplyChain = await hre.ethers.getContractFactory("TeaSupplyChain");
  const contract = TeaSupplyChain.attach(config.contractAddress);
  
  try {
    const participant = await contract.getParticipant(deployer.address);
    console.log("\nCurrent wallet participant info:");
    console.log("Address:", participant.participantAddress);
    console.log("Role:", participant.role.toString());
    console.log("Name:", participant.name);
    console.log("Location:", participant.location);
    console.log("Is Active:", participant.isActive);
    
    if (participant.role.toString() === "0") {
      console.log("\n❌ Current wallet is NOT registered as a participant");
    } else {
      console.log("\n✅ Current wallet is registered");
      const roles = ["None", "Farmer", "Processor", "Warehouse", "Distributor", "Retailer", "Authority"];
      console.log("Role name:", roles[participant.role]);
    }
  } catch (error) {
    console.error("Error checking participant:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});