#!/usr/bin/env node
/**
 * CLI Runner for Bob Prompt Testing
 * Usage: npm run test:bob
 */

import { runComprehensiveBobTest } from './bob-prompt-testing';

async function main() {
  try {
    await runComprehensiveBobTest();
    process.exit(0);
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

main();

// Made with Bob
