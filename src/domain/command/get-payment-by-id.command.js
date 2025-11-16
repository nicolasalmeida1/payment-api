import BaseCommand from './base.command.js';

export default class GetPaymentByIdCommand extends BaseCommand {
  constructor({ getPaymentByIdService }) {
    super();
    this.getPaymentByIdService = getPaymentByIdService;
  }

  async execute(id) {
    try {
      this.logger.debug('Executing command', { paymentId: id });
      return await this.getPaymentByIdService.execute(id);
    } catch (error) {
      return this.handleError(error, { paymentId: id });
    }
  }
}
