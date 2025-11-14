import { jest } from '@jest/globals';
import GetPaymentByIdService from '../../src/domain/service/get-payment-by-id.service.js';

describe('GetPaymentByIdService', () => {
  let service;
  let mockPaymentRepository;

  beforeEach(() => {
    mockPaymentRepository = {
      findById: jest.fn(),
    };

    service = new GetPaymentByIdService({
      paymentRepository: mockPaymentRepository,
    });
  });

  describe('execute', () => {
    it('should get payment by id successfully', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const payment = {
        id,
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.5,
        payment_method: 'PIX',
        status: 'PENDING',
      };

      mockPaymentRepository.findById.mockResolvedValue(payment);

      const result = await service.execute(id);

      expect(result).toEqual({
        success: true,
        data: payment,
      });

      expect(mockPaymentRepository.findById).toHaveBeenCalledWith(id);
    });

    it('should throw error when payment not found', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';

      mockPaymentRepository.findById.mockResolvedValue(null);

      await expect(service.execute(id)).rejects.toThrow('Payment not found');
    });

    it('should handle repository errors', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const error = new Error('Database error');

      mockPaymentRepository.findById.mockRejectedValue(error);

      await expect(service.execute(id)).rejects.toThrow('Database error');
    });
  });
});
