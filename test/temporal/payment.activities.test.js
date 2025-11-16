import { jest } from '@jest/globals';
import {
  createMercadoPagoPreference,
  checkPaymentStatus,
  updatePaymentStatus,
  mapMercadoPagoStatusToPaymentStatus,
} from '../../src/temporal/activities/payment.activities.js';

// Mock dos módulos
jest.mock('../../src/db/connection.js', () => ({}));
jest.mock('../../src/infrastructure/repositories/payment.repository.js');
jest.mock('../../src/infrastructure/repositories/payment-history.repository.js');
jest.mock('../../src/infrastructure/services/mercado-pago.service.js');
jest.mock('../../src/infrastructure/services/mercado-pago-mock.service.js');
jest.mock('../../src/infrastructure/logger/logger.js', () => {
  return jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  }));
});

describe('Payment Activities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.USE_MERCADO_PAGO_MOCK = 'true';
  });

  describe('createMercadoPagoPreference', () => {
    it('should create Mercado Pago preference with mock', async () => {
      const payment = {
        id: 'payment-123',
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.0,
      };

      const result = await createMercadoPagoPreference(payment);

      expect(result).toHaveProperty('preference_id');
      expect(result).toHaveProperty('init_point');
      expect(result).toHaveProperty('sandbox_init_point');
      expect(result.preference_id).toContain('pref-mock-');
    });

    it('should include payment ID in preference', async () => {
      const payment = {
        id: 'payment-456',
        cpf: '98765432100',
        description: 'Another test',
        amount: 250.0,
      };

      const result = await createMercadoPagoPreference(payment);

      expect(result.preference_id).toBeDefined();
      expect(result.init_point).toContain(result.preference_id);
    });
  });

  describe('checkPaymentStatus', () => {
    it('should return pending status on first call', async () => {
      const paymentId = 'test-payment-1';

      const result = await checkPaymentStatus(paymentId);

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('external_reference');
      expect(result).toHaveProperty('transaction_amount');
      expect(result.status).toBe('pending');
    });

    it('should return approved status on second call', async () => {
      const paymentId = 'test-payment-2';

      // Primeira chamada
      await checkPaymentStatus(paymentId);

      // Segunda chamada
      const result = await checkPaymentStatus(paymentId);

      expect(result.status).toBe('approved');
    });

    it('should maintain different counters for different payments', async () => {
      const payment1 = 'test-payment-3';
      const payment2 = 'test-payment-4';

      const result1 = await checkPaymentStatus(payment1);
      const result2 = await checkPaymentStatus(payment2);

      expect(result1.status).toBe('pending');
      expect(result2.status).toBe('pending');
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status successfully', async () => {
      const mockPaymentRepository = (await import('../../src/infrastructure/repositories/payment.repository.js'))
        .default;
      const mockPaymentHistoryRepository = (
        await import('../../src/infrastructure/repositories/payment-history.repository.js')
      ).default;

      mockPaymentRepository.prototype.startTransaction = jest.fn().mockResolvedValue();
      mockPaymentRepository.prototype.commitTransaction = jest.fn().mockResolvedValue();
      mockPaymentRepository.prototype.findById = jest.fn().mockResolvedValue({
        id: 'payment-123',
        status: 'PENDING',
      });
      mockPaymentRepository.prototype.update = jest.fn().mockResolvedValue();

      mockPaymentHistoryRepository.prototype.setTransaction = jest.fn();
      mockPaymentHistoryRepository.prototype.create = jest.fn().mockResolvedValue();

      const result = await updatePaymentStatus('payment-123', 'PAID', {
        status: 'approved',
        id: 'mp-123',
      });

      expect(result).toEqual({
        success: true,
        oldStatus: 'PENDING',
        newStatus: 'PAID',
      });
    });

    it('should throw error if payment not found', async () => {
      const mockPaymentRepository = (await import('../../src/infrastructure/repositories/payment.repository.js'))
        .default;

      mockPaymentRepository.prototype.startTransaction = jest.fn().mockResolvedValue();
      mockPaymentRepository.prototype.rollbackTransaction = jest.fn().mockResolvedValue();
      mockPaymentRepository.prototype.findById = jest.fn().mockResolvedValue(null);

      await expect(updatePaymentStatus('invalid-id', 'PAID', {})).rejects.toThrow('Payment not found: invalid-id');
    });
  });

  describe('mapMercadoPagoStatusToPaymentStatus', () => {
    it('should map approved to PAID', () => {
      const result = mapMercadoPagoStatusToPaymentStatus('approved');
      expect(result).toBe('PAID');
    });

    it('should map rejected to FAIL', () => {
      const result = mapMercadoPagoStatusToPaymentStatus('rejected');
      expect(result).toBe('FAIL');
    });

    it('should map cancelled to FAIL', () => {
      const result = mapMercadoPagoStatusToPaymentStatus('cancelled');
      expect(result).toBe('FAIL');
    });

    it('should map refunded to FAIL', () => {
      const result = mapMercadoPagoStatusToPaymentStatus('refunded');
      expect(result).toBe('FAIL');
    });

    it('should map pending to PENDING', () => {
      const result = mapMercadoPagoStatusToPaymentStatus('pending');
      expect(result).toBe('PENDING');
    });

    it('should map in_process to PENDING', () => {
      const result = mapMercadoPagoStatusToPaymentStatus('in_process');
      expect(result).toBe('PENDING');
    });

    it('should map unknown status to PENDING', () => {
      const result = mapMercadoPagoStatusToPaymentStatus('unknown_status');
      expect(result).toBe('PENDING');
    });
  });
});
