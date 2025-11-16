import { jest } from '@jest/globals';
import ProcessMercadoPagoWebhookService from '../../src/domain/service/process-mercado-pago-webhook.service.js';
import { PaymentStatus } from '../../src/domain/enums/payment-status.enum.js';
import { PaymentEvent } from '../../src/domain/enums/payment-event.enum.js';
import { PaymentNotFoundError } from '../../src/domain/errors/domain.errors.js';

describe('ProcessMercadoPagoWebhookService', () => {
  let service;
  let mockPaymentRepository;
  let mockPaymentHistoryRepository;
  let mockMercadoPagoService;
  let mockTransaction;

  beforeEach(() => {
    mockPaymentRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      startTransaction: jest.fn(),
    };

    mockPaymentHistoryRepository = {
      add: jest.fn(),
    };

    mockMercadoPagoService = {
      getPayment: jest.fn(),
    };

    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    mockPaymentRepository.startTransaction.mockResolvedValue(mockTransaction);

    service = new ProcessMercadoPagoWebhookService({
      paymentRepository: mockPaymentRepository,
      paymentHistoryRepository: mockPaymentHistoryRepository,
      mercadoPagoService: mockMercadoPagoService,
    });
  });

  describe('execute', () => {
    it('should process webhook with approved status successfully', async () => {
      const webhookData = {
        action: 'payment.updated',
        type: 'payment',
        data: { id: 'mp-payment-123' },
      };

      const mercadoPagoPayment = {
        id: 'mp-payment-123',
        status: 'approved',
        external_reference: 'payment-456',
        transaction_amount: 100,
      };

      const existingPayment = {
        id: 'payment-456',
        status: PaymentStatus.PENDING,
        amount: 100,
      };

      mockMercadoPagoService.getPayment.mockResolvedValue(mercadoPagoPayment);
      mockPaymentRepository.findById.mockResolvedValue(existingPayment);
      mockPaymentRepository.update.mockResolvedValue({
        ...existingPayment,
        status: PaymentStatus.PAID,
      });

      const result = await service.execute(webhookData);

      expect(result).toEqual({
        success: true,
        message: 'Payment status updated successfully',
        data: {
          paymentId: 'payment-456',
          oldStatus: PaymentStatus.PENDING,
          newStatus: PaymentStatus.PAID,
        },
      });

      expect(mockMercadoPagoService.getPayment).toHaveBeenCalledWith('mp-payment-123');
      expect(mockPaymentRepository.findById).toHaveBeenCalledWith('payment-456', mockTransaction);
      expect(mockPaymentRepository.update).toHaveBeenCalledWith(
        'payment-456',
        { status: PaymentStatus.PAID },
        mockTransaction
      );
      expect(mockPaymentHistoryRepository.add).toHaveBeenCalledWith(
        {
          paymentId: 'payment-456',
          event: PaymentEvent.STATUS_CHANGED,
          oldValue: PaymentStatus.PENDING,
          newValue: PaymentStatus.PAID,
        },
        mockTransaction
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should process webhook with rejected status successfully', async () => {
      const webhookData = {
        action: 'payment.updated',
        type: 'payment',
        data: { id: 'mp-payment-123' },
      };

      const mercadoPagoPayment = {
        id: 'mp-payment-123',
        status: 'rejected',
        external_reference: 'payment-456',
      };

      const existingPayment = {
        id: 'payment-456',
        status: PaymentStatus.PENDING,
      };

      mockMercadoPagoService.getPayment.mockResolvedValue(mercadoPagoPayment);
      mockPaymentRepository.findById.mockResolvedValue(existingPayment);
      mockPaymentRepository.update.mockResolvedValue({
        ...existingPayment,
        status: PaymentStatus.FAIL,
      });

      const result = await service.execute(webhookData);

      expect(result).toEqual({
        success: true,
        message: 'Payment status updated successfully',
        data: {
          paymentId: 'payment-456',
          oldStatus: PaymentStatus.PENDING,
          newStatus: PaymentStatus.FAIL,
        },
      });

      expect(mockPaymentRepository.update).toHaveBeenCalledWith(
        'payment-456',
        { status: PaymentStatus.FAIL },
        mockTransaction
      );
    });

    it('should process webhook with cancelled status successfully', async () => {
      const webhookData = {
        action: 'payment.updated',
        type: 'payment',
        data: { id: 'mp-payment-123' },
      };

      const mercadoPagoPayment = {
        id: 'mp-payment-123',
        status: 'cancelled',
        external_reference: 'payment-456',
      };

      const existingPayment = {
        id: 'payment-456',
        status: PaymentStatus.PENDING,
      };

      mockMercadoPagoService.getPayment.mockResolvedValue(mercadoPagoPayment);
      mockPaymentRepository.findById.mockResolvedValue(existingPayment);
      mockPaymentRepository.update.mockResolvedValue({
        ...existingPayment,
        status: PaymentStatus.FAIL,
      });

      const result = await service.execute(webhookData);

      expect(result.data.newStatus).toBe(PaymentStatus.FAIL);
    });

    it('should process webhook with refunded status successfully', async () => {
      const webhookData = {
        action: 'payment.updated',
        type: 'payment',
        data: { id: 'mp-payment-123' },
      };

      const mercadoPagoPayment = {
        id: 'mp-payment-123',
        status: 'refunded',
        external_reference: 'payment-456',
      };

      const existingPayment = {
        id: 'payment-456',
        status: PaymentStatus.PAID,
      };

      mockMercadoPagoService.getPayment.mockResolvedValue(mercadoPagoPayment);
      mockPaymentRepository.findById.mockResolvedValue(existingPayment);
      mockPaymentRepository.update.mockResolvedValue({
        ...existingPayment,
        status: PaymentStatus.FAIL,
      });

      const result = await service.execute(webhookData);

      expect(result.data.newStatus).toBe(PaymentStatus.FAIL);
    });

    it('should keep PENDING status for pending webhook', async () => {
      const webhookData = {
        action: 'payment.updated',
        type: 'payment',
        data: { id: 'mp-payment-123' },
      };

      const mercadoPagoPayment = {
        id: 'mp-payment-123',
        status: 'pending',
        external_reference: 'payment-456',
      };

      const existingPayment = {
        id: 'payment-456',
        status: PaymentStatus.PENDING,
      };

      mockMercadoPagoService.getPayment.mockResolvedValue(mercadoPagoPayment);
      mockPaymentRepository.findById.mockResolvedValue(existingPayment);
      mockPaymentRepository.update.mockResolvedValue(existingPayment);

      const result = await service.execute(webhookData);

      expect(result.data.status).toBe(PaymentStatus.PENDING);
      expect(result.message).toBe('Payment status unchanged');
    });

    it('should keep PENDING status for in_process webhook', async () => {
      const webhookData = {
        action: 'payment.updated',
        type: 'payment',
        data: { id: 'mp-payment-123' },
      };

      const mercadoPagoPayment = {
        id: 'mp-payment-123',
        status: 'in_process',
        external_reference: 'payment-456',
      };

      const existingPayment = {
        id: 'payment-456',
        status: PaymentStatus.PENDING,
      };

      mockMercadoPagoService.getPayment.mockResolvedValue(mercadoPagoPayment);
      mockPaymentRepository.findById.mockResolvedValue(existingPayment);
      mockPaymentRepository.update.mockResolvedValue(existingPayment);

      const result = await service.execute(webhookData);

      expect(result.data.status).toBe(PaymentStatus.PENDING);
      expect(result.message).toBe('Payment status unchanged');
    });

    it('should skip update when status is unchanged', async () => {
      const webhookData = {
        action: 'payment.updated',
        type: 'payment',
        data: { id: 'mp-payment-123' },
      };

      const mercadoPagoPayment = {
        id: 'mp-payment-123',
        status: 'approved',
        external_reference: 'payment-456',
      };

      const existingPayment = {
        id: 'payment-456',
        status: PaymentStatus.PAID,
      };

      mockMercadoPagoService.getPayment.mockResolvedValue(mercadoPagoPayment);
      mockPaymentRepository.findById.mockResolvedValue(existingPayment);

      const result = await service.execute(webhookData);

      expect(result).toEqual({
        success: true,
        message: 'Payment status unchanged',
        data: {
          paymentId: 'payment-456',
          status: PaymentStatus.PAID,
        },
      });

      expect(mockPaymentRepository.update).not.toHaveBeenCalled();
      expect(mockPaymentHistoryRepository.add).not.toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should ignore non-payment webhooks', async () => {
      const webhookData = {
        action: 'merchant_order.updated',
        type: 'merchant_order',
        data: { id: 'order-123' },
      };

      const result = await service.execute(webhookData);

      expect(result).toEqual({
        success: true,
        message: 'Webhook ignored - not a payment notification',
      });

      expect(mockMercadoPagoService.getPayment).not.toHaveBeenCalled();
      expect(mockPaymentRepository.startTransaction).not.toHaveBeenCalled();
    });

    it('should return error when external_reference is missing', async () => {
      const webhookData = {
        action: 'payment.updated',
        type: 'payment',
        data: { id: 'mp-payment-123' },
      };

      const mercadoPagoPayment = {
        id: 'mp-payment-123',
        status: 'approved',
        external_reference: null,
      };

      mockMercadoPagoService.getPayment.mockResolvedValue(mercadoPagoPayment);

      const result = await service.execute(webhookData);

      expect(result).toEqual({
        success: false,
        message: 'Payment missing external_reference',
      });

      expect(mockPaymentRepository.startTransaction).not.toHaveBeenCalled();
    });

    it('should throw PaymentNotFoundError when payment does not exist', async () => {
      const webhookData = {
        action: 'payment.updated',
        type: 'payment',
        data: { id: 'mp-payment-123' },
      };

      const mercadoPagoPayment = {
        id: 'mp-payment-123',
        status: 'approved',
        external_reference: 'payment-456',
      };

      mockMercadoPagoService.getPayment.mockResolvedValue(mercadoPagoPayment);
      mockPaymentRepository.findById.mockResolvedValue(null);

      await expect(service.execute(webhookData)).rejects.toThrow(PaymentNotFoundError);

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      const webhookData = {
        action: 'payment.updated',
        type: 'payment',
        data: { id: 'mp-payment-123' },
      };

      const mercadoPagoPayment = {
        id: 'mp-payment-123',
        status: 'approved',
        external_reference: 'payment-456',
      };

      const existingPayment = {
        id: 'payment-456',
        status: PaymentStatus.PENDING,
      };

      mockMercadoPagoService.getPayment.mockResolvedValue(mercadoPagoPayment);
      mockPaymentRepository.findById.mockResolvedValue(existingPayment);
      mockPaymentRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(service.execute(webhookData)).rejects.toThrow('Database error');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });
  });

  describe('mapMercadoPagoStatusToPaymentStatus', () => {
    it('should map approved to PAID', () => {
      expect(service.mapMercadoPagoStatusToPaymentStatus('approved')).toBe(PaymentStatus.PAID);
    });

    it('should map rejected to FAIL', () => {
      expect(service.mapMercadoPagoStatusToPaymentStatus('rejected')).toBe(PaymentStatus.FAIL);
    });

    it('should map cancelled to FAIL', () => {
      expect(service.mapMercadoPagoStatusToPaymentStatus('cancelled')).toBe(PaymentStatus.FAIL);
    });

    it('should map refunded to FAIL', () => {
      expect(service.mapMercadoPagoStatusToPaymentStatus('refunded')).toBe(PaymentStatus.FAIL);
    });

    it('should map pending to PENDING', () => {
      expect(service.mapMercadoPagoStatusToPaymentStatus('pending')).toBe(PaymentStatus.PENDING);
    });

    it('should map in_process to PENDING', () => {
      expect(service.mapMercadoPagoStatusToPaymentStatus('in_process')).toBe(PaymentStatus.PENDING);
    });

    it('should map in_mediation to PENDING', () => {
      expect(service.mapMercadoPagoStatusToPaymentStatus('in_mediation')).toBe(PaymentStatus.PENDING);
    });

    it('should map charged_back to FAIL', () => {
      expect(service.mapMercadoPagoStatusToPaymentStatus('charged_back')).toBe(PaymentStatus.FAIL);
    });

    it('should map unknown status to PENDING', () => {
      expect(service.mapMercadoPagoStatusToPaymentStatus('unknown_status')).toBe(PaymentStatus.PENDING);
    });
  });

  describe('getPaymentEventFromStatus', () => {
    it('should return STATUS_CHANGED for PAID', () => {
      expect(service.getPaymentEventFromStatus(PaymentStatus.PAID)).toBe(PaymentEvent.STATUS_CHANGED);
    });

    it('should return STATUS_CHANGED for FAIL', () => {
      expect(service.getPaymentEventFromStatus(PaymentStatus.FAIL)).toBe(PaymentEvent.STATUS_CHANGED);
    });

    it('should return STATUS_CHANGED for PENDING', () => {
      expect(service.getPaymentEventFromStatus(PaymentStatus.PENDING)).toBe(PaymentEvent.STATUS_CHANGED);
    });
  });
});
