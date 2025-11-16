import { listPaymentsSchema } from '../../src/domain/validators/list-payments.validator.js';

describe('ListPaymentsValidator', () => {
  describe('Valid filters', () => {
    it('should validate with cpf filter', () => {
      const validData = {
        cpf: '12345678901',
      };

      const { error, value } = listPaymentsSchema.validate(validData);

      expect(error).toBeUndefined();
      expect(value).toEqual({
        ...validData,
        page: 1,
        take: 10,
      });
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

      const { error, value } = listPaymentsSchema.validate(validData);

      expect(error).toBeUndefined();
      expect(value).toEqual({
        page: 1,
        take: 10,
      });
    });

    it('should validate with custom page and take', () => {
      const validData = {
        page: 2,
        take: 20,
      };

      const { error, value } = listPaymentsSchema.validate(validData);

      expect(error).toBeUndefined();
      expect(value).toEqual(validData);
    });

    it('should fail when page is less than 1', () => {
      const invalidData = {
        page: 0,
      };

      const { error } = listPaymentsSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('page must be at least 1');
    });

    it('should fail when take exceeds 100', () => {
      const invalidData = {
        take: 101,
      };

      const { error } = listPaymentsSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('take must not exceed 100');
    });
  });

  describe('Invalid cpf', () => {
    it('should fail when cpf does not have 11 digits', () => {
      const invalidData = {
        cpf: '123456789',
      };

      const { error } = listPaymentsSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('cpf must contain 11 numeric digits');
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
      expect(error.details[0].message).toBe('paymentMethod must be PIX or CREDIT_CARD');
    });
  });

  describe('Invalid status', () => {
    it('should fail when status is invalid', () => {
      const invalidData = {
        status: 'INVALID_STATUS',
      };

      const { error } = listPaymentsSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('status must be PENDING, PAID or FAIL');
    });
  });
});
