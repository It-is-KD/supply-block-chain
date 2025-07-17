const hre = require("hardhat");
const config = require("../src/config.json");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  const TeaSupplyChain = await hre.ethers.getContractFactory("TeaSupplyChain");
  const contract = TeaSupplyChain.attach(config.contractAddress);
  
  console.log("Registering users with contract owner:", deployer.address);
  console.log("Contract address:", config.contractAddress);
  console.log("=".repeat(60));
  
  const users = [
    {
      address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      role: 1, // Farmer
      roleName: "Farmer",
      name: "Green Valley Tea Farm",
      location: "Darjeeling, West Bengal"
    },
    {
      address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      role: 2, // Processor
      roleName: "Processor",
      name: "Premium Tea Processing Unit",
      location: "Siliguri, West Bengal"
    },
    {
      address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      role: 3, // Warehouse
      roleName: "Warehouse",
      name: "Central Tea Warehouse",
      location: "Kolkata, West Bengal"
    },
    {
      address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
      role: 4, // Distributor
      roleName: "Distributor",
      name: "National Tea Distribution Co.",
      location: "Delhi, India"
    },
    {
      address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
      role: 5, // Retailer
      roleName: "Retailer",
      name: "Premium Tea Retail Store",
      location: "Mumbai, Maharashtra"
    }
  ];
  
  console.log("Registering participants...\n");
  
  for (const user of users) {
    try {
      console.log(`Registering ${user.roleName}: ${user.name}`);
      console.log(`Address: ${user.address}`);
      
      const existingParticipant = await contract.getParticipant(user.address);
      if (existingParticipant.role.toString() !== "0") {
        console.log(`⚠️  User already registered with role: ${existingParticipant.role}`);
        console.log(`   Name: ${existingParticipant.name}`);
        console.log(`   Skipping...`);
      } else {

          const tx = await contract.registerParticipant(
          user.address,
          user.role,
          user.name,
          user.location
        );
        
        await tx.wait();
        console.log(`✅ Successfully registered ${user.roleName}`);
        console.log(`   Transaction hash: ${tx.hash}`);
        
        const participant = await contract.getParticipant(user.address);
        console.log(`   Verified - Role: ${participant.role}, Active: ${participant.isActive}`);
      }
      
      console.log("-".repeat(50));
      
    } catch (error) {
      console.error(`❌ Error registering ${user.roleName}:`, error.message);
      console.log("-".repeat(50));
    }
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("REGISTRATION SUMMARY");
  console.log("=".repeat(60));
  
  for (const user of users) {
    try {
      const participant = await contract.getParticipant(user.address);
      if (participant.role.toString() !== "0") {
        console.log(`✅ ${user.roleName}: ${participant.name} (${user.address})`);
        console.log(`   Location: ${participant.location}`);
        console.log(`   Role ID: ${participant.role}, Active: ${participant.isActive}`);
      } else {
        console.log(`❌ ${user.roleName}: Not registered (${user.address})`);
      }
      console.log("");
    } catch (error) {
      console.log(`❌ ${user.roleName}: Error checking registration`);
    }
  }
  
  console.log("=".repeat(60));
  console.log("Registration process completed!");
  console.log("\nRole Reference:");
  console.log("1 = Farmer, 2 = Processor, 3 = Warehouse, 4 = Distributor, 5 = Retailer, 6 = Authority");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});