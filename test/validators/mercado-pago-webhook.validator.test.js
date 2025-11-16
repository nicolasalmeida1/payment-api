import { mercadoPagoWebhookSchema } from '../../src/domain/validators/mercado-pago-webhook.validator.js';

describe('MercadoPagoWebhookValidator', () => {
  describe('when webhook data is valid', () => {
    it('should validate correct payment webhook', () => {
      const validData = {
        action: 'payment.updated',
        data: {
          id: '12345678',
        },
        type: 'payment',
      };

      const { error, value } = mercadoPagoWebhookSchema.validate(validData);

      expect(error).toBeUndefined();
      expect(value).toEqual(validData);
    });

    it('should validate merchant_order webhook', () => {
      const validData = {
        action: 'merchant_order.updated',
        data: {
          id: '12345678',
        },
        type: 'merchant_order',
      };

      const { error, value } = mercadoPagoWebhookSchema.validate(validData);

      expect(error).toBeUndefined();
      expect(value).toEqual(validData);
    });
  });

  describe('when webhook data is invalid', () => {
    it('should fail when action is missing', () => {
      const invalidData = {
        data: {
          id: '12345678',
        },
        type: 'payment',
      };

      const { error } = mercadoPagoWebhookSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('action is required');
    });

    it('should fail when action is empty', () => {
      const invalidData = {
        action: '',
        data: {
          id: '123',
        },
        type: 'payment',
      };

      const { error } = mercadoPagoWebhookSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('empty');
    });

    it('should fail when data is missing', () => {
      const invalidData = {
        action: 'payment.updated',
        type: 'payment',
      };

      const { error } = mercadoPagoWebhookSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('data is required');
    });

    it('should fail when data.id is missing', () => {
      const invalidData = {
        action: 'payment.updated',
        data: {},
        type: 'payment',
      };

      const { error } = mercadoPagoWebhookSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('data.id is required');
    });

    it('should fail when data.id is not a string', () => {
      const invalidData = {
        action: 'payment.updated',
        data: {
          id: 123,
        },
        type: 'payment',
      };

      const { error } = mercadoPagoWebhookSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('data.id must be a string');
    });

    it('should fail when type is missing', () => {
      const invalidData = {
        action: 'payment.updated',
        data: {
          id: '12345678',
        },
      };

      const { error } = mercadoPagoWebhookSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('type is required');
    });

    it('should fail when type is empty', () => {
      const invalidData = {
        action: 'payment.updated',
        data: {
          id: '123',
        },
        type: '',
      };

      const { error } = mercadoPagoWebhookSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('empty');
    });

    it('should fail when action is not a string', () => {
      const invalidData = {
        action: 123,
        data: {
          id: '12345678',
        },
        type: 'payment',
      };

      const { error } = mercadoPagoWebhookSchema.validate(invalidData);

      expect(error).toBeDefined();
    });

    it('should fail when type is not a string', () => {
      const invalidData = {
        action: 'payment.updated',
        data: {
          id: '12345678',
        },
        type: 123,
      };

      const { error } = mercadoPagoWebhookSchema.validate(invalidData);

      expect(error).toBeDefined();
    });
  });
});
