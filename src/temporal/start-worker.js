#!/usr/bin/env node

import { runWorker } from './worker.js';
import Logger from '../infrastructure/logger/logger.js';

const logger = new Logger('StartWorker');

logger.info('Starting Temporal Worker for payment processing...');

runWorker().catch(error => {
  logger.error('Worker failed to start', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});
