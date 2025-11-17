import Logger from '../../infrastructure/logger/logger.js';
import { ValidationError } from '../errors/domain.errors.js';

/**
 * Base command class providing validation and error handling
 * @class BaseCommand
 */
export default class BaseCommand {
  /**
   * Creates an instance of BaseCommand
   */
  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * Validates input against a Joi schema
   * @param {*} schema - Joi validation schema
   * @param {*} input - Input data to validate
   * @param {Object} [context={}] - Additional context for logging
   * @returns {*} Validated and transformed data
   * @throws {ValidationError} If validation fails
   */
  validate(schema, input, context = {}) {
    const { error, value } = schema.validate(input, {
      abortEarly: false,
      allowUnknown: true,
      convert: true,
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      this.logger.warn('Validation failed', {
        errors: errorMessages,
        name: this.constructor.name,
        ...context,
        input,
      });
      throw new ValidationError(errorMessages);
    }

    return value;
  }

  /**
   * Handles and logs errors before re-throwing
   * @param {Error} error - Error to handle
   * @param {Object} [context={}] - Additional context for logging
   * @returns {Promise<never>}
   * @throws {Error} Re-throws the error after logging
   */
  async handleError(error, context = {}) {
    this.logger.error(`Error in ${this.constructor.name}`, {
      error: error.message,
      stack: error.stack,
      name: this.constructor.name,
      ...context,
    });
    throw error;
  }
}
