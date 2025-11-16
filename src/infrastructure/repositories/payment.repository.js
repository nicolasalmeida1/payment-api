import Payment from '../../db/models/payment.js';
import Logger from '../logger/logger.js';

export default class PaymentRepository {
  constructor(db) {
    this.db = db;
    this.logger = new Logger(this.constructor.name);
  }

  async createWithHistory(paymentData) {
    this.logger.debug('Creating payment with transaction', {
      paymentId: paymentData.id,
    });

    return this.db.transaction(async (trx) => {
      const createdPayment = await Payment.query(trx).insert(paymentData);

      this.logger.info('Payment created', { paymentId: createdPayment.id });

      return createdPayment;
    });
  }

  async create(paymentData, trx) {
    this.logger.debug('Creating payment', { paymentId: paymentData.id });

    return Payment.query(trx).insert(paymentData);
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

    return this.db.transaction(async (trx) => {
      const updatedPayment = await Payment.query(trx)
        .findById(id)
        .patch(paymentData);

      if (updatedPayment === 0) {
        this.logger.warn('Payment not found for update', { paymentId: id });

        return null;
      }

      this.logger.info('Payment updated', { paymentId: id });

      return Payment.query(trx).findById(id);
    });
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

    const query = Payment.query();
    const queryWithFilters = this.applyFilters(query, filters);
    const payments = await queryWithFilters;

    this.logger.debug('Payments found', { count: payments.length });

    return payments;
  }
}
