import ListPaymentsCommand from '../../domain/command/list-payments.command.js';
import ListPaymentsService from '../../domain/service/list-payments.service.js';
import PaymentRepository from '../repositories/payment.repository.js';
import db from '../../db/connection.js';

/**
 * Factory for creating ListPaymentsCommand with all dependencies
 * @class ListPaymentsCommandFactory
 */
export default class ListPaymentsCommandFactory {
  /**
   * Creates a fully configured ListPaymentsCommand instance
   * @returns {ListPaymentsCommand} Configured command instance
   */
  static create() {
    const paymentRepository = new PaymentRepository(db);
    const listPaymentsService = new ListPaymentsService({
      paymentRepository,
    });

    return new ListPaymentsCommand({ listPaymentsService });
  }
}
