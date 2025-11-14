import { createPaymentSchema } from '../../src/domain/validators/create-payment.validator.js';

describe('CreatePaymentValidator', () => {
  describe('Valid data', () => {
    it('should validate correct payment data', () => {
      const validData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.5,
        paymentMethod: 'PIX',
      };

      const { error, value } = createPaymentSchema.validate(validData);

      expect(error).toBeUndefined();
      expect(value).toEqual(validData);
    });

    it('should validate with CREDIT_CARD payment method', () => {
      const validData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.5,
        paymentMethod: 'CREDIT_CARD',
      };

      const { error } = createPaymentSchema.validate(validData);

      expect(error).toBeUndefined();
    });
  });

  describe('Invalid id', () => {
    it('should fail when id is missing', () => {
      const invalidData = {
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.5,
        paymentMethod: 'PIX',
      };

      const { error } = createPaymentSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('id is required');
    });

    it('should fail when id is not a valid UUID', () => {
      const invalidData = {
        id: 'invalid-uuid',
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.5,
        paymentMethod: 'PIX',
      };

      const { error } = createPaymentSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('id must be a valid UUID');
    });
  });

  describe('Invalid cpf', () => {
    it('should fail when cpf is missing', () => {
      const invalidData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        description: 'Test payment',
        amount: 100.5,
        paymentMethod: 'PIX',
      };

      const { error } = createPaymentSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('cpf is required');
    });

    it('should fail when cpf does not have 11 digits', () => {
      const invalidData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        cpf: '123456789',
        description: 'Test payment',
        amount: 100.5,
        paymentMethod: 'PIX',
      };

      const { error } = createPaymentSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe(
        'cpf must contain 11 numeric digits',
      );
    });

    it('should fail when cpf contains non-numeric characters', () => {
      const invalidData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        cpf: '123.456.789-01',
        description: 'Test payment',
        amount: 100.5,
        paymentMethod: 'PIX',
      };

      const { error } = createPaymentSchema.validate(invalidData);

      expect(error).toBeDefined();
    });
  });

  describe('Invalid description', () => {
    it('should fail when description is missing', () => {
      const invalidData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        cpf: '12345678901',
        amount: 100.5,
        paymentMethod: 'PIX',
      };

      const { error } = createPaymentSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('description is required');
    });

    it('should fail when description is empty', () => {
      const invalidData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        cpf: '12345678901',
        description: '',
        amount: 100.5,
        paymentMethod: 'PIX',
      };

      const { error } = createPaymentSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('description cannot be empty');
    });
  });

  describe('Invalid amount', () => {
    it('should fail when amount is missing', () => {
      const invalidData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        cpf: '12345678901',
        description: 'Test payment',
        paymentMethod: 'PIX',
      };

      const { error } = createPaymentSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('amount is required');
    });

    it('should fail when amount is negative', () => {
      const invalidData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        cpf: '12345678901',
        description: 'Test payment',
        amount: -10,
        paymentMethod: 'PIX',
      };

      const { error } = createPaymentSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('amount must be a positive number');
    });

    it('should fail when amount is zero', () => {
      const invalidData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        cpf: '12345678901',
        description: 'Test payment',
        amount: 0,
        paymentMethod: 'PIX',
      };

      const { error } = createPaymentSchema.validate(invalidData);

      expect(error).toBeDefined();
    });
  });

  describe('Invalid paymentMethod', () => {
    it('should fail when paymentMethod is missing', () => {
      const invalidData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.5,
      };

      const { error } = createPaymentSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('paymentMethod is required');
    });

    it('should fail when paymentMethod is invalid', () => {
      const invalidData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.5,
        paymentMethod: 'INVALID',
      };

      const { error } = createPaymentSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe(
        'paymentMethod must be PIX or CREDIT_CARD',
      );
    });
  });
});
