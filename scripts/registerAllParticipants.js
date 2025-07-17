const hre = require("hardhat");

async function main() {
  const contractAddress = "0xdc64a140aa3e981100a9beca4e685f962f0cf6c9"; // Your contract address
  
  const TeaSupplyChain = await hre.ethers.getContractFactory("TeaSupplyChain");
  const contract = TeaSupplyChain.attach(contractAddress);

  const signers = await hre.ethers.getSigners();
  const [owner, farmer, processor, warehouse, distributor, retailer] = signers;

  console.log("=== Registering All Participants ===");
  console.log("Owner (Authority):", owner.address);

  const participants = [
    {
      address: farmer.address,
      role: 1, // Farmer
      name: "Raj Tea Estate",
      location: "Darjeeling, West Bengal, India"
    },
    {
      address: processor.address,
      role: 2, // Processor
      name: "Himalayan Tea Processing Ltd",
      location: "Siliguri, West Bengal, India"
    },
    {
      address: warehouse.address,
      role: 3, // Warehouse
      name: "Bengal Tea Storage Co",
      location: "Kolkata, West Bengal, India"
    },
    {
      address: distributor.address,
      role: 4, // Distributor
      name: "India Tea Exports Pvt Ltd",
      location: "Mumbai, Maharashtra, India"
    },
    {
      address: retailer.address,
      role: 5, // Retailer
      name: "Premium Tea House",
      location: "Mumbai, Maharashtra, India"
    }
  ];

  for (let i = 0; i < participants.length; i++) {
    const p = participants[i];
    try {
      console.log(`\nRegistering ${p.name}...`);
      console.log(`Address: ${p.address}`);
      console.log(`Role: ${p.role}`);
      
      const tx = await contract.connect(owner).registerParticipant(
        p.address,
        p.role,
        p.name,
        p.location
      );
      
      await tx.wait();
      console.log(`✅ ${p.name} registered successfully`);
      
      // Verify registration
      const participant = await contract.participants(p.address);
      console.log(`Verification - Role: ${participant.role.toString()}`);
      console.log(`Verification - Active: ${participant.isActive}`);
      
    } catch (error) {
      console.error(`❌ Error registering ${p.name}:`, error.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});