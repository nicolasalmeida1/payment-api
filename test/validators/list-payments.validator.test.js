import { listPaymentsSchema } from '../../src/domain/validators/list-payments.validator.js';

describe('ListPaymentsValidator', () => {
  describe('Valid filters', () => {
    it('should validate with cpf filter', () => {
      const validData = {
        cpf: '12345678901',
      };

      const { error, value } = listPaymentsSchema.validate(validData);

      expect(error).toBeUndefined();
      expect(value).toEqual(validData);
    });

    it('should validate with paymentMethod filter', () => {
      const validData = {
        paymentMethod: 'PIX',
      };

      const { error } = listPaymentsSchema.validate(validData);

      expect(error).toBeUndefined();
    });

    it('should validate with status filter', () => {
      const validData = {
        status: 'PAID',
      };

      const { error } = listPaymentsSchema.validate(validData);

      expect(error).toBeUndefined();
    });

    it('should validate with multiple filters', () => {
      const validData = {
        cpf: '12345678901',
        paymentMethod: 'CREDIT_CARD',
        status: 'PENDING',
      };

      const { error } = listPaymentsSchema.validate(validData);

      expect(error).toBeUndefined();
    });

    it('should validate with no filters', () => {
      const validData = {};

      const { error } = listPaymentsSchema.validate(validData);

      expect(error).toBeUndefined();
    });
  });

  describe('Invalid cpf', () => {
    it('should fail when cpf does not have 11 digits', () => {
      const invalidData = {
        cpf: '123456789',
      };

      const { error } = listPaymentsSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe(
        'cpf must contain 11 numeric digits',
      );
    });

    it('should fail when cpf contains non-numeric characters', () => {
      const invalidData = {
        cpf: '123.456.789-01',
      };

      const { error } = listPaymentsSchema.validate(invalidData);

      expect(error).toBeDefined();
    });
  });

  describe('Invalid paymentMethod', () => {
    it('should fail when paymentMethod is invalid', () => {
      const invalidData = {
        paymentMethod: 'INVALID',
      };

      const { error } = listPaymentsSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe(
        'paymentMethod must be PIX or CREDIT_CARD',
      );
    });
  });

  describe('Invalid status', () => {
    it('should fail when status is invalid', () => {
      const invalidData = {
        status: 'INVALID_STATUS',
      };

      const { error } = listPaymentsSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe(
        'status must be PENDING, PAID or FAIL',
      );
    });
  });
});
