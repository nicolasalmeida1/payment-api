import { updatePaymentSchema } from '../../src/domain/validators/update-payment.validator.js';

describe('UpdatePaymentValidator', () => {
  describe('Valid data', () => {
    it('should validate status update', () => {
      const validData = {
        status: 'PAID',
      };

      const { error, value } = updatePaymentSchema.validate(validData);

      expect(error).toBeUndefined();
      expect(value).toEqual(validData);
    });

    it('should validate description update', () => {
      const validData = {
        description: 'Updated description',
      };

      const { error } = updatePaymentSchema.validate(validData);

      expect(error).toBeUndefined();
    });

    it('should validate amount update', () => {
      const validData = {
        amount: 200.5,
      };

      const { error } = updatePaymentSchema.validate(validData);

      expect(error).toBeUndefined();
    });

    it('should validate multiple fields update', () => {
      const validData = {
        status: 'PAID',
        description: 'Updated description',
        amount: 200.5,
      };

      const { error } = updatePaymentSchema.validate(validData);

      expect(error).toBeUndefined();
    });
  });

  describe('Invalid status', () => {
    it('should fail when status is invalid', () => {
      const invalidData = {
        status: 'INVALID_STATUS',
      };

      const { error } = updatePaymentSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe(
        'status must be PENDING, PAID or FAIL',
      );
    });
  });

  describe('Invalid description', () => {
    it('should fail when description is empty', () => {
      const invalidData = {
        description: '',
      };

      const { error } = updatePaymentSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('description cannot be empty');
    });
  });

  describe('Invalid amount', () => {
    it('should fail when amount is negative', () => {
      const invalidData = {
        amount: -10,
      };

      const { error } = updatePaymentSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('amount must be a positive number');
    });

    it('should fail when amount is zero', () => {
      const invalidData = {
        amount: 0,
      };

      const { error } = updatePaymentSchema.validate(invalidData);

      expect(error).toBeDefined();
    });
  });

  describe('Empty update', () => {
    it('should fail when no fields are provided', () => {
      const invalidData = {};

      const { error } = updatePaymentSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe(
        'At least one field must be provided for update',
      );
    });
  });
});
