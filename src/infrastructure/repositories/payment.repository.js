import Payment from '../../db/models/payment.js';
import BaseRepository from './base.repository.js';

export default class PaymentRepository extends BaseRepository {
  async create(paymentData) {
    this.logger.debug('Creating payment', { paymentId: paymentData.id });

    const createdPayment = await Payment.query(this.trx).insert(paymentData);
    this.logger.info('Payment created', { paymentId: createdPayment.id });

    return createdPayment;
  }

  async findById(id) {
    this.logger.debug('Finding payment by id', { paymentId: id });
    const payment = await Payment.query().findById(id);

    if (payment) {
      this.logger.debug('Payment found', { paymentId: id });
    } else {
      this.logger.debug('Payment not found', { paymentId: id });
    }

    return payment;
  }

  async update(id, paymentData) {
    this.logger.debug('Updating payment', { paymentId: id, ...paymentData });

    const updatedPayment = await Payment.query(this.trx)
      .findById(id)
      .patch(paymentData);

    if (updatedPayment === 0) {
      this.logger.warn('Payment not found for update', { paymentId: id });

      return null;
    }

    this.logger.info('Payment updated', { paymentId: id });

    return Payment.query(this.trx).findById(id);
  }

  applyFilters(query, filters) {
    if (filters.cpf) {
      query = query.where('cpf', filters.cpf);
    }

    if (filters.paymentMethod) {
      query = query.where('payment_method', filters.paymentMethod);
    }

    if (filters.status) {
      query = query.where('status', filters.status);
    }

    return query;
  }

  async findAll(filters = {}) {
    this.logger.debug('Finding payments', { filters });

    const { page = 1, take = 10, ...otherFilters } = filters;

    let query = Payment.query();
    query = this.applyFilters(query, otherFilters);

    const limit = take;
    const offset = (page - 1) * take;

    const payments = await query.limit(limit).offset(offset);

    this.logger.debug('Payments found', { count: payments.length, page, take });

    return payments;
  }
}
