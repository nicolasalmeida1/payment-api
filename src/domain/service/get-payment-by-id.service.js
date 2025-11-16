import Logger from '../../infrastructure/logger/logger.js';
import { PaymentNotFoundError } from '../errors/domain.errors.js';

export default class GetPaymentByIdService {
  constructor({ paymentRepository }) {
    this.paymentRepository = paymentRepository;
    this.logger = new Logger(this.constructor.name);
  }

  async execute(id) {
    this.logger.debug('Fetching payment', { paymentId: id });

    try {
      const payment = await this.paymentRepository.findById(id);

      if (!payment) {
        this.logger.warn('Payment not found', { paymentId: id });
        throw new PaymentNotFoundError(id);
      }

      this.logger.info('Payment fetched successfully', { paymentId: id });

      return {
        success: true,
        data: payment,
      };
    } catch (error) {
      this.logger.error('Error fetching payment', {
        error: error.message,
        stack: error.stack,
        paymentId: id,
      });
      throw error;
    }
  }
}
