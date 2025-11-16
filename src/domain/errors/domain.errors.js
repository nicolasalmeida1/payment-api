/**
 * Base domain error class
 * @class DomainError
 * @extends Error
 */
export class DomainError extends Error {
  /**
   * Creates a domain error
   * @param {string} message - Error message
   * @param {number} [statusCode=500] - HTTP status code
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when a payment is not found
 * @class PaymentNotFoundError
 * @extends DomainError
 */
export class PaymentNotFoundError extends DomainError {
  /**
   * Creates a payment not found error
   * @param {string} paymentId - Payment identifier
   */
  constructor(paymentId) {
    super(`Payment not found: ${paymentId}`, 404);
    this.paymentId = paymentId;
  }
}

/**
 * Error thrown when validation fails
 * @class ValidationError
 * @extends DomainError
 */
export class ValidationError extends DomainError {
  /**
   * Creates a validation error
   * @param {string[]} errors - Array of validation error messages
   */
  constructor(errors) {
    super(`Validation failed: ${errors.join(', ')}`, 422);
    this.errors = errors;
  }
}

/**
 * Error thrown when attempting to modify a paid payment
 * @class PaymentAlreadyPaidError
 * @extends DomainError
 */
export class PaymentAlreadyPaidError extends DomainError {
  /**
   * Creates a payment already paid error
   * @param {string} paymentId - Payment identifier
   */
  constructor(paymentId) {
    super(`Payment already paid and cannot be modified: ${paymentId}`, 400);
    this.paymentId = paymentId;
  }
}
