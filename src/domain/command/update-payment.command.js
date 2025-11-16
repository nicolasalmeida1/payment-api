import updatePaymentSchema from '../validators/update-payment.validator.js';
import BaseCommand from './base.command.js';

/**
 * Command for updating an existing payment
 * @class UpdatePaymentCommand
 * @extends BaseCommand
 */
export default class UpdatePaymentCommand extends BaseCommand {
  /**
   * Creates an instance of UpdatePaymentCommand
   * @param {Object} dependencies - Command dependencies
   * @param {*} dependencies.updatePaymentService - Update payment service instance
   */
  constructor({ updatePaymentService }) {
    super();
    this.updatePaymentService = updatePaymentService;
  }

  /**
   * Executes the update payment command
   * @param {string} id - Payment ID to update
   * @param {UpdatePaymentInput} input - Payment update input
   * @returns {Promise<CommandResult>} Command execution result
   */
  async execute(id, input) {
    try {
      const validatedData = this.validate(updatePaymentSchema, input, {
        paymentId: id,
      });

      return await this.updatePaymentService.execute(id, validatedData);
    } catch (error) {
      return this.handleError(error, { paymentId: id });
    }
  }
}
