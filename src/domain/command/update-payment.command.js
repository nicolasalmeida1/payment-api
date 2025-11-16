import updatePaymentSchema from '../validators/update-payment.validator.js';
import Logger from '../../infrastructure/logger/logger.js';

export default class UpdatePaymentCommand {
  constructor({ updatePaymentService }) {
    this.updatePaymentService = updatePaymentService;
    this.logger = new Logger(this.constructor.name);
  }

  async execute(id, input) {
    try {
      this.logger.debug('Validating update payment input', {
        paymentId: id,
        input,
      });

      const { error, value } = updatePaymentSchema.validate(input, {
        abortEarly: false,
      });

      if (error) {
        const errorMessages = error.details.map((detail) => detail.message);
        this.logger.warn('Validation failed', {
          errors: errorMessages,
          paymentId: id,
          input,
        });
        throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
      }

      const result = await this.updatePaymentService.execute(id, value);

      return result;
    } catch (error) {
      this.logger.error('Error in update payment command', {
        error: error.message,
        stack: error.stack,
        paymentId: id,
      });

      throw error;
    }
  }
}
