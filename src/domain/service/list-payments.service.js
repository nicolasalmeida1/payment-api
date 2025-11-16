import Logger from '../../infrastructure/logger/logger.js';

export default class ListPaymentsService {
  constructor({ paymentRepository }) {
    this.paymentRepository = paymentRepository;
    this.logger = new Logger('ListPaymentsService');
  }

  async execute(filters) {
    this.logger.debug('Listing payments', { filters });

    try {
      const payments = await this.paymentRepository.findAll(filters);

      this.logger.info('Payments listed successfully', {
        count: payments.length,
        filters,
      });

      return {
        success: true,
        data: payments,
        count: payments.length,
      };
    } catch (error) {
      this.logger.error('Error listing payments', {
        error: error.message,
        stack: error.stack,
        filters,
      });
      throw error;
    }
  }
}
