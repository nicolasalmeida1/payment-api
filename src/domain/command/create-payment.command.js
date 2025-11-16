import createPaymentSchema from '../validators/create-payment.validator.js';
import Logger from '../../infrastructure/logger/logger.js';

export default class CreatePaymentCommand {
  constructor({ createPaymentService }) {
    this.createPaymentService = createPaymentService;
    this.logger = new Logger(this.constructor.name);
  }

  async execute(input) {
    try {
      this.logger.debug('Validating create payment input', { input });

      const { error, value } = createPaymentSchema.validate(input, {
        abortEarly: false,
      });

      if (error) {
        const errorMessages = error.details.map((detail) => detail.message);
        this.logger.warn('Validation failed', {
          errors: errorMessages,
          input,
        });
        throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
      }

      const result = await this.createPaymentService.execute(value);

      return result;
    } catch (error) {
      this.logger.error('Error in create payment command', {
        error: error.message,
        stack: error.stack,
      });

      throw error;
    }
  }
}
