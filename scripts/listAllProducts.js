const hre = require("hardhat");
const config = require("../src/config.json");

async function main() {
  const TeaSupplyChain = await hre.ethers.getContractFactory("TeaSupplyChain");
  const contract = TeaSupplyChain.attach(config.contractAddress);
  
  console.log("📋 ALL PRODUCTS IN THE SUPPLY CHAIN");
  console.log("=".repeat(80));
  
  try {
    const productCounter = await contract.productCounter();
    console.log(`Total Products: ${productCounter.toString()}\n`);
    
    if (productCounter.toString() === "0") {
      console.log("No products found. Run the test data script first!");
      return;
    }
    
    const stages = ["🌱 Cultivation", "⚙️ Processing", "🏪 Warehousing", "🚚 Distribution", "🛒 Retail", "✅ Sold"];
    
    for (let i = 1; i <= Number(productCounter.toString()); i++) {
      const product = await contract.products(i);
      
      console.log(`Product ${i}:`);
      console.log(`  📦 ${product.productName} (${product.batchId})`);
      console.log(`  📍 Origin: ${product.origin}`);
      console.log(`  🏷️  Grade: ${product.grade}`);
      console.log(`  ⚖️  Quantity: ${product.quantity.toString()} kg`);
      console.log(`  📊 Stage: ${stages[product.currentStage]}`);
      console.log(`  👤 Owner: ${product.currentOwner}`);
      console.log(`  📅 Created: ${new Date(Number(product.timestamp) * 1000).toLocaleDateString()}`);
      console.log("-".repeat(80));
    }
    
    console.log("\n📊 SUMMARY BY STAGE:");
    console.log("=".repeat(50));
    
    const stageCounts = [0, 0, 0, 0, 0, 0];
    for (let i = 1; i <= Number(productCounter.toString()); i++) {
      const product = await contract.products(i);
      stageCounts[product.currentStage]++;
    }
    
    stages.forEach((stage, index) => {
      if (stageCounts[index] > 0) {
        console.log(`${stage}: ${stageCounts[index]} products`);
      }
    });
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});