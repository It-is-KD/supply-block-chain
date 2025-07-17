const hre = require("hardhat");
const config = require("../src/config.json");

async function main() {
  const signers = await hre.ethers.getSigners();
  
  const authority = signers[0];  // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
  const farmer = signers[1];     // 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
  const processor = signers[2];  // 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
  const warehouse = signers[3];  // 0x90F79bf6EB2c4f870365E785982E1f101E93b906
  const distributor = signers[4]; // 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
  const retailer = signers[5];   // 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
  
  const TeaSupplyChain = await hre.ethers.getContractFactory("TeaSupplyChain");
  const contract = TeaSupplyChain.attach(config.contractAddress);
  
  console.log("🌱 ADDING COMPREHENSIVE TEST DATA TO TEA SUPPLY CHAIN");
  console.log("=" .repeat(70));
  
  const testProducts = [
    {
      batchId: "DAR-2024-001",
      productName: "Darjeeling First Flush",
      origin: "Darjeeling, West Bengal",
      grade: "FTGFOP1",
      quantity: 500,
      notes: "Premium first flush from high altitude gardens, muscatel flavor"
    },
    {
      batchId: "ASS-2024-002", 
      productName: "Assam Black Tea",
      origin: "Assam, India",
      grade: "PEKOE",
      quantity: 1000,
      notes: "Strong malty flavor, perfect for breakfast blend"
    },
    {
      batchId: "NIL-2024-003",
      productName: "Nilgiri Orange Pekoe",
      origin: "Nilgiri Hills, Tamil Nadu", 
      grade: "OP",
      quantity: 750,
      notes: "Citrusy and bright, high grown tea with excellent color"
    },
    {
      batchId: "DAR-2024-004",
      productName: "Darjeeling Second Flush",
      origin: "Darjeeling, West Bengal",
      grade: "SFTGFOP",
      quantity: 300,
      notes: "Rich amber liquor with distinctive muscatel character"
    },
    {
      batchId: "ASS-2024-005",
      productName: "Assam CTC",
      origin: "Assam, India", 
      grade: "CTC-BOP",
      quantity: 2000,
      notes: "Crush, Tear, Curl processed for strong liquor and quick brewing"
    }
  ];

  const stageNotes = {
    processing: [
      "Withering completed in 14 hours, oxidation controlled at 85%",
      "Traditional orthodox processing, hand-rolled and fired",
      "CTC processing completed, graded and sorted by size",
      "Careful processing to preserve delicate flavor profile",
      "Machine processed with quality control at each step"
    ],
    warehousing: [
      "Stored in climate-controlled warehouse, humidity 60%",
      "Quality tested and approved for storage, moisture content 3%",
      "Bulk storage in jute bags, regular quality monitoring",
      "Premium storage conditions maintained, temperature 20°C",
      "Warehouse inspection passed, ready for distribution"
    ],
    distribution: [
      "Loaded for distribution to major cities across India",
      "Quality certificate issued, ready for retail distribution",
      "Distributed to premium tea retailers nationwide",
      "Express distribution to maintain freshness",
      "Bulk distribution to wholesale partners"
    ],
    retail: [
      "Received at retail store, quality verified and approved",
      "Premium display setup, proper storage maintained",
      "Available for sale, customer education materials provided",
      "Retail quality check completed, ready for customers",
      "Store inventory updated, promotional materials displayed"
    ],
    sold: [
      "Sold to premium tea connoisseur, customer satisfaction ensured",
      "Bulk purchase by corporate client for office pantry",
      "Sold to local tea shop for retail distribution",
      "Online order fulfilled, shipped with care instructions",
      "Wholesale purchase by restaurant chain"
    ]
  };

  let productCounter = 0;

  for (let i = 0; i < testProducts.length; i++) {
    const product = testProducts[i];
    const stageIndex = i;
    
    console.log(`\n🌿 Creating Product ${i + 1}: ${product.productName}`);
    console.log("-".repeat(50));
    
    try {
      // Step 1: Farmer creates product
      console.log("1️⃣ Farmer: Creating product...");
      const createTx = await contract.connect(farmer).createProduct(
        product.batchId,
        product.productName,
        product.origin,
        product.grade,
        product.quantity,
        product.notes
      );
      await createTx.wait();
      productCounter++;
      console.log(`   ✅ Product created with ID: ${productCounter}`);
      
      // Progress through stages based on product index
      if (i >= 0) { // All products go to processing
        console.log("2️⃣ Processor: Processing tea leaves...");
        const processTx = await contract.connect(processor).updateProductStage(
          productCounter,
          1, // Processing stage
          stageNotes.processing[stageIndex]
        );
        await processTx.wait();
        console.log("   ✅ Processing completed");
      }
      
      if (i >= 1) { // Products 2+ go to warehousing
        console.log("3️⃣ Warehouse: Storing processed tea...");
        const warehouseTx = await contract.connect(warehouse).updateProductStage(
          productCounter,
          2, // Warehousing stage
          stageNotes.warehousing[stageIndex]
        );
        await warehouseTx.wait();
        console.log("   ✅ Warehousing completed");
      }
      
      if (i >= 2) { // Products 3+ go to distribution
        console.log("4️⃣ Distributor: Distributing to retailers...");
        const distributeTx = await contract.connect(distributor).updateProductStage(
          productCounter,
          3, // Distribution stage
          stageNotes.distribution[stageIndex]
        );
        await distributeTx.wait();
        console.log("   ✅ Distribution completed");
      }
      
      if (i >= 3) { // Products 4+ go to retail
        console.log("5️⃣ Retailer: Receiving for retail sale...");
        const retailTx = await contract.connect(retailer).updateProductStage(
          productCounter,
          4, // Retail stage
          stageNotes.retail[stageIndex]
        );
        await retailTx.wait();
        console.log("   ✅ Retail stage completed");
      }
      
      if (i >= 4) { // Product 5 gets sold
        console.log("6️⃣ Retailer: Marking as sold...");
        const soldTx = await contract.connect(retailer).updateProductStage(
          productCounter,
          5, // Sold stage
          stageNotes.sold[stageIndex]
        );
        await soldTx.wait();
        console.log("   ✅ Product sold!");
      }
      
      const currentProduct = await contract.products(productCounter);
      const stages = ["Cultivation", "Processing", "Warehousing", "Distribution", "Retail", "Sold"];
      console.log(`   📊 Current Stage: ${stages[currentProduct.currentStage]}`);
      console.log(`   👤 Current Owner: ${currentProduct.currentOwner}`);
      
    } catch (error) {
      console.error(`   ❌ Error with ${product.productName}:`, error.message);
    }
  }
  
  console.log("\n" + "=".repeat(70));
  console.log("📊 TEST DATA SUMMARY");
  console.log("=".repeat(70));
  
  for (let i = 1; i <= productCounter; i++) {
    try {
      const product = await contract.products(i);
      const stages = ["Cultivation", "Processing", "Warehousing", "Distribution", "Retail", "Sold"];
      
      console.log(`\nProduct ${i}: ${product.productName}`);
      console.log(`  Batch ID: ${product.batchId}`);
      console.log(`  Origin: ${product.origin}`);
      console.log(`  Grade: ${product.grade}`);
      console.log(`  Quantity: ${product.quantity.toString()} kg`);
      console.log(`  Current Stage: ${stages[product.currentStage]}`);
      console.log(`  Current Owner: ${product.currentOwner}`);
      
      const history = await contract.getProductHistory(i);
      console.log(`  Supply Chain Steps: ${history.length}`);
      
    } catch (error) {
      console.error(`Error getting product ${i}:`, error.message);
    }
  }
  
  console.log("\n" + "=".repeat(70));
  console.log("🎉 TEST DATA CREATION COMPLETED!");
  console.log("=".repeat(70));
  console.log("\nYou now have:");
  console.log("• Product 1: At Processing stage");
  console.log("• Product 2: At Warehousing stage"); 
  console.log("• Product 3: At Distribution stage");
  console.log("• Product 4: At Retail stage");
  console.log("• Product 5: Completely sold (full supply chain)");
  console.log("\nYou can now test your frontend with this diverse dataset!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});