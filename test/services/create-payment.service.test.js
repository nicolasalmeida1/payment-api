import { jest } from '@jest/globals';
import CreatePaymentService from '../../src/domain/service/create-payment.service.js';

describe('CreatePaymentService', () => {
  let service;
  let mockPaymentRepository;
  let mockPaymentHistoryRepository;
  let mockMercadoPagoService;

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

    mockMercadoPagoService = {
      buildPreferenceData: jest.fn(),
      createPreference: jest.fn(),
    };

    service = new CreatePaymentService({
      paymentRepository: mockPaymentRepository,
      paymentHistoryRepository: mockPaymentHistoryRepository,
      mercadoPagoService: mockMercadoPagoService,
    });

    service.logger = {
      info: jest.fn(),
      error: jest.fn(),
    };
  });

  describe('execute', () => {
    it('should create PIX payment with PENDING status and generated ID', async () => {
      const validatedData = {
        cpf: '12345678901',
        description: 'PIX payment test',
        amount: 100.5,
        paymentMethod: 'PIX',
      };

      mockPaymentRepository.startTransaction.mockResolvedValue({});
      mockPaymentRepository.create.mockImplementation(data => ({
        ...data,
        id: data.id,
      }));
      mockPaymentHistoryRepository.create.mockResolvedValue({});
      mockPaymentRepository.commitTransaction.mockResolvedValue();

      const result = await service.execute(validatedData);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        cpf: validatedData.cpf,
        description: validatedData.description,
        amount: validatedData.amount,
        payment_method: 'PIX',
        status: 'PENDING',
      });
      expect(result.data.id).toBeDefined();
      expect(typeof result.data.id).toBe('string');

      const createCall = mockPaymentRepository.create.mock.calls[0][0];

      expect(createCall.id).toBeDefined();
      expect(typeof createCall.id).toBe('string');
      expect(createCall.payment_method).toBe('PIX');
      expect(createCall.status).toBe('PENDING');
    });

    it('should create payment successfully with generated ID', async () => {
      const validatedData = {
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.5,
        paymentMethod: 'PIX',
      };

      mockPaymentRepository.startTransaction.mockResolvedValue({});
      mockPaymentRepository.create.mockImplementation(data => ({
        ...data,
        id: data.id,
      }));
      mockPaymentHistoryRepository.create.mockResolvedValue({});
      mockPaymentRepository.commitTransaction.mockResolvedValue();

      const result = await service.execute(validatedData);

      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
      expect(typeof result.data.id).toBe('string');

      expect(mockPaymentRepository.startTransaction).toHaveBeenCalled();
      expect(mockPaymentHistoryRepository.setTransaction).toHaveBeenCalledWith(mockPaymentRepository.trx);

      const createPaymentCall = mockPaymentRepository.create.mock.calls[0][0];

      expect(createPaymentCall).toMatchObject({
        cpf: validatedData.cpf,
        description: validatedData.description,
        amount: validatedData.amount,
        payment_method: 'PIX',
        status: 'PENDING',
      });
      expect(createPaymentCall.id).toBeDefined();

      const createHistoryCall = mockPaymentHistoryRepository.create.mock.calls[0][0];

      expect(createHistoryCall.payment_id).toBe(createPaymentCall.id);
      expect(createHistoryCall.event).toBe('PAYMENT_CREATED');

      expect(mockPaymentRepository.commitTransaction).toHaveBeenCalled();
    });

    it('should create CREDIT_CARD payment and integrate with Mercado Pago', async () => {
      const validatedData = {
        cpf: '12345678901',
        description: 'Credit card payment test',
        amount: 200.0,
        paymentMethod: 'CREDIT_CARD',
      };

      const mockMercadoPagoResponse = {
        id: 'preference-123',
        init_point: 'https://mercadopago.com/checkout/preference-123',
        sandbox_init_point: 'https://sandbox.mercadopago.com/checkout/preference-123',
      };

      mockPaymentRepository.startTransaction.mockResolvedValue({});
      mockPaymentRepository.create.mockImplementation(data => ({
        ...data,
        id: data.id,
      }));
      mockPaymentHistoryRepository.create.mockResolvedValue({});
      mockPaymentRepository.commitTransaction.mockResolvedValue();
      mockMercadoPagoService.createPreference.mockResolvedValue(mockMercadoPagoResponse);

      const result = await service.execute(validatedData);

      expect(result.success).toBe(true);
      expect(result.data.payment_method).toBe('CREDIT_CARD');
      expect(result.data.status).toBe('PENDING');
      expect(result.mercadoPago).toBeDefined();
      expect(result.mercadoPago.preference_id).toBe('preference-123');
      expect(result.mercadoPago.init_point).toBe('https://mercadopago.com/checkout/preference-123');

      // Verifica se createPreference foi chamado com o payment object
      expect(mockMercadoPagoService.createPreference).toHaveBeenCalledWith(
        expect.objectContaining({
          cpf: validatedData.cpf,
          description: validatedData.description,
          amount: validatedData.amount,
          payment_method: 'CREDIT_CARD',
        })
      );
    });

    it('should not call Mercado Pago for PIX payments', async () => {
      const validatedData = {
        cpf: '12345678901',
        description: 'PIX payment test',
        amount: 100.5,
        paymentMethod: 'PIX',
      };

      mockPaymentRepository.startTransaction.mockResolvedValue({});
      mockPaymentRepository.create.mockImplementation(data => ({
        ...data,
        id: data.id,
      }));
      mockPaymentHistoryRepository.create.mockResolvedValue({});
      mockPaymentRepository.commitTransaction.mockResolvedValue();

      const result = await service.execute(validatedData);

      expect(result.success).toBe(true);
      expect(result.mercadoPago).toBeNull();
      expect(mockMercadoPagoService.buildPreferenceData).not.toHaveBeenCalled();
      expect(mockMercadoPagoService.createPreference).not.toHaveBeenCalled();
    });

    it('should rollback payment if Mercado Pago integration fails', async () => {
      const validatedData = {
        cpf: '12345678901',
        description: 'Credit card payment test',
        amount: 200.0,
        paymentMethod: 'CREDIT_CARD',
      };

      const mercadoPagoError = new Error('Mercado Pago API error');

      mockPaymentRepository.startTransaction.mockResolvedValue({});
      mockPaymentRepository.create.mockImplementation(data => ({
        ...data,
        id: data.id,
      }));
      mockPaymentHistoryRepository.create.mockResolvedValue({});
      mockPaymentRepository.commitTransaction.mockResolvedValue();
      mockMercadoPagoService.buildPreferenceData.mockReturnValue({});
      mockMercadoPagoService.createPreference.mockRejectedValue(mercadoPagoError);
      mockPaymentRepository.rollbackTransaction.mockResolvedValue();

      await expect(service.execute(validatedData)).rejects.toThrow('Mercado Pago API error');

      expect(mockPaymentRepository.rollbackTransaction).toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      const validatedData = {
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.5,
        paymentMethod: 'PIX',
      };

      const error = new Error('Database error');
      mockPaymentRepository.startTransaction.mockResolvedValue({});
      mockPaymentRepository.create.mockRejectedValue(error);
      mockPaymentRepository.rollbackTransaction.mockResolvedValue();

      await expect(service.execute(validatedData)).rejects.toThrow('Database error');

      expect(mockPaymentRepository.rollbackTransaction).toHaveBeenCalled();

      const errorCall = service.logger.error.mock.calls[0];

      expect(errorCall[0]).toBe('Error creating payment');
      expect(errorCall[1].error).toBe(error.message);
      expect(errorCall[1].paymentId).toBeDefined();
    });
  });
});
