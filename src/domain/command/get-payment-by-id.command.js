import getPaymentByIdSchema from '../validators/get-payment-by-id.validator.js';
import BaseCommand from './base.command.js';

export default class GetPaymentByIdCommand extends BaseCommand {
  constructor({ getPaymentByIdService }) {
    super();
    this.getPaymentByIdService = getPaymentByIdService;
  }

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
