import listPaymentsSchema from '../validators/list-payments.validator.js';
import BaseCommand from './base.command.js';

export default class ListPaymentsCommand extends BaseCommand {
  constructor({ listPaymentsService }) {
    super();
    this.listPaymentsService = listPaymentsService;
  }

  async execute(filters) {
    try {
      const validatedData = this.validate(listPaymentsSchema, filters, {
        filters,
      });

      return await this.listPaymentsService.execute(validatedData);
    } catch (error) {
      return this.handleError(error);
    }
  }
}
