import CreatePaymentCommand from '../../domain/command/create-payment.command.js';
import CreatePaymentService from '../../domain/service/create-payment.service.js';
import PaymentRepository from '../repositories/payment.repository.js';
import PaymentHistoryRepository from '../repositories/payment-history.repository.js';
import db from '../../db/connection.js';

export default class CreatePaymentCommandFactory {
  static create() {
    const paymentRepository = new PaymentRepository(db);
    const paymentHistoryRepository = new PaymentHistoryRepository(db);
    const createPaymentService = new CreatePaymentService({
      paymentRepository,
      paymentHistoryRepository,
    });

    return new CreatePaymentCommand({ createPaymentService });
  }
}
