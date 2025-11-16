import { Worker } from '@temporalio/worker';
import * as activities from './activities/payment.activities.js';
import Logger from '../infrastructure/logger/logger.js';
import { fileURLToPath } from 'url';
import path from 'path';

const logger = new Logger('TemporalWorker');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Creates a Temporal worker instance
 * @returns {Promise<Worker>} Configured Temporal worker
 * @throws {Error} If worker creation fails
 */
export async function createWorker() {
  try {
    const workflowsPath = path.join(__dirname, 'workflows');

    const worker = await Worker.create({
      workflowsPath,
      activities,
      taskQueue: 'payment-queue',
      maxConcurrentActivityTaskExecutions: 10,
      maxConcurrentWorkflowTaskExecutions: 10,
    });

    logger.info('Temporal worker created successfully', {
      taskQueue: 'payment-queue',
    });

    return worker;
  } catch (error) {
    logger.error('Failed to create Temporal worker', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * Runs the Temporal worker
 * @returns {Promise<void>}
 * @throws {Error} If worker execution fails
 */
export async function runWorker() {
  const worker = await createWorker();

  logger.info('Starting Temporal worker...');

  await worker.run();

  logger.info('Temporal worker stopped');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runWorker().catch(error => {
    logger.error('Worker failed', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });
}
