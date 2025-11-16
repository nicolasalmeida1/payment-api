import {
  DomainError,
  PaymentNotFoundError,
  ValidationError,
  PaymentAlreadyPaidError,
} from '../../src/domain/errors/domain.errors.js';

describe('Domain Errors', () => {
  describe('DomainError', () => {
    it('should create a domain error with message and status code', () => {
      const error = new DomainError('Test error', 400);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('DomainError');
    });

    it('should default to status code 500', () => {
      const error = new DomainError('Test error');

      expect(error.statusCode).toBe(500);
    });
  });

  describe('PaymentNotFoundError', () => {
    it('should create a payment not found error', () => {
      const paymentId = '123';
      const error = new PaymentNotFoundError(paymentId);

      expect(error).toBeInstanceOf(DomainError);
      expect(error.message).toBe('Payment not found: 123');
      expect(error.statusCode).toBe(404);
      expect(error.paymentId).toBe(paymentId);
      expect(error.name).toBe('PaymentNotFoundError');
    });
  });

  describe('ValidationError', () => {
    it('should create a validation error with errors array', () => {
      const errors = ['Field is required', 'Invalid email'];
      const error = new ValidationError(errors);

      expect(error).toBeInstanceOf(DomainError);
      expect(error.message).toBe('Validation failed: Field is required, Invalid email');
      expect(error.statusCode).toBe(422);
      expect(error.errors).toEqual(errors);
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('PaymentAlreadyPaidError', () => {
    it('should create a payment already paid error', () => {
      const paymentId = '123';
      const error = new PaymentAlreadyPaidError(paymentId);

      expect(error).toBeInstanceOf(DomainError);
      expect(error.message).toBe('Payment already paid and cannot be modified: 123');
      expect(error.statusCode).toBe(400);
      expect(error.paymentId).toBe(paymentId);
      expect(error.name).toBe('PaymentAlreadyPaidError');
    });
  });
});
