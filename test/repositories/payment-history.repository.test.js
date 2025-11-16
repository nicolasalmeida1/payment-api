import { jest } from '@jest/globals';
import PaymentHistoryRepository from '../../src/infrastructure/repositories/payment-history.repository.js';
import PaymentHistory from '../../src/db/models/payment-history.js';

jest.unstable_mockModule('../../src/db/models/payment-history.js', () => ({
  default: {
    query: jest.fn(),
  },
}));

describe('PaymentHistoryRepository', () => {
  let repository;
  let mockDb;
  let mockQuery;
  let mockTrx;

  beforeEach(() => {
    mockQuery = {
      insert: jest.fn(),
      where: jest.fn(),
    };

    mockQuery.where.mockReturnThis();

    mockTrx = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    mockDb = {
      transaction: jest.fn().mockResolvedValue(mockTrx),
    };

    PaymentHistory.query = jest.fn().mockReturnValue(mockQuery);

    repository = new PaymentHistoryRepository(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create payment history entry', async () => {
      const historyData = {
        payment_id: 'payment-123',
        event: 'PAYMENT_CREATED',
        previous_status: null,
        new_status: 'PENDING',
        data: { amount: 100 },
      };

      const mockHistory = { id: 1, ...historyData };
      mockQuery.insert.mockResolvedValue(mockHistory);

      const result = await repository.create(historyData);

      expect(PaymentHistory.query).toHaveBeenCalledWith(null);
      expect(mockQuery.insert).toHaveBeenCalledWith(historyData);
      expect(result).toEqual(mockHistory);
    });

    it('should create history with transaction', async () => {
      const historyData = {
        payment_id: 'payment-123',
        event: 'STATUS_CHANGED',
        previous_status: 'PENDING',
        new_status: 'PAID',
      };

      await repository.startTransaction();
      mockQuery.insert.mockResolvedValue({ id: 2, ...historyData });

      await repository.create(historyData);

      expect(PaymentHistory.query).toHaveBeenCalledWith(mockTrx);
      expect(mockQuery.insert).toHaveBeenCalledWith(historyData);
    });

    it('should log payment history creation', async () => {
      const historyData = {
        payment_id: 'payment-123',
        event: 'PAYMENT_CREATED',
      };

      mockQuery.insert.mockResolvedValue({ id: 1, ...historyData });
      const loggerSpy = jest.spyOn(repository.logger, 'info');

      await repository.create(historyData);

      expect(loggerSpy).toHaveBeenCalledWith('Payment history entry created', {
        historyId: 1,
        paymentId: 'payment-123',
        event: 'PAYMENT_CREATED',
      });
    });
  });

  describe('findByPaymentId', () => {
    it('should find payment history by payment id', async () => {
      const paymentId = 'payment-123';
      const mockHistory = [
        {
          id: 1,
          payment_id: paymentId,
          event: 'PAYMENT_CREATED',
          created_at: new Date(),
        },
        {
          id: 2,
          payment_id: paymentId,
          event: 'STATUS_CHANGED',
          created_at: new Date(),
        },
      ];

      mockQuery.where.mockResolvedValue(mockHistory);

      const result = await repository.findByPaymentId(paymentId);

      expect(PaymentHistory.query).toHaveBeenCalledWith(null);
      expect(mockQuery.where).toHaveBeenCalledWith('payment_id', paymentId);
      expect(result).toEqual(mockHistory);
      expect(result).toHaveLength(2);
    });

    it('should find history with transaction', async () => {
      const paymentId = 'payment-123';
      await repository.startTransaction();

      mockQuery.where.mockResolvedValue([]);

      await repository.findByPaymentId(paymentId);

      expect(PaymentHistory.query).toHaveBeenCalledWith(mockTrx);
    });

    it('should return empty array when no history found', async () => {
      mockQuery.where.mockResolvedValue([]);

      const result = await repository.findByPaymentId('non-existent-id');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should log history retrieval', async () => {
      const paymentId = 'payment-123';
      const mockHistory = [{ id: 1, payment_id: paymentId }];

      mockQuery.where.mockResolvedValue(mockHistory);
      const loggerSpy = jest.spyOn(repository.logger, 'debug');

      await repository.findByPaymentId(paymentId);

      expect(loggerSpy).toHaveBeenCalledWith('Payment history found', {
        paymentId,
        count: 1,
      });
    });
  });
});
