import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import ProcessMercadoPagoWebhookCommand from '../../src/domain/command/process-mercado-pago-webhook.command.js';
import { ValidationError } from '../../src/domain/errors/domain.errors.js';

describe('ProcessMercadoPagoWebhookCommand', () => {
  let command;
  let mockService;

  beforeEach(() => {
    mockService = {
      execute: jest.fn(),
    };

    command = new ProcessMercadoPagoWebhookCommand({
      processMercadoPagoWebhookService: mockService,
    });
  });

  describe('execute', () => {
    it('should process webhook successfully', async () => {
      const webhookData = {
        action: 'payment.updated',
        data: {
          id: '12345678',
        },
        type: 'payment',
      };

      const expectedResult = {
        success: true,
        paymentId: 'payment-123',
        status: 'PAID',
      };

      mockService.execute.mockResolvedValue(expectedResult);

      const result = await command.execute(webhookData);

      expect(mockService.execute).toHaveBeenCalledWith(webhookData);
      expect(result).toEqual(expectedResult);
    });

    it('should handle validation error for missing action', async () => {
      const invalidData = {
        data: {
          id: '12345678',
        },
        type: 'payment',
      };

      await expect(command.execute(invalidData)).rejects.toThrow(ValidationError);
    });

    it('should handle validation error for missing data', async () => {
      const invalidData = {
        action: 'payment.updated',
        type: 'payment',
      };

      await expect(command.execute(invalidData)).rejects.toThrow(ValidationError);
    });

    it('should handle validation error for missing type', async () => {
      const invalidData = {
        action: 'payment.updated',
        data: {
          id: '12345678',
        },
      };

      await expect(command.execute(invalidData)).rejects.toThrow(ValidationError);
    });

    it('should handle invalid action value', async () => {
      const invalidData = {
        action: 123,
        data: {
          id: '12345678',
        },
        type: 'payment',
      };

      await expect(command.execute(invalidData)).rejects.toThrow(ValidationError);
    });

    it('should handle invalid data.id', async () => {
      const invalidData = {
        action: 'payment.updated',
        data: {
          id: 123,
        },
        type: 'payment',
      };

      await expect(command.execute(invalidData)).rejects.toThrow(ValidationError);
    });

    it('should process merchant_order webhook', async () => {
      const webhookData = {
        action: 'merchant_order.updated',
        data: {
          id: 'order-123',
        },
        type: 'merchant_order',
      };

      const expectedResult = {
        success: true,
        message: 'Merchant order processed',
      };

      mockService.execute.mockResolvedValue(expectedResult);

      const result = await command.execute(webhookData);

      expect(mockService.execute).toHaveBeenCalledWith(webhookData);
      expect(result).toEqual(expectedResult);
    });

    it('should handle empty data object', async () => {
      const invalidData = {
        action: 'payment.updated',
        data: {},
        type: 'payment',
      };

      await expect(command.execute(invalidData)).rejects.toThrow(ValidationError);
    });

    it('should accept optional fields in webhook data', async () => {
      const webhookData = {
        action: 'payment.updated',
        data: {
          id: '12345678',
        },
        type: 'payment',
        live_mode: true,
        date_created: '2025-11-16T10:00:00Z',
        user_id: 123456,
        api_version: 'v1',
      };

      const expectedResult = {
        success: true,
        paymentId: 'payment-123',
      };

      mockService.execute.mockResolvedValue(expectedResult);

      const result = await command.execute(webhookData);

      expect(mockService.execute).toHaveBeenCalledWith(webhookData);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('constructor', () => {
    it('should initialize with service', () => {
      expect(command.processMercadoPagoWebhookService).toBe(mockService);
    });
  });
});
