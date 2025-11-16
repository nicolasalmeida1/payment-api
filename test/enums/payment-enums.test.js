import {
  PaymentStatus,
  PaymentMethod,
  PaymentEvent,
} from '../../src/domain/enums/index.js';

describe('Payment Enums', () => {
  describe('PaymentStatus', () => {
    it('should have PENDING status', () => {
      expect(PaymentStatus.PENDING).toBe('PENDING');
    });

    it('should have PAID status', () => {
      expect(PaymentStatus.PAID).toBe('PAID');
    });

    it('should have FAIL status', () => {
      expect(PaymentStatus.FAIL).toBe('FAIL');
    });

    it('should have exactly 3 statuses', () => {
      expect(Object.keys(PaymentStatus)).toHaveLength(3);
    });
  });

  describe('PaymentMethod', () => {
    it('should have PIX method', () => {
      expect(PaymentMethod.PIX).toBe('PIX');
    });

    it('should have CREDIT_CARD method', () => {
      expect(PaymentMethod.CREDIT_CARD).toBe('CREDIT_CARD');
    });

    it('should have exactly 2 methods', () => {
      expect(Object.keys(PaymentMethod)).toHaveLength(2);
    });
  });

  describe('PaymentEvent', () => {
    it('should have PAYMENT_CREATED event', () => {
      expect(PaymentEvent.PAYMENT_CREATED).toBe('PAYMENT_CREATED');
    });

    it('should have PAYMENT_STATUS_CHANGED event', () => {
      expect(PaymentEvent.PAYMENT_STATUS_CHANGED).toBe(
        'PAYMENT_STATUS_CHANGED',
      );
    });

    it('should have exactly 2 events', () => {
      expect(Object.keys(PaymentEvent)).toHaveLength(2);
    });
  });
});
