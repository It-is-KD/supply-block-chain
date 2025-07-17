const hre = require("hardhat");
const config = require("../src/config.json");

async function main() {
  const TeaSupplyChain = await hre.ethers.getContractFactory("TeaSupplyChain");
  const contract = TeaSupplyChain.attach(config.contractAddress);
  
  console.log("VERIFYING ALL REGISTERED PARTICIPANTS");
  console.log("=".repeat(70));
  
  const addresses = [
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Authority (deployer)
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Farmer
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Processor
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Warehouse
    "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", // Distributor
    "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc"  // Retailer
  ];
  
  const roleNames = ["None", "Farmer", "Processor", "Warehouse", "Distributor", "Retailer", "Authority"];
  
  for (const address of addresses) {
    try {
      const participant = await contract.getParticipant(address);
      
      if (participant.role.toString() !== "0") {
        console.log(`Address: ${address}`);
        console.log(`Role: ${roleNames[participant.role]} (${participant.role})`);
        console.log(`Name: ${participant.name}`);
        console.log(`Location: ${participant.location}`);
        console.log(`Active: ${participant.isActive}`);
        console.log("-".repeat(70));
      }
    } catch (error) {
      console.log(`Error checking ${address}: ${error.message}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});