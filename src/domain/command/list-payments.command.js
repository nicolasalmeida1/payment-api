import listPaymentsSchema from '../validators/list-payments.validator.js';
import Logger from '../../infrastructure/logger/logger.js';

export default class ListPaymentsCommand {
  constructor({ listPaymentsService }) {
    this.listPaymentsService = listPaymentsService;
    this.logger = new Logger('ListPaymentsCommand');
  }

  async execute(filters) {
    try {
      this.logger.debug('Validating list payments filters', { filters });

      const { error, value } = listPaymentsSchema.validate(filters, {
        abortEarly: false,
      });

      if (error) {
        const errorMessages = error.details.map((detail) => detail.message);
        this.logger.warn('Validation failed', {
          errors: errorMessages,
          filters,
        });
        throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
      }

      const result = await this.listPaymentsService.execute(value);

      return result;
    } catch (error) {
      this.logger.error('Error in list payments command', {
        error: error.message,
        stack: error.stack,
      });

      throw error;
    }
  }
}
