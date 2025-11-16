import { Worker } from '@temporalio/worker';
import * as activities from './activities/payment.activities.js';
import Logger from '../infrastructure/logger/logger.js';

const logger = new Logger('TemporalWorker');

export async function createWorker() {
  try {
    const worker = await Worker.create({
      workflowsPath: new URL('./workflows/credit-card-payment.workflow.js', import.meta.url).pathname,
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
