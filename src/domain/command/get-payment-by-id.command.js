import getPaymentByIdSchema from '../validators/get-payment-by-id.validator.js';
import BaseCommand from './base.command.js';

/**
 * Command for retrieving a payment by its ID
 * @class GetPaymentByIdCommand
 * @extends BaseCommand
 */
export default class GetPaymentByIdCommand extends BaseCommand {
  /**
   * Creates an instance of GetPaymentByIdCommand
   * @param {Object} dependencies - Command dependencies
   * @param {*} dependencies.getPaymentByIdService - Get payment by ID service instance
   */
  constructor({ getPaymentByIdService }) {
    super();
    this.getPaymentByIdService = getPaymentByIdService;
  }

  /**
   * Executes the get payment by ID command
   * @param {string} id - Payment identifier
   * @returns {Promise<CommandResult>} Command execution result
   */
  async execute(id) {
    try {
      const validatedData = this.validate(getPaymentByIdSchema, { id });

      this.logger.debug('Executing command', { paymentId: validatedData.id });

      return await this.getPaymentByIdService.execute(validatedData.id);
    } catch (error) {
      return this.handleError(error, { paymentId: id });
    }
  }
}
