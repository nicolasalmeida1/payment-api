import { Connection, Client } from '@temporalio/client';
import Logger from '../infrastructure/logger/logger.js';

const logger = new Logger('TemporalClient');

let clientInstance = null;

/**
 * Gets or creates a Temporal client instance (singleton)
 * @returns {Promise<Client>} Temporal client instance
 * @throws {Error} If connection fails
 */
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

/**
 * Starts a credit card payment workflow in Temporal
 * @param {PaymentWorkflowInput} paymentData - Payment workflow input data
 * @returns {Promise<WorkflowResponse>} Workflow ID and run ID
 * @throws {Error} If workflow start fails
 */
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

/**
 * Gets the result of a completed credit card payment workflow
 * @param {string} workflowId - Workflow identifier
 * @returns {Promise<PaymentWorkflowResult>} Workflow execution result
 * @throws {Error} If workflow not found or failed
 */
export async function getCreditCardPaymentWorkflowResult(workflowId) {
  try {
    const client = await getTemporalClient();

    const handle = client.workflow.getHandle(workflowId);

    const result = await handle.result();

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

/**
 * Gets the current status of a credit card payment workflow
 * @param {string} workflowId - Workflow identifier
 * @returns {Promise<WorkflowStatusResponse>} Workflow status information
 * @throws {Error} If workflow not found
 */
export async function getCreditCardPaymentWorkflowStatus(workflowId) {
  try {
    const client = await getTemporalClient();

    const handle = client.workflow.getHandle(workflowId);

    const description = await handle.describe();

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

/**
 * Closes the Temporal client connection
 * @returns {Promise<void>}
 */
export async function closeTemporalClient() {
  if (clientInstance) {
    await clientInstance.connection.close();
    clientInstance = null;
  }
}
