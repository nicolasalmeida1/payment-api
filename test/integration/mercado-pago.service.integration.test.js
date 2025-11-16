import nock from 'nock';
import MercadoPagoService from '../../src/infrastructure/services/mercado-pago.service.js';
import {
  mockPreferenceResponse,
  mockPaymentResponseApproved,
  mockPaymentResponsePending,
  mockPaymentResponseRejected,
  mockPaymentResponseNotFound,
  mockPreferenceNotFound,
  mockApiErrorInvalidItems,
  mockApiErrorUnauthorized,
  mockApiErrorRateLimit,
  createMockPayment,
  createMockPaymentResponse,
} from '../mocks/mercado-pago.mock.js';

describe('MercadoPagoService - Integration Tests with Nock', () => {
  let service;
  const baseUrl = 'https://api.mercadopago.com';
  const mockAccessToken = 'TEST-ACCESS-TOKEN-123456';

  beforeEach(() => {
    process.env.MERCADO_PAGO_ACCESS_TOKEN = mockAccessToken;
    process.env.MERCADO_PAGO_BASE_URL = baseUrl;
    process.env.APP_URL = 'https://my-app.com';
    service = new MercadoPagoService();

    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('createPreference', () => {
    it('should create preference successfully with complete flow', async () => {
      const payment = createMockPayment();

      nock(baseUrl)
        .post('/checkout/preferences', body => {
          expect(body.items).toBeDefined();
          expect(body.items[0].id).toBe(payment.id);
          expect(body.items[0].unit_price).toBe(payment.amount);
          expect(body.external_reference).toBe(payment.id);
          expect(body.payer.identification.number).toBe(payment.cpf);
          expect(body.metadata.payment_id).toBe(payment.id);

          return true;
        })
        .matchHeader('Authorization', `Bearer ${mockAccessToken}`)
        .matchHeader('Content-Type', 'application/json')
        .reply(201, mockPreferenceResponse);

      const result = await service.createPreference(payment);

      expect(result).toEqual(mockPreferenceResponse);
      expect(result.id).toBe('preference-abc123xyz');
      expect(result.init_point).toContain('mercadopago.com.br/checkout');
      expect(result.external_reference).toBe(payment.id);

      expect(nock.isDone()).toBe(true);
    });

    it('should handle API error 400 - Invalid Items', async () => {
      const payment = createMockPayment({ amount: -100 });

      nock(baseUrl)
        .post('/checkout/preferences')
        .matchHeader('Authorization', `Bearer ${mockAccessToken}`)
        .reply(400, mockApiErrorInvalidItems);

      await expect(service.createPreference(payment)).rejects.toThrow('Mercado Pago API error: 400');

      expect(nock.isDone()).toBe(true);
    });

    it('should handle API error 401 - Unauthorized', async () => {
      const payment = createMockPayment();

      nock(baseUrl).post('/checkout/preferences').reply(401, mockApiErrorUnauthorized);

      await expect(service.createPreference(payment)).rejects.toThrow('Mercado Pago API error: 401');

      expect(nock.isDone()).toBe(true);
    });

    it('should handle API error 429 - Rate Limit', async () => {
      const payment = createMockPayment();

      nock(baseUrl).post('/checkout/preferences').reply(429, mockApiErrorRateLimit);

      await expect(service.createPreference(payment)).rejects.toThrow('Mercado Pago API error: 429');

      expect(nock.isDone()).toBe(true);
    });

    it('should handle network timeout', async () => {
      const payment = createMockPayment();

      nock(baseUrl).post('/checkout/preferences').delayConnection(3000).replyWithError({
        message: 'ETIMEDOUT',
        code: 'ETIMEDOUT',
      });

      await expect(service.createPreference(payment)).rejects.toThrow();

      expect(nock.isDone()).toBe(true);
    }, 6000);

    it('should handle network connection refused', async () => {
      const payment = createMockPayment();

      nock(baseUrl).post('/checkout/preferences').replyWithError({
        message: 'connect ECONNREFUSED',
        code: 'ECONNREFUSED',
      });

      await expect(service.createPreference(payment)).rejects.toThrow();

      expect(nock.isDone()).toBe(true);
    });
  });

  describe('getPreference', () => {
    it('should get preference successfully', async () => {
      const preferenceId = 'preference-abc123xyz';

      nock(baseUrl)
        .get(`/checkout/preferences/${preferenceId}`)
        .matchHeader('Authorization', `Bearer ${mockAccessToken}`)
        .reply(200, mockPreferenceResponse);

      const result = await service.getPreference(preferenceId);

      expect(result).toEqual(mockPreferenceResponse);
      expect(result.id).toBe(preferenceId);
      expect(nock.isDone()).toBe(true);
    });

    it('should handle preference not found', async () => {
      const preferenceId = 'invalid-preference-id';

      nock(baseUrl).get(`/checkout/preferences/${preferenceId}`).reply(404, mockPreferenceNotFound);

      await expect(service.getPreference(preferenceId)).rejects.toThrow('Mercado Pago API error: 404');

      expect(nock.isDone()).toBe(true);
    });

    it('should handle unauthorized request', async () => {
      const preferenceId = 'preference-abc123xyz';

      nock(baseUrl).get(`/checkout/preferences/${preferenceId}`).reply(401, mockApiErrorUnauthorized);

      await expect(service.getPreference(preferenceId)).rejects.toThrow('Mercado Pago API error: 401');

      expect(nock.isDone()).toBe(true);
    });
  });

  describe('getPayment', () => {
    it('should get approved payment successfully', async () => {
      const paymentId = '98765432';

      nock(baseUrl)
        .get(`/v1/payments/${paymentId}`)
        .matchHeader('Authorization', `Bearer ${mockAccessToken}`)
        .reply(200, mockPaymentResponseApproved);

      const result = await service.getPayment(paymentId);

      expect(result).toEqual(mockPaymentResponseApproved);
      expect(result.status).toBe('approved');
      expect(result.status_detail).toBe('accredited');
      expect(result.transaction_amount).toBe(250.75);
      expect(nock.isDone()).toBe(true);
    });

    it('should get pending payment successfully', async () => {
      const paymentId = '98765433';

      nock(baseUrl).get(`/v1/payments/${paymentId}`).reply(200, mockPaymentResponsePending);

      const result = await service.getPayment(paymentId);

      expect(result.status).toBe('pending');
      expect(result.status_detail).toBe('pending_contingency');
      expect(nock.isDone()).toBe(true);
    });

    it('should get rejected payment successfully', async () => {
      const paymentId = '98765434';

      nock(baseUrl).get(`/v1/payments/${paymentId}`).reply(200, mockPaymentResponseRejected);

      const result = await service.getPayment(paymentId);

      expect(result.status).toBe('rejected');
      expect(result.status_detail).toBe('cc_rejected_insufficient_amount');
      expect(nock.isDone()).toBe(true);
    });

    it('should handle payment not found', async () => {
      const paymentId = 'invalid-payment-id';

      nock(baseUrl).get(`/v1/payments/${paymentId}`).reply(404, mockPaymentResponseNotFound);

      await expect(service.getPayment(paymentId)).rejects.toThrow('Mercado Pago API error: 404');

      expect(nock.isDone()).toBe(true);
    });

    it('should handle unauthorized payment request', async () => {
      const paymentId = '98765432';

      nock(baseUrl).get(`/v1/payments/${paymentId}`).reply(401, mockApiErrorUnauthorized);

      await expect(service.getPayment(paymentId)).rejects.toThrow('Mercado Pago API error: 401');

      expect(nock.isDone()).toBe(true);
    });
  });

  describe('Full Payment Flow Integration', () => {
    it('should complete full payment flow: create preference -> poll status -> get final status', async () => {
      const payment = createMockPayment();
      const preferenceId = 'preference-flow-test';
      const mercadoPagoPaymentId = '12345678';

      nock(baseUrl)
        .post('/checkout/preferences')
        .reply(201, {
          ...mockPreferenceResponse,
          id: preferenceId,
        });

      const preference = await service.createPreference(payment);
      expect(preference.id).toBe(preferenceId);

      nock(baseUrl)
        .get(`/v1/payments/${mercadoPagoPaymentId}`)
        .reply(200, createMockPaymentResponse('pending', { id: mercadoPagoPaymentId }));

      const pendingPayment = await service.getPayment(mercadoPagoPaymentId);
      expect(pendingPayment.status).toBe('pending');

      nock(baseUrl)
        .get(`/v1/payments/${mercadoPagoPaymentId}`)
        .reply(200, createMockPaymentResponse('approved', { id: mercadoPagoPaymentId }));

      const approvedPayment = await service.getPayment(mercadoPagoPaymentId);
      expect(approvedPayment.status).toBe('approved');

      expect(nock.isDone()).toBe(true);
    });

    it('should handle payment rejection flow', async () => {
      const payment = createMockPayment();
      const mercadoPagoPaymentId = '12345679';

      nock(baseUrl).post('/checkout/preferences').reply(201, mockPreferenceResponse);

      await service.createPreference(payment);

      nock(baseUrl)
        .get(`/v1/payments/${mercadoPagoPaymentId}`)
        .reply(200, createMockPaymentResponse('rejected', { id: mercadoPagoPaymentId }));

      const rejectedPayment = await service.getPayment(mercadoPagoPaymentId);
      expect(rejectedPayment.status).toBe('rejected');

      expect(nock.isDone()).toBe(true);
    });
  });

  describe('buildPreferenceData', () => {
    it('should build correct preference data structure', () => {
      const payment = createMockPayment({
        id: 'test-123',
        cpf: '98765432100',
        description: 'Test Product',
        amount: 99.99,
      });

      const result = service.buildPreferenceData(payment);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('test-123');
      expect(result.items[0].unit_price).toBe(99.99);
      expect(result.items[0].currency_id).toBe('BRL');
      expect(result.payer.identification.number).toBe('98765432100');
      expect(result.payer.email).toBe('98765432100@payment-api.com');
      expect(result.external_reference).toBe('test-123');
      expect(result.statement_descriptor).toBe('PAYMENT API');
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should not retry on 4xx errors (client errors)', async () => {
      const payment = createMockPayment();

      nock(baseUrl).post('/checkout/preferences').reply(400, mockApiErrorInvalidItems);

      await expect(service.createPreference(payment)).rejects.toThrow();

      expect(nock.isDone()).toBe(true);
      expect(nock.activeMocks()).toHaveLength(0);
    });

    it('should handle multiple concurrent requests', async () => {
      const payment1 = createMockPayment({ id: 'payment-1' });
      const payment2 = createMockPayment({ id: 'payment-2' });
      const payment3 = createMockPayment({ id: 'payment-3' });

      nock(baseUrl)
        .post('/checkout/preferences')
        .reply(201, { ...mockPreferenceResponse, id: 'pref-1' })
        .post('/checkout/preferences')
        .reply(201, { ...mockPreferenceResponse, id: 'pref-2' })
        .post('/checkout/preferences')
        .reply(201, { ...mockPreferenceResponse, id: 'pref-3' });

      const [result1, result2, result3] = await Promise.all([
        service.createPreference(payment1),
        service.createPreference(payment2),
        service.createPreference(payment3),
      ]);

      expect(result1.id).toBe('pref-1');
      expect(result2.id).toBe('pref-2');
      expect(result3.id).toBe('pref-3');
      expect(nock.isDone()).toBe(true);
    });
  });
});
