import Logger from '../../infrastructure/logger/logger.js';

export default class GetPaymentByIdCommand {
  constructor({ getPaymentByIdService }) {
    this.getPaymentByIdService = getPaymentByIdService;
    this.logger = new Logger(this.constructor.name);
  }

  async execute(id) {
    try {
      this.logger.debug('Executing get payment by id command', {
        paymentId: id,
      });

      const result = await this.getPaymentByIdService.execute(id);

      return result;
    } catch (error) {
      this.logger.error('Error in get payment by id command', {
        error: error.message,
        stack: error.stack,
        paymentId: id,
      });

      throw error;
    }
  }
}
