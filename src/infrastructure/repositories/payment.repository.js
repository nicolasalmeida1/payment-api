import Payment from '../../db/models/payment.js';

export default class PaymentRepository {
  constructor(db) {
    this.db = db;
  }

  async createWithHistory(paymentData) {
    return this.db.transaction(async (trx) => {
      const createdPayment = await Payment.query(trx).insert(paymentData);

      return createdPayment;
    });
  }

  async create(paymentData, trx) {
    return Payment.query(trx).insert(paymentData);
  }

  async findById(id) {
    return Payment.query().findById(id);
  }

  async update(id, paymentData) {
    return this.db.transaction(async (trx) => {
      const updatedPayment = await Payment.query(trx)
        .findById(id)
        .patch(paymentData);

      if (updatedPayment === 0) {
        return null;
      }

      return Payment.query(trx).findById(id);
    });
  }

  async findAll(filters = {}) {
    let query = Payment.query();

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
}
