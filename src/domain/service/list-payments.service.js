import Logger from '../../infrastructure/logger/logger.js';

/**
 * Service responsible for listing payments with filtering and pagination
 * @class ListPaymentsService
 */
export default class ListPaymentsService {
  /**
   * Creates an instance of ListPaymentsService
   * @param {Object} dependencies - Service dependencies
   * @param {*} dependencies.paymentRepository - Payment repository instance
   */
  constructor({ paymentRepository }) {
    this.paymentRepository = paymentRepository;
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * Lists payments with optional filtering and pagination
   * @param {ListPaymentsInput} filters - Filter and pagination options
   * @returns {Promise<ListPaymentsResponse>} List of payments with count
   */
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
