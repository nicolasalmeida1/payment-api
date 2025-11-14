import { jest } from '@jest/globals';
import ListPaymentsService from '../../src/domain/service/list-payments.service.js';

describe('ListPaymentsService', () => {
  let service;
  let mockPaymentRepository;

  beforeEach(() => {
    mockPaymentRepository = {
      findAll: jest.fn(),
    };

    service = new ListPaymentsService({
      paymentRepository: mockPaymentRepository,
    });
  });

  describe('execute', () => {
    it('should list all payments without filters', async () => {
      const payments = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          cpf: '12345678901',
          description: 'Test payment 1',
          amount: 100.5,
          payment_method: 'PIX',
          status: 'PENDING',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          cpf: '12345678902',
          description: 'Test payment 2',
          amount: 200.5,
          payment_method: 'CREDIT_CARD',
          status: 'PAID',
        },
      ];

      mockPaymentRepository.findAll.mockResolvedValue(payments);

      const result = await service.execute({});

      expect(result).toEqual({
        success: true,
        data: payments,
        count: 2,
      });

      expect(mockPaymentRepository.findAll).toHaveBeenCalledWith({});
    });

    it('should list payments with cpf filter', async () => {
      const filters = { cpf: '12345678901' };
      const payments = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          cpf: '12345678901',
          description: 'Test payment 1',
          amount: 100.5,
          payment_method: 'PIX',
          status: 'PENDING',
        },
      ];

      mockPaymentRepository.findAll.mockResolvedValue(payments);

      const result = await service.execute(filters);

      expect(result).toEqual({
        success: true,
        data: payments,
        count: 1,
      });

      expect(mockPaymentRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should list payments with multiple filters', async () => {
      const filters = {
        cpf: '12345678901',
        paymentMethod: 'PIX',
        status: 'PAID',
      };
      const payments = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          cpf: '12345678901',
          description: 'Test payment 1',
          amount: 100.5,
          payment_method: 'PIX',
          status: 'PAID',
        },
      ];

      mockPaymentRepository.findAll.mockResolvedValue(payments);

      const result = await service.execute(filters);

      expect(result).toEqual({
        success: true,
        data: payments,
        count: 1,
      });

      expect(mockPaymentRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return empty list when no payments found', async () => {
      const filters = { cpf: '99999999999' };

      mockPaymentRepository.findAll.mockResolvedValue([]);

      const result = await service.execute(filters);

      expect(result).toEqual({
        success: true,
        data: [],
        count: 0,
      });
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');

      mockPaymentRepository.findAll.mockRejectedValue(error);

      await expect(service.execute({})).rejects.toThrow('Database error');
    });
  });
});
