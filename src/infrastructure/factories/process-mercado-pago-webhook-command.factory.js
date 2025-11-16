import ProcessMercadoPagoWebhookCommand from '../../domain/command/process-mercado-pago-webhook.command.js';
import ProcessMercadoPagoWebhookService from '../../domain/service/process-mercado-pago-webhook.service.js';
import PaymentRepository from '../repositories/payment.repository.js';
import PaymentHistoryRepository from '../repositories/payment-history.repository.js';
import MercadoPagoService from '../services/mercado-pago.service.js';
import db from '../../db/connection.js';

export default class ProcessMercadoPagoWebhookCommandFactory {
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
