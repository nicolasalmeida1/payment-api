import { jest } from '@jest/globals';
import PaymentRepository from '../../src/infrastructure/repositories/payment.repository.js';
import Payment from '../../src/db/models/payment.js';

jest.unstable_mockModule('../../src/db/models/payment.js', () => ({
  default: {
    query: jest.fn(),
  },
}));

describe('PaymentRepository', () => {
  let repository;
  let mockDb;
  let mockQuery;
  let mockTrx;

  beforeEach(() => {
    mockQuery = {
      insert: jest.fn(),
      findById: jest.fn(),
      patch: jest.fn(),
      where: jest.fn(),
      limit: jest.fn(),
      offset: jest.fn(),
    };

    // Chain methods
    mockQuery.where.mockReturnThis();
    mockQuery.limit.mockReturnThis();
    mockQuery.offset.mockReturnThis();
    mockQuery.findById.mockReturnThis();

    mockTrx = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    mockDb = {
      transaction: jest.fn().mockResolvedValue(mockTrx),
    };

    Payment.query = jest.fn().mockReturnValue(mockQuery);

    repository = new PaymentRepository(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a payment', async () => {
      const paymentData = {
        id: 'payment-123',
        cpf: '12345678901',
        amount: 100,
        status: 'PENDING',
        payment_method: 'PIX',
      };

      const mockCreatedPayment = { ...paymentData };
      mockQuery.insert.mockResolvedValue(mockCreatedPayment);

      const result = await repository.create(paymentData);

      expect(Payment.query).toHaveBeenCalledWith(null);
      expect(mockQuery.insert).toHaveBeenCalledWith(paymentData);
      expect(result).toEqual(mockCreatedPayment);
    });

    it('should create payment with transaction', async () => {
      const paymentData = {
        id: 'payment-123',
        cpf: '12345678901',
        amount: 100,
      };

      await repository.startTransaction();
      mockQuery.insert.mockResolvedValue(paymentData);

      await repository.create(paymentData);

      expect(Payment.query).toHaveBeenCalledWith(mockTrx);
    });
  });

  describe('findById', () => {
    it('should find payment by id', async () => {
      const paymentId = 'payment-123';
      const mockPayment = {
        id: paymentId,
        cpf: '12345678901',
        amount: 100,
      };

      mockQuery.findById.mockResolvedValue(mockPayment);

      const result = await repository.findById(paymentId);

      expect(Payment.query).toHaveBeenCalled();
      expect(mockQuery.findById).toHaveBeenCalledWith(paymentId);
      expect(result).toEqual(mockPayment);
    });

    it('should return null when payment not found', async () => {
      mockQuery.findById.mockResolvedValue(null);

      const result = await repository.findById('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update payment', async () => {
      const paymentId = 'payment-123';
      const updateData = { status: 'PAID' };
      const mockUpdatedPayment = {
        id: paymentId,
        status: 'PAID',
      };

      const mockPatchObj = {
        patch: jest.fn().mockResolvedValue(1),
      };
      mockQuery.findById.mockReturnValueOnce(mockPatchObj);
      mockQuery.findById.mockResolvedValueOnce(mockUpdatedPayment);

      const result = await repository.update(paymentId, updateData);

      expect(mockPatchObj.patch).toHaveBeenCalledWith(updateData);
      expect(result).toEqual(mockUpdatedPayment);
    });

    it('should return null when payment not found', async () => {
      const mockPatchObj = {
        patch: jest.fn().mockResolvedValue(0),
      };
      mockQuery.findById.mockReturnValue(mockPatchObj);

      const result = await repository.update('invalid-id', { status: 'PAID' });

      expect(result).toBeNull();
    });

    it('should use transaction when available', async () => {
      await repository.startTransaction();
      const mockPatchObj = {
        patch: jest.fn().mockResolvedValue(1),
      };
      mockQuery.findById.mockReturnValueOnce(mockPatchObj);
      mockQuery.findById.mockResolvedValueOnce({ id: 'payment-123' });

      await repository.update('payment-123', { status: 'PAID' });

      expect(Payment.query).toHaveBeenCalledWith(mockTrx);
    });
  });

  describe('applyFilters', () => {
    it('should apply cpf filter', () => {
      const filters = { cpf: '12345678901' };

      const result = repository.applyFilters(mockQuery, filters);

      expect(mockQuery.where).toHaveBeenCalledWith('cpf', '12345678901');
      expect(result).toBe(mockQuery);
    });

    it('should apply paymentMethod filter', () => {
      const filters = { paymentMethod: 'PIX' };

      const result = repository.applyFilters(mockQuery, filters);

      expect(mockQuery.where).toHaveBeenCalledWith('payment_method', 'PIX');
      expect(result).toBe(mockQuery);
    });

    it('should apply status filter', () => {
      const filters = { status: 'PAID' };

      const result = repository.applyFilters(mockQuery, filters);

      expect(mockQuery.where).toHaveBeenCalledWith('status', 'PAID');
      expect(result).toBe(mockQuery);
    });

    it('should apply multiple filters', () => {
      const filters = {
        cpf: '12345678901',
        status: 'PAID',
        paymentMethod: 'PIX',
      };

      repository.applyFilters(mockQuery, filters);

      expect(mockQuery.where).toHaveBeenCalledWith('cpf', '12345678901');
      expect(mockQuery.where).toHaveBeenCalledWith('status', 'PAID');
      expect(mockQuery.where).toHaveBeenCalledWith('payment_method', 'PIX');
    });

    it('should not apply filters when not provided', () => {
      repository.applyFilters(mockQuery, {});

      expect(mockQuery.where).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should find all payments with default pagination', async () => {
      const mockPayments = [{ id: 'payment-1' }, { id: 'payment-2' }];

      mockQuery.offset.mockResolvedValue(mockPayments);

      const result = await repository.findAll();

      expect(Payment.query).toHaveBeenCalled();
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.offset).toHaveBeenCalledWith(0);
      expect(result).toEqual(mockPayments);
    });

    it('should find payments with custom pagination', async () => {
      const mockPayments = [{ id: 'payment-1' }];
      const filters = { page: 2, take: 5 };

      mockQuery.offset.mockResolvedValue(mockPayments);

      const result = await repository.findAll(filters);

      expect(mockQuery.limit).toHaveBeenCalledWith(5);
      expect(mockQuery.offset).toHaveBeenCalledWith(5);
      expect(result).toEqual(mockPayments);
    });

    it('should find payments with filters', async () => {
      const mockPayments = [{ id: 'payment-1' }];
      const filters = {
        cpf: '12345678901',
        status: 'PAID',
        page: 1,
        take: 10,
      };

      mockQuery.offset.mockResolvedValue(mockPayments);

      const result = await repository.findAll(filters);

      expect(mockQuery.where).toHaveBeenCalledWith('cpf', '12345678901');
      expect(mockQuery.where).toHaveBeenCalledWith('status', 'PAID');
      expect(result).toEqual(mockPayments);
    });

    it('should handle empty results', async () => {
      mockQuery.offset.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });
});
