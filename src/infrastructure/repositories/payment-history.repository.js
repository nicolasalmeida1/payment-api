import PaymentHistory from '../../db/models/payment-history.js';
import BaseRepository from './base.repository.js';

/**
 * Repository for managing payment history records
 * @class PaymentHistoryRepository
 * @extends BaseRepository
 */
export default class PaymentHistoryRepository extends BaseRepository {
  /**
   * Creates a new payment history entry
   * @param {PaymentHistoryData} historyData - History entry data
   * @returns {Promise<PaymentHistory>} Created history record
   */
  async create(historyData) {
    const history = await PaymentHistory.query(this.trx).insert(historyData);

    this.logger.info('Payment history entry created', {
      historyId: history.id,
      paymentId: historyData.payment_id,
      event: historyData.event,
    });

    return history;
  }

  /**
   * Finds all history entries for a payment
   * @param {string} paymentId - Payment identifier
   * @returns {Promise<PaymentHistory[]>} Array of history entries
   */
  async findByPaymentId(paymentId) {
    const history = await PaymentHistory.query(this.trx).where('payment_id', paymentId);

    return history;
  }
}
