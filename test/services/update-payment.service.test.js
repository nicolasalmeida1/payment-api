import { jest } from '@jest/globals';
import UpdatePaymentService from '../../src/domain/service/update-payment.service.js';

describe('UpdatePaymentService', () => {
  let service;
  let mockPaymentRepository;
  let mockPaymentHistoryRepository;

  beforeEach(() => {
    mockPaymentRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      trx: {},
    };

    mockPaymentHistoryRepository = {
      create: jest.fn(),
      setTransaction: jest.fn(),
    };

    service = new UpdatePaymentService({
      paymentRepository: mockPaymentRepository,
      paymentHistoryRepository: mockPaymentHistoryRepository,
    });

    service.logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };
  });

  describe('execute', () => {
    it('should update payment status successfully', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const validatedData = {
        status: 'PAID',
      };

      const existingPayment = {
        id,
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.5,
        payment_method: 'PIX',
        status: 'PENDING',
      };

      const updatedPayment = {
        ...existingPayment,
        status: 'PAID',
      };

      mockPaymentRepository.findById.mockResolvedValue(existingPayment);
      mockPaymentRepository.startTransaction.mockResolvedValue({});
      mockPaymentRepository.update.mockResolvedValue(updatedPayment);
      mockPaymentHistoryRepository.create.mockResolvedValue({});
      mockPaymentRepository.commitTransaction.mockResolvedValue();

      const result = await service.execute(id, validatedData);

      expect(result).toEqual({
        success: true,
        data: updatedPayment,
      });

      expect(mockPaymentRepository.startTransaction).toHaveBeenCalled();
      expect(mockPaymentHistoryRepository.setTransaction).toHaveBeenCalledWith(
        mockPaymentRepository.trx,
      );

      expect(mockPaymentRepository.update).toHaveBeenCalledWith(id, {
        status: 'PAID',
      });

      expect(mockPaymentHistoryRepository.create).toHaveBeenCalledWith({
        payment_id: id,
        event: 'PAYMENT_STATUS_CHANGED',
        event_data: {
          old_status: 'PENDING',
          new_status: 'PAID',
        },
      });

      expect(mockPaymentRepository.commitTransaction).toHaveBeenCalled();
    });

    it('should update description without creating history', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const validatedData = {
        description: 'Updated description',
      };

      const existingPayment = {
        id,
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.5,
        payment_method: 'PIX',
        status: 'PENDING',
      };

      const updatedPayment = {
        ...existingPayment,
        description: 'Updated description',
      };

      mockPaymentRepository.findById.mockResolvedValue(existingPayment);
      mockPaymentRepository.startTransaction.mockResolvedValue({});
      mockPaymentRepository.update.mockResolvedValue(updatedPayment);
      mockPaymentRepository.commitTransaction.mockResolvedValue();

      const result = await service.execute(id, validatedData);

      expect(result).toEqual({
        success: true,
        data: updatedPayment,
      });

      expect(mockPaymentHistoryRepository.create).not.toHaveBeenCalled();
      expect(mockPaymentRepository.commitTransaction).toHaveBeenCalled();
    });

    it('should throw error when payment not found', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const validatedData = {
        status: 'PAID',
      };

      mockPaymentRepository.findById.mockResolvedValue(null);

      await expect(service.execute(id, validatedData)).rejects.toThrow(
        'Payment not found',
      );

      expect(mockPaymentRepository.update).not.toHaveBeenCalled();
    });

    it('should not create history when status does not change', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const validatedData = {
        status: 'PENDING',
      };

      const existingPayment = {
        id,
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.5,
        payment_method: 'PIX',
        status: 'PENDING',
      };

      mockPaymentRepository.findById.mockResolvedValue(existingPayment);
      mockPaymentRepository.startTransaction.mockResolvedValue({});
      mockPaymentRepository.update.mockResolvedValue(existingPayment);
      mockPaymentRepository.commitTransaction.mockResolvedValue();

      await service.execute(id, validatedData);

      expect(mockPaymentHistoryRepository.create).not.toHaveBeenCalled();
      expect(mockPaymentRepository.commitTransaction).toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const validatedData = {
        status: 'PAID',
      };

      const error = new Error('Database error');
      mockPaymentRepository.findById.mockRejectedValue(error);
      mockPaymentRepository.rollbackTransaction.mockResolvedValue();

      await expect(service.execute(id, validatedData)).rejects.toThrow(
        'Database error',
      );

      expect(mockPaymentRepository.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
