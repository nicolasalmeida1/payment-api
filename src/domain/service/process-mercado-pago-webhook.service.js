import Logger from '../../infrastructure/logger/logger.js';
import { PaymentStatus, PaymentEvent } from '../enums/index.js';
import { PaymentNotFoundError } from '../errors/domain.errors.js';

export default class ProcessMercadoPagoWebhookService {
  constructor({ paymentRepository, paymentHistoryRepository, mercadoPagoService }) {
    this.paymentRepository = paymentRepository;
    this.paymentHistoryRepository = paymentHistoryRepository;
    this.mercadoPagoService = mercadoPagoService;
    this.logger = new Logger(this.constructor.name);
  }

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

  getPaymentEventFromStatus() {
    return PaymentEvent.STATUS_CHANGED;
  }

  shouldIgnoreWebhook(webhookData) {
    return webhookData.type !== 'payment';
  }

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
