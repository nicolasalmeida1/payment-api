import getPaymentByIdSchema from '../../src/domain/validators/get-payment-by-id.validator.js';

describe('GetPaymentByIdValidator', () => {
  describe('when id is valid', () => {
    it('should validate a valid UUID', () => {
      const validData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const { error, value } = getPaymentByIdSchema.validate(validData);

      expect(error).toBeUndefined();
      expect(value).toEqual(validData);
    });
  });

  describe('when id is invalid', () => {
    it('should fail when id is missing', () => {
      const invalidData = {};

      const { error } = getPaymentByIdSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('id is required');
    });

    it('should fail when id is empty string', () => {
      const invalidData = {
        id: '',
      };

      const { error } = getPaymentByIdSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('id cannot be empty');
    });

    it('should fail when id is not a valid UUID', () => {
      const invalidData = {
        id: 'invalid-uuid',
      };

      const { error } = getPaymentByIdSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('id must be a valid UUID');
    });

    it('should fail when id is a number', () => {
      const invalidData = {
        id: 123,
      };

      const { error } = getPaymentByIdSchema.validate(invalidData);

      expect(error).toBeDefined();
    });

    it('should fail when id is null', () => {
      const invalidData = {
        id: null,
      };

      const { error } = getPaymentByIdSchema.validate(invalidData);

      expect(error).toBeDefined();
    });
  });
});
