import Logger from '../logger/logger.js';
import { randomUUID } from 'crypto';

const globalCallCounts = new Map();

/**
 * Mock service simulating Mercado Pago API for testing and development
 * @class MercadoPagoMockService
 */
export default class MercadoPagoMockService {
  /**
   * Creates an instance of MercadoPagoMockService
   */
  constructor() {
    this.logger = new Logger('MercadoPagoMockService');
    this.callCounts = globalCallCounts;
  }

  /**
   * Creates a mock payment preference
   * @param {Payment} payment - Payment object
   * @returns {Promise<MercadoPagoPreference>} Mock preference data
   */
  async createPreference(payment) {
    this.logger.info('[MOCK] Creating Mercado Pago preference', {
      paymentId: payment.id,
    });

    await this.delay(500);

    const preferenceId = `pref-mock-${randomUUID().substring(0, 8)}`;

    const mockResponse = {
      id: preferenceId,
      init_point: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`,
      sandbox_init_point: `https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`,
      external_reference: payment.id,
    };

    this.logger.info('[MOCK] Preference created successfully', {
      preferenceId: mockResponse.id,
      initPoint: mockResponse.init_point,
    });

    return mockResponse;
  }

  /**
   * Gets a mock preference by ID
   * @param {string} preferenceId - Preference identifier
   * @returns {Promise<MercadoPagoPreference>} Mock preference data
   */
  async getPreference(preferenceId) {
    this.logger.info('[MOCK] Getting Mercado Pago preference', { preferenceId });

    await this.delay(300);

    return {
      id: preferenceId,
      items: [
        {
          id: 'mock-item-1',
          title: 'Mock Payment',
          quantity: 1,
          unit_price: 100.0,
        },
      ],
      external_reference: 'mock-payment-id',
    };
  }

  /**
   * Gets mock payment status (simulates status progression)
   * First call returns 'pending', subsequent calls return 'approved'
   * @param {string} paymentId - Payment identifier
   * @returns {Promise<MercadoPagoPayment>} Mock payment data
   */
  async getPayment(paymentId) {
    this.logger.info('[MOCK] Getting Mercado Pago payment', { paymentId });

    await this.delay(300);

    const callKey = `payment-${paymentId}`;
    const currentCount = this.callCounts.get(callKey) || 0;
    this.callCounts.set(callKey, currentCount + 1);

    const status = currentCount === 0 ? 'pending' : 'approved';

    this.logger.info('[MOCK] Payment status', {
      paymentId,
      callNumber: currentCount + 1,
      status,
    });

    return {
      id: paymentId,
      status: status,
      status_detail: status === 'approved' ? 'accredited' : 'pending_contingency',
      external_reference: paymentId,
      transaction_amount: 100.0,
      date_created: new Date().toISOString(),
      date_approved: status === 'approved' ? new Date().toISOString() : null,
    };
  }

  /**
   * Simulates API delay
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  async delay(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  /**
   * Resets call counter for testing purposes
   * @returns {void}
   */
  resetCallCounts() {
    this.callCounts.clear();
    this.logger.info('[MOCK] Call counts reset');
  }
}
