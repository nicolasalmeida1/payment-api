export class DomainError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class PaymentNotFoundError extends DomainError {
  constructor(paymentId) {
    super(`Payment not found: ${paymentId}`, 404);
    this.paymentId = paymentId;
  }
}

export class ValidationError extends DomainError {
  constructor(errors) {
    super(`Validation failed: ${errors.join(', ')}`, 422);
    this.errors = errors;
  }
}
