import updatePaymentSchema from '../validators/update-payment.validator.js';
import BaseCommand from './base.command.js';

export default class UpdatePaymentCommand extends BaseCommand {
  constructor({ updatePaymentService }) {
    super();
    this.updatePaymentService = updatePaymentService;
  }

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
