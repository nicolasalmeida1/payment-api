import Logger from '../../infrastructure/logger/logger.js';
import { PaymentStatus, PaymentEvent } from '../enums/index.js';
import { PaymentNotFoundError } from '../errors/domain.errors.js';

/**
 * Service responsible for processing Mercado Pago webhook notifications
 * @class ProcessMercadoPagoWebhookService
 */
export default class ProcessMercadoPagoWebhookService {
  /**
   * Creates an instance of ProcessMercadoPagoWebhookService
   * @param {ServiceDependencies} dependencies - Service dependencies
   */
  constructor({ paymentRepository, paymentHistoryRepository, mercadoPagoService }) {
    this.paymentRepository = paymentRepository;
    this.paymentHistoryRepository = paymentHistoryRepository;
    this.mercadoPagoService = mercadoPagoService;
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * Maps Mercado Pago payment status to internal payment status
   * @param {MercadoPagoStatusType} mercadoPagoStatus - Mercado Pago status
   * @returns {PaymentStatusType} Internal payment status
   */
  mapMercadoPagoStatusToPaymentStatus(mercadoPagoStatus) {
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

  /**
   * Gets payment event type for status change
   * @returns {PaymentEventType} Payment event type
   */
  getPaymentEventFromStatus() {
    return PaymentEvent.STATUS_CHANGED;
  }

  /**
   * Checks if webhook should be ignored
   * @param {MercadoPagoWebhookInput} webhookData - Webhook data
   * @returns {boolean} True if webhook should be ignored
   */
  shouldIgnoreWebhook(webhookData) {
    return webhookData.type !== 'payment';
  }

  /**
   * Fetches payment details from Mercado Pago API
   * @param {string} mercadoPagoPaymentId - Mercado Pago payment ID
   * @returns {Promise<{mercadoPagoPayment: MercadoPagoPayment, paymentId: string}|null>} Payment data or null
   */
  async fetchMercadoPagoPaymentData(mercadoPagoPaymentId) {
    this.logger.debug('Fetching payment details from Mercado Pago', {
      mercadoPagoPaymentId,
    });

    const mercadoPagoPayment = await this.mercadoPagoService.getPayment(mercadoPagoPaymentId);

    const paymentId = mercadoPagoPayment.external_reference;

    if (!paymentId) {
      this.logger.warn('Payment missing external_reference', {
        mercadoPagoPaymentId,
      });

      return null;
    }

    return { mercadoPagoPayment, paymentId };
  }

  /**
   * Updates payment status and creates history entry
   * @param {Payment} payment - Payment record
   * @param {PaymentStatusType} newStatus - New payment status
   * @param {*} transaction - Database transaction
   * @returns {Promise<void>}
   */
  async updatePaymentStatus(payment, newStatus, transaction) {
    await this.paymentRepository.update(payment.id, { status: newStatus }, transaction);

    const event = this.getPaymentEventFromStatus(newStatus);
    const historyData = {
      paymentId: payment.id,
      event,
      oldValue: payment.status,
      newValue: newStatus,
    };

    await this.paymentHistoryRepository.add(historyData, transaction);

    this.logger.info('Payment status updated successfully', {
      paymentId: payment.id,
      oldStatus: payment.status,
      newStatus,
      event,
    });
  }

  /**
   * Processes payment status change from webhook
   * @param {string} paymentId - Payment identifier
   * @param {MercadoPagoPayment} mercadoPagoPayment - Mercado Pago payment data
   * @returns {Promise<ServiceResponse>} Processing result
   * @throws {PaymentNotFoundError} If payment doesn't exist
   */
  async processPaymentStatusChange(paymentId, mercadoPagoPayment) {
    const transaction = await this.paymentRepository.startTransaction();

    try {
      const payment = await this.paymentRepository.findById(paymentId, transaction);

      if (!payment) {
        throw new PaymentNotFoundError(paymentId);
      }

      const newStatus = this.mapMercadoPagoStatusToPaymentStatus(mercadoPagoPayment.status);

      this.logger.info('Mapped Mercado Pago status', {
        paymentId,
        mercadoPagoStatus: mercadoPagoPayment.status,
        newStatus,
        currentStatus: payment.status,
      });

      if (payment.status === newStatus) {
        this.logger.info('Payment status unchanged, skipping update', {
          paymentId,
          status: payment.status,
        });

        await transaction.commit();

        return {
          success: true,
          message: 'Payment status unchanged',
          data: { paymentId, status: payment.status },
        };
      }

      await this.updatePaymentStatus(payment, newStatus, transaction);

      await transaction.commit();

      return {
        success: true,
        message: 'Payment status updated successfully',
        data: {
          paymentId,
          oldStatus: payment.status,
          newStatus,
        },
      };
    } catch (error) {
      await transaction.rollback();

      this.logger.error('Error processing Mercado Pago webhook', {
        error: error.message,
        stack: error.stack,
      });

      throw error;
    }
  }

  /**
   * Processes Mercado Pago webhook notification
   * @param {MercadoPagoWebhookInput} webhookData - Webhook payload
   * @returns {Promise<ServiceResponse>} Processing result
   */
  async execute(webhookData) {
    this.logger.debug('Processing Mercado Pago webhook', {
      action: webhookData.action,
      type: webhookData.type,
      dataId: webhookData.data?.id,
    });

    if (this.shouldIgnoreWebhook(webhookData)) {
      this.logger.info('Ignoring non-payment webhook', {
        type: webhookData.type,
      });

      return {
        success: true,
        message: 'Webhook ignored - not a payment notification',
      };
    }

    const mercadoPagoPaymentId = webhookData.data.id;

    const paymentData = await this.fetchMercadoPagoPaymentData(mercadoPagoPaymentId);

    if (!paymentData) {
      return {
        success: false,
        message: 'Payment missing external_reference',
      };
    }

    const { mercadoPagoPayment, paymentId } = paymentData;

    return this.processPaymentStatusChange(paymentId, mercadoPagoPayment);
  }
}
