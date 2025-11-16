import CreatePaymentCommand from '../../domain/command/create-payment.command.js';
import CreatePaymentService from '../../domain/service/create-payment.service.js';
import PaymentRepository from '../repositories/payment.repository.js';
import PaymentHistoryRepository from '../repositories/payment-history.repository.js';
import MercadoPagoService from '../services/mercado-pago.service.js';
import db from '../../db/connection.js';

/**
 * Factory for creating CreatePaymentCommand with all dependencies
 * @class CreatePaymentCommandFactory
 */
export default class CreatePaymentCommandFactory {
  /**
   * Creates a fully configured CreatePaymentCommand instance
   * @returns {CreatePaymentCommand} Configured command instance
   */
  static create() {
    const paymentRepository = new PaymentRepository(db);
    const paymentHistoryRepository = new PaymentHistoryRepository(db);
    const mercadoPagoService = new MercadoPagoService();
    const createPaymentService = new CreatePaymentService({
      paymentRepository,
      paymentHistoryRepository,
      mercadoPagoService,
    });

    return new CreatePaymentCommand({ createPaymentService });
  }
}
