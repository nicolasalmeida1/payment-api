import ListPaymentsCommand from '../../domain/command/list-payments.command.js';
import ListPaymentsService from '../../domain/service/list-payments.service.js';
import PaymentRepository from '../repositories/payment.repository.js';
import db from '../../db/connection.js';

export default class ListPaymentsCommandFactory {
  static create() {
    const paymentRepository = new PaymentRepository(db);
    const listPaymentsService = new ListPaymentsService({
      paymentRepository,
    });

    return new ListPaymentsCommand({ listPaymentsService });
  }
}
