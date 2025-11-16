import listPaymentsSchema from '../validators/list-payments.validator.js';
import BaseCommand from './base.command.js';

/**
 * Command for listing payments with filters
 * @class ListPaymentsCommand
 * @extends BaseCommand
 */
export default class ListPaymentsCommand extends BaseCommand {
  /**
   * Creates an instance of ListPaymentsCommand
   * @param {Object} dependencies - Command dependencies
   * @param {*} dependencies.listPaymentsService - List payments service instance
   */
  constructor({ listPaymentsService }) {
    super();
    this.listPaymentsService = listPaymentsService;
  }

  /**
   * Executes the list payments command
   * @param {ListPaymentsInput} filters - Filter and pagination options
   * @returns {Promise<CommandResult>} Command execution result
   */
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
