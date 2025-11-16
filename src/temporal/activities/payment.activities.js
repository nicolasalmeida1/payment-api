import db from '../../db/connection.js';
import PaymentRepository from '../../infrastructure/repositories/payment.repository.js';
import PaymentHistoryRepository from '../../infrastructure/repositories/payment-history.repository.js';
import MercadoPagoService from '../../infrastructure/services/mercado-pago.service.js';
import MercadoPagoMockService from '../../infrastructure/services/mercado-pago-mock.service.js';
import { PaymentStatus, PaymentEvent } from '../../domain/enums/index.js';
import Logger from '../../infrastructure/logger/logger.js';

const logger = new Logger('PaymentActivities');

const useMock = !process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.USE_MERCADO_PAGO_MOCK === 'true';

/**
 * Temporal activity: Creates a payment record in the database
 * @param {PaymentData} paymentData - Payment data to insert
 * @returns {Promise<Payment>} Created payment record
 * @throws {Error} If payment creation fails
 */
export async function createPaymentRecord(paymentData) {
  logger.info('Creating payment record in database', { paymentId: paymentData.id });

  const paymentRepository = new PaymentRepository(db);
  const paymentHistoryRepository = new PaymentHistoryRepository(db);

  try {
    await paymentRepository.startTransaction();
    paymentHistoryRepository.setTransaction(paymentRepository.trx);

    const payment = await paymentRepository.create(paymentData);

    const historyData = {
      payment_id: payment.id,
      event: PaymentEvent.PAYMENT_CREATED,
      event_data: {
        cpf: payment.cpf,
        description: payment.description,
        amount: payment.amount,
        payment_method: payment.payment_method,
        status: payment.status,
      },
    };

    await paymentHistoryRepository.create(historyData);
    await paymentRepository.commitTransaction();

    logger.info('Payment record created successfully', { paymentId: payment.id });

    return payment;
  } catch (error) {
    await paymentRepository.rollbackTransaction();
    logger.error('Error creating payment record', {
      error: error.message,
      stack: error.stack,
      paymentId: paymentData.id,
    });
    throw error;
  }
}

/**
 * Temporal activity: Creates a payment preference in Mercado Pago
 * @param {Payment} payment - Payment object
 * @returns {Promise<MercadoPagoPreferenceResponse>} Preference data
 * @throws {Error} If preference creation fails
 */
export async function createMercadoPagoPreference(payment) {
  const mercadoPagoService = useMock ? new MercadoPagoMockService() : new MercadoPagoService();

  try {
    const preference = await mercadoPagoService.createPreference(payment);

    logger.info('Mercado Pago preference created', {
      paymentId: payment.id,
      preferenceId: preference.id,
    });

    return {
      preference_id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
    };
  } catch (error) {
    logger.error('Error creating Mercado Pago preference', {
      error: error.message,
      stack: error.stack,
      paymentId: payment.id,
    });
    throw error;
  }
}

/**
 * Temporal activity: Checks payment status from Mercado Pago
 * @param {string} mercadoPagoPaymentId - Mercado Pago payment identifier
 * @returns {Promise<MercadoPagoStatusResponse>} Payment status information
 * @throws {Error} If status check fails
 */
export async function checkPaymentStatus(mercadoPagoPaymentId) {
  const mercadoPagoService = useMock ? new MercadoPagoMockService() : new MercadoPagoService();

  try {
    const payment = await mercadoPagoService.getPayment(mercadoPagoPaymentId);

    logger.info('Payment status retrieved', {
      mercadoPagoPaymentId,
      status: payment.status,
    });

    return {
      status: payment.status,
      external_reference: payment.external_reference,
      transaction_amount: payment.transaction_amount,
    };
  } catch (error) {
    logger.error('Error checking payment status', {
      error: error.message,
      stack: error.stack,
      mercadoPagoPaymentId,
    });
    throw error;
  }
}

/**
 * Temporal activity: Updates payment status in database
 * @param {string} paymentId - Payment identifier
 * @param {PaymentStatusType} newStatus - New payment status
 * @param {Object} [mercadoPagoData] - Optional Mercado Pago metadata
 * @returns {Promise<UpdatePaymentStatusResult>} Update result
 * @throws {Error} If payment not found or update fails
 */
export async function updatePaymentStatus(paymentId, newStatus, mercadoPagoData) {
  logger.info('Updating payment status', { paymentId, newStatus });

  const paymentRepository = new PaymentRepository(db);
  const paymentHistoryRepository = new PaymentHistoryRepository(db);

  try {
    await paymentRepository.startTransaction();
    paymentHistoryRepository.setTransaction(paymentRepository.trx);

    const payment = await paymentRepository.findById(paymentId);

    if (!payment) {
      throw new Error(`Payment not found: ${paymentId}`);
    }

    const oldStatus = payment.status;

    await paymentRepository.update(paymentId, { status: newStatus });

    const historyData = {
      payment_id: paymentId,
      event: PaymentEvent.PAYMENT_STATUS_CHANGED,
      event_data: {
        old_status: oldStatus,
        new_status: newStatus,
        mercado_pago_status: mercadoPagoData?.status,
        mercado_pago_payment_id: mercadoPagoData?.id,
      },
    };

    await paymentHistoryRepository.create(historyData);
    await paymentRepository.commitTransaction();

    logger.info('Payment status updated successfully', {
      paymentId,
      oldStatus,
      newStatus,
    });

    return { success: true, oldStatus, newStatus };
  } catch (error) {
    await paymentRepository.rollbackTransaction();
    logger.error('Error updating payment status', {
      error: error.message,
      stack: error.stack,
      paymentId,
    });
    throw error;
  }
}

/**
 * Maps Mercado Pago status to internal payment status
 * @param {MercadoPagoStatusType} mercadoPagoStatus - Mercado Pago status
 * @returns {PaymentStatusType} Internal payment status
 */
export function mapMercadoPagoStatusToPaymentStatus(mercadoPagoStatus) {
  const statusMap = {
    approved: PaymentStatus.PAID,
    rejected: PaymentStatus.FAIL,
    cancelled: PaymentStatus.FAIL,
    refunded: PaymentStatus.FAIL,
    charged_back: PaymentStatus.FAIL,
    pending: PaymentStatus.PENDING,
    in_process: PaymentStatus.PENDING,
    in_mediation: PaymentStatus.PENDING,
    authorized: PaymentStatus.PENDING,
  };

  return statusMap[mercadoPagoStatus] || PaymentStatus.PENDING;
}
