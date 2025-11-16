import ProcessMercadoPagoWebhookCommand from '../../domain/command/process-mercado-pago-webhook.command.js';
import ProcessMercadoPagoWebhookService from '../../domain/service/process-mercado-pago-webhook.service.js';
import PaymentRepository from '../repositories/payment.repository.js';
import PaymentHistoryRepository from '../repositories/payment-history.repository.js';
import MercadoPagoService from '../services/mercado-pago.service.js';
import db from '../../db/connection.js';

/**
 * Factory for creating ProcessMercadoPagoWebhookCommand with all dependencies
 * @class ProcessMercadoPagoWebhookCommandFactory
 */
export default class ProcessMercadoPagoWebhookCommandFactory {
  /**
   * Creates a fully configured ProcessMercadoPagoWebhookCommand instance
   * @returns {ProcessMercadoPagoWebhookCommand} Configured command instance
   */
  static create() {
    const paymentRepository = new PaymentRepository(db);
    const paymentHistoryRepository = new PaymentHistoryRepository(db);
    const mercadoPagoService = new MercadoPagoService();
    const processMercadoPagoWebhookService = new ProcessMercadoPagoWebhookService({
      paymentRepository,
      paymentHistoryRepository,
      mercadoPagoService,
    });

    return new ProcessMercadoPagoWebhookCommand({
      processMercadoPagoWebhookService,
    });
  }
}
