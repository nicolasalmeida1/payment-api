import createPaymentSchema from '../validators/create-payment.validator.js';
import BaseCommand from './base.command.js';

export default class CreatePaymentCommand extends BaseCommand {
  constructor({ createPaymentService }) {
    super();
    this.createPaymentService = createPaymentService;
  }

  async execute(input) {
    try {
      const validatedData = this.validate(createPaymentSchema, input);

      return await this.createPaymentService.execute(validatedData);
    } catch (error) {
      return this.handleError(error);
    }
  }
}
