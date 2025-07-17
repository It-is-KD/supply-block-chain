const hre = require("hardhat");

async function main() {

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  const TeaSupplyChain = await hre.ethers.getContractFactory("TeaSupplyChain");
  const contract = TeaSupplyChain.attach(contractAddress);

  const farmerAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  
  try {
    const participant = await contract.participants(farmerAddress);
    console.log("Participant Info:");
    console.log("Role:", participant.role.toString());
    console.log("Name:", participant.name);
    console.log("Location:", participant.location);
    console.log("Is Active:", participant.isActive);
    
    // Role enum: None=0, Farmer=1, Processor=2, Warehouse=3, Distributor=4, Retailer=5, Authority=6
    if (participant.role.toString() === "1") {
      console.log("✅ Participant is registered as Farmer");
    } else {
      console.log("❌ Participant is NOT registered as Farmer");
      console.log("Current role:", participant.role.toString());
    }
  } catch (error) {
    console.error("Error checking participant:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});