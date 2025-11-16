#!/usr/bin/env node

import { runWorker } from './worker.js';

console.log('🚀 Starting Temporal Worker for payment processing...');

runWorker().catch(error => {
  console.error('❌ Worker failed to start:', error);
  process.exit(1);
});
