const hre = require("hardhat");
const config = require("../src/config.json");

async function main() {
  const signers = await hre.ethers.getSigners();
  const TeaSupplyChain = await hre.ethers.getContractFactory("TeaSupplyChain");
  const contract = TeaSupplyChain.attach(config.contractAddress);
  
  console.log("👥 PRODUCTS BY ROLE/OWNER");
  console.log("=".repeat(70));
  
  const roles = [
    { name: "Authority", signer: signers[0], address: signers[0].address },
    { name: "Farmer", signer: signers[1], address: signers[1].address },
    { name: "Processor", signer: signers[2], address: signers[2].address },
    { name: "Warehouse", signer: signers[3], address: signers[3].address },
    { name: "Distributor", signer: signers[4], address: signers[4].address },
    { name: "Retailer", signer: signers[5], address: signers[5].address }
  ];
  
  for (const role of roles) {
    try {
      console.log(`\n${role.name.toUpperCase()} (${role.address}):`);
      console.log("-".repeat(50));
      
      const productIds = await contract.getAllProductsByOwner(role.address);
      
      if (productIds.length === 0) {
        console.log("  No products currently owned");
      } else {
        console.log(`  Currently owns ${productIds.length} product(s):`);
        
        for (const productId of productIds) {
          if (productId.toString() !== "0") {
            const product = await contract.products(productId);
            const stages = ["Cultivation", "Processing", "Warehousing", "Distribution", "Retail", "Sold"];
            
            console.log(`    📦 Product ${productId}: ${product.productName}`);
            console.log(`       Batch: ${product.batchId}`);
            console.log(`       Stage: ${stages[product.currentStage]}`);
            console.log(`       Quantity: ${product.quantity.toString()} kg`);
          }
        }
      }
    } catch (error) {
      console.error(`Error checking ${role.name}:`, error.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});