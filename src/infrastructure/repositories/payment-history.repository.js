import PaymentHistory from '../../db/models/payment-history.js';

export default class PaymentHistoryRepository {
  constructor(db) {
    this.db = db;
  }

  async create(historyData, trx) {
    return PaymentHistory.query(trx).insert(historyData);
  }

  async findByPaymentId(paymentId, trx) {
    return PaymentHistory.query(trx).where('payment_id', paymentId);
  }
}
