import { jest } from '@jest/globals';
import CreatePaymentService from '../../src/domain/service/create-payment.service.js';

describe('CreatePaymentService', () => {
  let service;
  let mockPaymentRepository;
  let mockPaymentHistoryRepository;

  beforeEach(() => {
    mockPaymentRepository = {
      createWithHistory: jest.fn(),
    };

    mockPaymentHistoryRepository = {
      create: jest.fn(),
    };

    service = new CreatePaymentService({
      paymentRepository: mockPaymentRepository,
      paymentHistoryRepository: mockPaymentHistoryRepository,
    });
  });

  describe('execute', () => {
    it('should create payment successfully', async () => {
      const validatedData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.5,
        paymentMethod: 'PIX',
      };

      const expectedPayment = {
        id: validatedData.id,
        cpf: validatedData.cpf,
        description: validatedData.description,
        amount: validatedData.amount,
        payment_method: 'PIX',
        status: 'PENDING',
      };

      mockPaymentRepository.createWithHistory.mockResolvedValue(
        expectedPayment,
      );

      const result = await service.execute(validatedData);

      expect(result).toEqual({
        success: true,
        data: expectedPayment,
      });

      expect(mockPaymentRepository.createWithHistory).toHaveBeenCalledWith(
        {
          id: validatedData.id,
          cpf: validatedData.cpf,
          description: validatedData.description,
          amount: validatedData.amount,
          payment_method: 'PIX',
          status: 'PENDING',
        },
        {
          payment_id: validatedData.id,
          event: 'PAYMENT_CREATED',
          event_data: {
            cpf: validatedData.cpf,
            description: validatedData.description,
            amount: validatedData.amount,
            payment_method: 'PIX',
            status: 'PENDING',
          },
        },
        mockPaymentHistoryRepository,
      );
    });

    it('should handle repository errors', async () => {
      const validatedData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.5,
        paymentMethod: 'PIX',
      };

      const error = new Error('Database error');
      mockPaymentRepository.createWithHistory.mockRejectedValue(error);

      await expect(service.execute(validatedData)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
