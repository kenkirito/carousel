// Test script to verify CarouselAI generates unique, non-repetitive content
// Run: node test-variations.js

const TEST_CONFIG = {
  topic: 'AI tools for productivity',
  niche: 'tech',
  tone: 'viral',
  username: 'testuser',
  numSlides: 5,
  iterations: 5,
};

async function generateCarousel(iteration) {
  try {
    const response = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...TEST_CONFIG,
        variationSeed: Date.now() + iteration,
        userId: `test_user_${iteration}`,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Iteration ${iteration} failed:`, error.message);
    return null;
  }
}

function extractHooks(results) {
  return results.map((r, i) => ({
    iteration: i + 1,
    hook: r?.slides?.[0]?.title || 'N/A',
    emoji: r?.slides?.[0]?.emoji || 'N/A',
  }));
}

function checkForDuplicates(hooks) {
  const seen = new Set();
  const duplicates = [];

  hooks.forEach(({ hook, iteration }) => {
    const normalized = hook.toLowerCase().trim();
    if (seen.has(normalized)) {
      duplicates.push({ hook, iteration });
    }
    seen.add(normalized);
  });

  return duplicates;
}

function analyzeVariation(results) {
  const titles = results.flatMap(r => r.slides.map(s => s.title));
  const uniqueTitles = new Set(titles.map(t => t.toLowerCase()));

  const emojis = results.flatMap(r => r.slides.map(s => s.emoji));
  const uniqueEmojis = new Set(emojis);

  return {
    totalSlides: titles.length,
    uniqueTitles: uniqueTitles.size,
    uniqueEmojis: uniqueEmojis.size,
    diversityScore: ((uniqueTitles.size / titles.length) * 100).toFixed(1),
  };
}

async function runTests() {
  console.log('🧪 CarouselAI Variation Test Suite\n');
  console.log(`Testing ${TEST_CONFIG.iterations} generations...\n`);

  const results = [];

  for (let i = 0; i < TEST_CONFIG.iterations; i++) {
    process.stdout.write(`  Generating #${i + 1}... `);
    const result = await generateCarousel(i);
    if (result) {
      results.push(result);
      console.log('✅');
    } else {
      console.log('❌');
    }
    await new Promise(r => setTimeout(r, 500));
  }

  if (results.length === 0) {
    console.log('\n❌ All generations failed. Is the server running?');
    console.log('   Run: npm run dev');
    process.exit(1);
  }

  console.log('\n📊 Results:\n');

  // Extract and display hooks
  const hooks = extractHooks(results);
  console.log('Generated Hooks:');
  hooks.forEach(({ iteration, hook, emoji }) => {
    console.log(`  ${iteration}. ${emoji} "${hook}"`);
  });

  // Check for duplicates
  const duplicates = checkForDuplicates(hooks);
  console.log('\n🔍 Duplicate Analysis:');
  if (duplicates.length === 0) {
    console.log('  ✅ No duplicate hooks found!');
  } else {
    console.log(`  ⚠️  Found ${duplicates.length} duplicate(s):`);
    duplicates.forEach(d => console.log(`     - "${d.hook}" (gen #${d.iteration})`));
  }

  // Variation analysis
  const stats = analyzeVariation(results);
  console.log('\n📈 Variation Statistics:');
  console.log(`  Total slides: ${stats.totalSlides}`);
  console.log(`  Unique titles: ${stats.uniqueTitles}`);
  console.log(`  Unique emojis: ${stats.uniqueEmojis}`);
  console.log(`  Diversity score: ${stats.diversityScore}%`);

  // Overall assessment
  console.log('\n🎯 Assessment:');
  const passed = duplicates.length === 0 && parseFloat(stats.diversityScore) > 70;
  if (passed) {
    console.log('  ✅ PASSED - Good variation detected');
  } else {
    console.log('  ⚠️  NEEDS IMPROVEMENT - Low variation detected');
  }

  // Check metadata
  console.log('\n📋 Generation Metadata:');
  results.forEach((r, i) => {
    if (r.meta?.variation) {
      console.log(`  #${i + 1}: ${r.meta.variation.hookStyle} hook, ${r.meta.variation.slideStructure} structure`);
    }
  });

  console.log('\n✨ Test complete!\n');
}

runTests().catch(console.error);
