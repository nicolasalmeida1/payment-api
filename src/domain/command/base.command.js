import Logger from '../../infrastructure/logger/logger.js';
import { ValidationError } from '../errors/domain.errors.js';

export default class BaseCommand {
  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  validate(schema, input, context = {}) {
    this.logger.debug('Validating input', { ...context, input });

    const { error, value } = schema.validate(input, {
      abortEarly: false,
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      this.logger.warn('Validation failed', {
        errors: errorMessages,
        ...context,
        input,
      });
      throw new ValidationError(errorMessages);
    }

    return value;
  }

  async handleError(error, context = {}) {
    this.logger.error(`Error in ${this.constructor.name}`, {
      error: error.message,
      stack: error.stack,
      ...context,
    });
    throw error;
  }
}
