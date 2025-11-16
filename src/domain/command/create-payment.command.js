import createPaymentSchema from '../validators/create-payment.validator.js';
import BaseCommand from './base.command.js';

/**
 * Command for creating a new payment
 * @class CreatePaymentCommand
 * @extends BaseCommand
 */
export default class CreatePaymentCommand extends BaseCommand {
  /**
   * Creates an instance of CreatePaymentCommand
   * @param {Object} dependencies - Command dependencies
   * @param {*} dependencies.createPaymentService - Create payment service instance
   */
  constructor({ createPaymentService }) {
    super();
    this.createPaymentService = createPaymentService;
  }

  /**
   * Executes the create payment command
   * @param {CreatePaymentInput} input - Payment creation input
   * @returns {Promise<CommandResult>} Command execution result
   */
  async execute(input) {
    try {
      const validatedData = this.validate(createPaymentSchema, input);

      return await this.createPaymentService.execute(validatedData);
    } catch (error) {
      return this.handleError(error);
    }
  }
}
