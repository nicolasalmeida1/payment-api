import { proxyActivities, sleep } from '@temporalio/workflow';

const activities = proxyActivities({
  startToCloseTimeout: '1 minute',
  retry: {
    initialInterval: '1s',
    maximumInterval: '30s',
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
});

/**
 * Temporal workflow for processing credit card payments
 * Orchestrates payment preference creation and status polling
 * @param {PaymentWorkflowInput} paymentInput - Payment workflow input data
 * @returns {Promise<PaymentWorkflowResult>} Workflow execution result
 * @throws {Error} If payment ID is missing or workflow fails
 */
export async function creditCardPaymentWorkflow(paymentInput) {
  const { cpf, description, amount, paymentMethod, id } = paymentInput;

  if (!id) {
    throw new Error('Payment ID is required');
  }

  const payment = {
    id,
    cpf,
    description,
    amount,
    payment_method: paymentMethod,
    status: 'PENDING',
  };

  let mercadoPagoPreference;
  try {
    mercadoPagoPreference = await activities.createMercadoPagoPreference(payment);
  } catch (error) {
    await activities.updatePaymentStatus(payment.id, 'FAIL', {
      error: 'Failed to create Mercado Pago preference',
    });
    throw error;
  }

  let paymentStatus = 'PENDING';
  let attempts = 0;
  const maxAttempts = 20;
  const initialDelay = 3000;

  while (paymentStatus === 'PENDING' && attempts < maxAttempts) {
    const delay = initialDelay * Math.pow(1.2, attempts);
    await sleep(delay);

    try {
      const mercadoPagoPayment = await activities.checkPaymentStatus(payment.id);
      const mappedStatus = await activities.mapMercadoPagoStatusToPaymentStatus(mercadoPagoPayment.status);

      if (mappedStatus !== 'PENDING') {
        await activities.updatePaymentStatus(payment.id, mappedStatus, mercadoPagoPayment);
        paymentStatus = mappedStatus;
      }
    } catch (error) {
      console.error(`[Workflow] Attempt ${attempts + 1} failed to check payment status:`, error.message);
    }

    attempts++;
  }

  if (paymentStatus === 'PENDING' && attempts >= maxAttempts) {
    await activities.updatePaymentStatus(payment.id, 'FAIL', {
      error: 'Payment timeout - no status update from Mercado Pago',
    });

    throw new Error('Payment processing timeout');
  }

  return {
    paymentId: payment.id,
    status: paymentStatus,
    preferenceId: mercadoPagoPreference.preference_id,
    initPoint: mercadoPagoPreference.init_point,
    sandboxInitPoint: mercadoPagoPreference.sandbox_init_point,
  };
}
