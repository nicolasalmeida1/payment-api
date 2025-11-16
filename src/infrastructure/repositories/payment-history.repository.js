import PaymentHistory from '../../db/models/payment-history.js';
import BaseRepository from './base.repository.js';

export default class PaymentHistoryRepository extends BaseRepository {
  async create(historyData) {
    this.logger.debug('Creating payment history entry', {
      paymentId: historyData.payment_id,
      event: historyData.event,
    });

    const history = await PaymentHistory.query(this.trx).insert(historyData);

    this.logger.info('Payment history entry created', {
      historyId: history.id,
      paymentId: historyData.payment_id,
      event: historyData.event,
    });

    return history;
  }

  async findByPaymentId(paymentId) {
    this.logger.debug('Finding payment history', { paymentId });

    const history = await PaymentHistory.query(this.trx).where(
      'payment_id',
      paymentId,
    );

    this.logger.debug('Payment history found', {
      paymentId,
      count: history.length,
    });

    return history;
  }
}
