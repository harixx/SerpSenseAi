#!/usr/bin/env node

// Quick production build checker to identify path resolution issues
import fs from 'fs';
import path from 'path';

console.log('🔍 Checking production build for path resolution issues...');

try {
  const buildFile = fs.readFileSync('dist/index.js', 'utf8');
  
  // Look for problematic patterns
  const problematicPatterns = [
    /path\.resolve\([^,\)]*undefined/g,
    /path\.resolve\([^,\)]*process\.env\.[A-Z_]+\)/g,
    /path\.resolve\([^,\)]*import\.meta\.dirname/g,
    /\bprocess\.env\.[A-Z_]+\b(?![^,\)]*\|\|)/g  // env vars without fallback
  ];
  
  let issuesFound = 0;
  
  problematicPatterns.forEach((pattern, index) => {
    const matches = buildFile.match(pattern);
    if (matches) {
      console.log(`❌ Pattern ${index + 1} found ${matches.length} potential issues:`);
      matches.forEach((match, i) => {
        if (i < 3) console.log(`   - ${match}`);
      });
      if (matches.length > 3) console.log(`   ... and ${matches.length - 3} more`);
      issuesFound += matches.length;
    }
  });
  
  if (issuesFound === 0) {
    console.log('✅ No obvious path resolution issues found in build');
  } else {
    console.log(`⚠️ Found ${issuesFound} potential path resolution issues`);
  }
  
  // Check file size
  const stats = fs.statSync('dist/index.js');
  console.log(`📊 Build size: ${(stats.size / 1024).toFixed(1)}KB`);
  
} catch (error) {
  console.error('❌ Error checking build:', error.message);
  process.exit(1);
}