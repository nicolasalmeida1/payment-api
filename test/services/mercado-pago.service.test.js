import { jest } from '@jest/globals';
import MercadoPagoService from '../../src/infrastructure/services/mercado-pago.service.js';

global.fetch = jest.fn();

describe('MercadoPagoService', () => {
  let service;
  const mockAccessToken = 'TEST-ACCESS-TOKEN-123';

  beforeEach(() => {
    process.env.MERCADO_PAGO_ACCESS_TOKEN = mockAccessToken;
    process.env.MERCADO_PAGO_BASE_URL = 'https://api.mercadopago.com';
    service = new MercadoPagoService();

    jest.clearAllMocks();
  });

  describe('createPreference', () => {
    it('should create preference successfully', async () => {
      const preferenceData = {
        items: [
          {
            id: 'test-id',
            title: 'Test Payment',
            quantity: 1,
            currency_id: 'BRL',
            unit_price: 100,
          },
        ],
      };

      const mockResponse = {
        id: 'preference-id-123',
        init_point: 'https://mercadopago.com/checkout/preference-id-123',
        items: preferenceData.items,
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await service.createPreference(preferenceData);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.mercadopago.com/checkout/preferences',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockAccessToken}`,
          },
          body: JSON.stringify(preferenceData),
        },
      );
    });

    it('should throw error when API returns error', async () => {
      const preferenceData = {
        items: [],
      };

      const mockError = {
        message: 'Invalid items',
        error: 'invalid_items',
        status: 400,
      };

      global.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue(mockError),
      });

      await expect(service.createPreference(preferenceData)).rejects.toThrow(
        'Mercado Pago API error',
      );
    });

    it('should handle network errors', async () => {
      const preferenceData = {
        items: [],
      };

      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(service.createPreference(preferenceData)).rejects.toThrow(
        'Network error',
      );
    });
  });

  describe('buildPreferenceData', () => {
    it('should build preference data correctly', () => {
      process.env.APP_URL = 'https://my-app.com';

      const payment = {
        id: 'payment-123',
        cpf: '12345678901',
        description: 'Test Payment Description',
        amount: 150.5,
      };

      const result = service.buildPreferenceData(payment);

      expect(result).toEqual({
        items: [
          {
            id: 'payment-123',
            title: 'Test Payment Description',
            description: 'Test Payment Description',
            quantity: 1,
            currency_id: 'BRL',
            unit_price: 150.5,
          },
        ],
        payer: {
          email: '12345678901@payment-api.com',
          identification: {
            type: 'CPF',
            number: '12345678901',
          },
        },
        back_urls: {
          success: 'https://my-app.com/api/payment/payment-123/success',
          pending: 'https://my-app.com/api/payment/payment-123/pending',
          failure: 'https://my-app.com/api/payment/payment-123/failure',
        },
        notification_url: 'https://my-app.com/api/webhooks/mercado-pago',
        auto_return: 'approved',
        external_reference: 'payment-123',
        statement_descriptor: 'PAYMENT API',
        metadata: {
          payment_id: 'payment-123',
          cpf: '12345678901',
        },
      });
    });
  });

  describe('getPreference', () => {
    it('should get preference successfully', async () => {
      const preferenceId = 'preference-123';
      const mockResponse = {
        id: preferenceId,
        items: [],
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await service.getPreference(preferenceId);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.mercadopago.com/checkout/preferences/${preferenceId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockAccessToken}`,
          },
        },
      );
    });

    it('should throw error when preference not found', async () => {
      const preferenceId = 'invalid-id';

      global.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue({ message: 'Not found' }),
      });

      await expect(service.getPreference(preferenceId)).rejects.toThrow(
        'Mercado Pago API error',
      );
    });
  });

  describe('getPayment', () => {
    it('should get payment successfully', async () => {
      const paymentId = 'payment-123';
      const mockResponse = {
        id: paymentId,
        status: 'approved',
        transaction_amount: 100,
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await service.getPayment(paymentId);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockAccessToken}`,
          },
        },
      );
    });

    it('should throw error when payment not found', async () => {
      const paymentId = 'invalid-id';

      global.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue({ message: 'Payment not found' }),
      });

      await expect(service.getPayment(paymentId)).rejects.toThrow(
        'Mercado Pago API error',
      );
    });
  });

  describe('extractEmailFromCpf', () => {
    it('should extract email from cpf', () => {
      const cpf = '12345678901';

      const result = service.extractEmailFromCpf(cpf);

      expect(result).toBe('12345678901@payment-api.com');
    });
  });
});
