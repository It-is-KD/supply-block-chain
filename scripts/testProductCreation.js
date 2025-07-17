const hre = require("hardhat");
const config = require("../src/config.json");

async function main() {
  
  const signers = await hre.ethers.getSigners();
  const farmerSigner = signers[1]; // This should be the farmer account
  
  console.log("Testing product creation with Farmer account:");
  console.log("Farmer address:", farmerSigner.address);
  
  const TeaSupplyChain = await hre.ethers.getContractFactory("TeaSupplyChain");
  const contract = TeaSupplyChain.attach(config.contractAddress);
  
  try {
    const participant = await contract.getParticipant(farmerSigner.address);
    console.log("Farmer registration status:");
    console.log("Role:", participant.role.toString());
    console.log("Name:", participant.name);
    console.log("Is Active:", participant.isActive);
    
    if (participant.role.toString() !== "1") {
      console.log("❌ This account is not registered as a Farmer (role 1)");
      return;
    }
    
    console.log("\nAttempting to create a product...");
    
    const tx = await contract.connect(farmerSigner).createProduct(
      "BATCH-TEST-001",
      "Darjeeling Black Tea",
      "Darjeeling, West Bengal",
      "Premium",
      1000,
      "Fresh harvest from high altitude gardens"
    );
    
    await tx.wait();
    console.log("✅ Product created successfully!");
    console.log("Transaction hash:", tx.hash);
    
    const product = await contract.getProductByBatch("BATCH-TEST-001");
    console.log("\nCreated product details:");
    console.log("Product ID:", product.productId.toString());
    console.log("Batch ID:", product.batchId);
    console.log("Product Name:", product.productName);
    console.log("Current Owner:", product.currentOwner);
    console.log("Current Stage:", product.currentStage.toString());
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});