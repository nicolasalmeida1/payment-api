import listPaymentsSchema from '../validators/list-payments.validator.js';

export default class ListPaymentsCommand {
  constructor({ listPaymentsService }) {
    this.listPaymentsService = listPaymentsService;
  }

  async execute(filters) {
    try {
      const { error, value } = listPaymentsSchema.validate(filters, {
        abortEarly: false,
      });

      if (error) {
        const errorMessages = error.details.map((detail) => detail.message);
        throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
      }

      const result = await this.listPaymentsService.execute(value);

      return result;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }
}
