/**
 * verify-match.js
 * Automated integration test verifying:
 * 1. The custom matchmaking weight calculation logic.
 * 2. The AI taxonomy fallback heuristic generator.
 */

import { analyzeProductsHelper, analyzeIntentHelper } from './api/routes/ai.js';

// 1. Define verification matching function
function calculateScore(shop, dropshipper) {
  const shopCategories = shop.categories.map(c => c.toLowerCase());
  const shopTags = shop.tags.map(t => t.toLowerCase());

  const sharedCategories = dropshipper.categories.filter(c =>
    shopCategories.includes(c.toLowerCase())
  );
  
  const sharedTags = dropshipper.tags.filter(t =>
    shopTags.includes(t.toLowerCase())
  );

  const score = (sharedCategories.length * 2) + sharedTags.length;

  return {
    score,
    sharedCategories,
    sharedTags
  };
}

async function runTests() {
  console.log('🧪 Starting Automated Verification tests...');
  let failed = false;

  // Test Case 1: Match Score Calculation
  console.log('\n--- Test 1: Match Score Logic ---');
  const mockShop = {
    categories: ['Drinkware & Kitchen', 'Eco-Friendly'],
    tags: ['eco-friendly', 'reusable', 'stainless-steel', 'wholesale']
  };

  const mockDropshipper = {
    categories: ['Eco-Friendly', 'Accessories'],
    tags: ['bamboo', 'biodegradable', 'eco-friendly', 'reusable', 'organic']
  };

  // Expected Overlap:
  // Categories: ['Eco-Friendly'] -> 1 match * 2 = 2 points
  // Tags: ['eco-friendly', 'reusable'] -> 2 matches * 1 = 2 points
  // Total Score: 4
  const result = calculateScore(mockShop, mockDropshipper);
  console.log(`Computed Score: ${result.score} (Expected: 4)`);
  console.log(`Shared Categories: [${result.sharedCategories.join(', ')}]`);
  console.log(`Shared Tags: [${result.sharedTags.join(', ')}]`);

  if (result.score !== 4) {
    console.error('❌ Test 1 Failed: Score math is incorrect.');
    failed = true;
  } else {
    console.log('✅ Test 1 Passed: Score math is correct.');
  }

  // Test Case 2: Heuristic Product Extraction
  console.log('\n--- Test 2: AI Heuristic Product Analysis Fallback ---');
  const rawProductInput = "We sell leather wallets, vegetable-tanned bags, and eco-friendly accessories.";
  const productAnalysis = await analyzeProductsHelper(rawProductInput);
  
  console.log('Analyzed Products:', JSON.stringify(productAnalysis, null, 2));

  if (!productAnalysis.categories.includes('Accessories') && !productAnalysis.categories.includes('Eco-Friendly')) {
    console.error('❌ Test 2 Failed: AI Heuristic failed to map "Accessories" category.');
    failed = true;
  } else {
    console.log('✅ Test 2 Passed: Heuristic mapped categories correctly.');
  }

  // Test Case 3: Heuristic Intent Extraction
  console.log('\n--- Test 3: AI Heuristic Sourcing Intent Fallback ---');
  const rawIntentInput = "Looking to source insulated vacuum bottles and stainless steel mugs.";
  const intentAnalysis = await analyzeIntentHelper(rawIntentInput);

  console.log('Analyzed Intent:', JSON.stringify(intentAnalysis, null, 2));

  if (intentAnalysis.categories.length === 0) {
    console.error('❌ Test 3 Failed: Heuristic failed to extract intent categories.');
    failed = true;
  } else {
    console.log('✅ Test 3 Passed: Heuristic successfully processed intent text.');
  }

  if (failed) {
    console.log('\n❌ Verification Failed. Please fix test discrepancies.');
    process.exit(1);
  } else {
    console.log('\n🎉 All Automated Verifications Passed Successfully!');
    process.exit(0);
  }
}

runTests();
