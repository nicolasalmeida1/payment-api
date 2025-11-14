import GetPaymentByIdCommand from '../../domain/command/get-payment-by-id.command.js';
import GetPaymentByIdService from '../../domain/service/get-payment-by-id.service.js';
import PaymentRepository from '../repositories/payment.repository.js';
import db from '../../db/connection.js';

export default class GetPaymentByIdCommandFactory {
  static create() {
    const paymentRepository = new PaymentRepository(db);
    const getPaymentByIdService = new GetPaymentByIdService({
      paymentRepository,
    });

    return new GetPaymentByIdCommand({ getPaymentByIdService });
  }
}
