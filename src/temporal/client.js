import { Connection, Client } from '@temporalio/client';
import Logger from '../infrastructure/logger/logger.js';

const logger = new Logger('TemporalClient');

let clientInstance = null;

export async function getTemporalClient() {
  if (clientInstance) {
    return clientInstance;
  }

  try {
    const connection = await Connection.connect({
      address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    });

    clientInstance = new Client({
      connection,
      namespace: process.env.TEMPORAL_NAMESPACE || 'default',
    });

    return clientInstance;
  } catch (error) {
    logger.error('Failed to connect Temporal client', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function startCreditCardPaymentWorkflow(paymentData) {
  try {
    const client = await getTemporalClient();

    const workflowId = `credit-card-payment-${paymentData.id}`;

    const handle = await client.workflow.start('creditCardPaymentWorkflow', {
      taskQueue: 'payment-queue',
      workflowId,
      args: [paymentData],
      workflowIdReusePolicy: 'WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE',
    });

    logger.info('Credit card payment workflow started', {
      workflowId,
      paymentId: paymentData.id,
      runId: handle.firstExecutionRunId,
    });

    return {
      workflowId,
      runId: handle.firstExecutionRunId,
    };
  } catch (error) {
    logger.error('Failed to start credit card payment workflow', {
      error: error.message,
      stack: error.stack,
      paymentData,
    });
    throw error;
  }
}

export async function getCreditCardPaymentWorkflowResult(workflowId) {
  try {
    const client = await getTemporalClient();

    const handle = client.workflow.getHandle(workflowId);

    const result = await handle.result();

    logger.info('Credit card payment workflow result retrieved', {
      workflowId,
      result,
    });

    return result;
  } catch (error) {
    logger.error('Failed to get workflow result', {
      error: error.message,
      stack: error.stack,
      workflowId,
    });
    throw error;
  }
}

export async function getCreditCardPaymentWorkflowStatus(workflowId) {
  try {
    const client = await getTemporalClient();

    const handle = client.workflow.getHandle(workflowId);

    const description = await handle.describe();

    logger.info('Credit card payment workflow status retrieved', {
      workflowId,
      status: description.status,
    });

    return {
      workflowId,
      status: description.status.name,
      startTime: description.startTime,
      closeTime: description.closeTime,
      executionTime: description.executionTime,
    };
  } catch (error) {
    logger.error('Failed to get workflow status', {
      error: error.message,
      stack: error.stack,
      workflowId,
    });
    throw error;
  }
}

export async function closeTemporalClient() {
  if (clientInstance) {
    await clientInstance.connection.close();
    clientInstance = null;
    logger.info('Temporal client connection closed');
  }
}
