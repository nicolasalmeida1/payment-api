import UpdatePaymentCommand from '../../domain/command/update-payment.command.js';
import UpdatePaymentService from '../../domain/service/update-payment.service.js';
import PaymentRepository from '../repositories/payment.repository.js';
import PaymentHistoryRepository from '../repositories/payment-history.repository.js';
import db from '../../db/connection.js';

export default class UpdatePaymentCommandFactory {
  static create() {
    const paymentRepository = new PaymentRepository(db);
    const paymentHistoryRepository = new PaymentHistoryRepository(db);
    const updatePaymentService = new UpdatePaymentService({
      paymentRepository,
      paymentHistoryRepository,
    });

    return new UpdatePaymentCommand({ updatePaymentService });
  }
}
