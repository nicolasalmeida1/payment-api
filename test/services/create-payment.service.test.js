import { jest } from '@jest/globals';
import CreatePaymentService from '../../src/domain/service/create-payment.service.js';

describe('CreatePaymentService', () => {
  let service;
  let mockPaymentRepository;
  let mockPaymentHistoryRepository;

  beforeEach(() => {
    mockPaymentRepository = {
      create: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      trx: {},
    };

    mockPaymentHistoryRepository = {
      create: jest.fn(),
      setTransaction: jest.fn(),
    };

    service = new CreatePaymentService({
      paymentRepository: mockPaymentRepository,
      paymentHistoryRepository: mockPaymentHistoryRepository,
    });

    service.logger = {
      info: jest.fn(),
      error: jest.fn(),
    };
  });

  describe('execute', () => {
    it('should create PIX payment with PENDING status', async () => {
      const validatedData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        cpf: '12345678901',
        description: 'PIX payment test',
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

      mockPaymentRepository.startTransaction.mockResolvedValue({});
      mockPaymentRepository.create.mockResolvedValue(expectedPayment);
      mockPaymentHistoryRepository.create.mockResolvedValue({});
      mockPaymentRepository.commitTransaction.mockResolvedValue();

      const result = await service.execute(validatedData);

      expect(result).toEqual({
        success: true,
        data: expectedPayment,
      });

      expect(expectedPayment.payment_method).toBe('PIX');
      expect(expectedPayment.status).toBe('PENDING');

      expect(mockPaymentRepository.create).toHaveBeenCalledWith({
        id: validatedData.id,
        cpf: validatedData.cpf,
        description: validatedData.description,
        amount: validatedData.amount,
        payment_method: 'PIX',
        status: 'PENDING',
      });

      expect(service.logger.info).toHaveBeenCalledWith('Creating payment', {
        paymentId: validatedData.id,
        cpf: validatedData.cpf,
        amount: validatedData.amount,
        paymentMethod: 'PIX',
      });
    });

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

      mockPaymentRepository.startTransaction.mockResolvedValue({});
      mockPaymentRepository.create.mockResolvedValue(expectedPayment);
      mockPaymentHistoryRepository.create.mockResolvedValue({});
      mockPaymentRepository.commitTransaction.mockResolvedValue();

      const result = await service.execute(validatedData);

      expect(result).toEqual({
        success: true,
        data: expectedPayment,
      });

      expect(mockPaymentRepository.startTransaction).toHaveBeenCalled();
      expect(mockPaymentHistoryRepository.setTransaction).toHaveBeenCalledWith(
        mockPaymentRepository.trx,
      );

      expect(mockPaymentRepository.create).toHaveBeenCalledWith({
        id: validatedData.id,
        cpf: validatedData.cpf,
        description: validatedData.description,
        amount: validatedData.amount,
        payment_method: 'PIX',
        status: 'PENDING',
      });

      expect(mockPaymentHistoryRepository.create).toHaveBeenCalledWith({
        payment_id: validatedData.id,
        event: 'PAYMENT_CREATED',
        event_data: {
          cpf: validatedData.cpf,
          description: validatedData.description,
          amount: validatedData.amount,
          payment_method: 'PIX',
          status: 'PENDING',
        },
      });

      expect(mockPaymentRepository.commitTransaction).toHaveBeenCalled();

      expect(service.logger.info).toHaveBeenCalledWith('Creating payment', {
        paymentId: validatedData.id,
        cpf: validatedData.cpf,
        amount: validatedData.amount,
        paymentMethod: 'PIX',
      });

      expect(service.logger.info).toHaveBeenCalledWith(
        'Payment created successfully',
        {
          paymentId: expectedPayment.id,
          paymentMethod: 'PIX',
          status: 'PENDING',
        },
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
      mockPaymentRepository.startTransaction.mockResolvedValue({});
      mockPaymentRepository.create.mockRejectedValue(error);
      mockPaymentRepository.rollbackTransaction.mockResolvedValue();

      await expect(service.execute(validatedData)).rejects.toThrow(
        'Database error',
      );

      expect(mockPaymentRepository.rollbackTransaction).toHaveBeenCalled();
      expect(service.logger.error).toHaveBeenCalledWith(
        'Error creating payment',
        {
          error: error.message,
          stack: error.stack,
          paymentId: validatedData.id,
        },
      );
    });
  });
});
