import updatePaymentSchema from '../validators/update-payment.validator.js';

export default class UpdatePaymentCommand {
  constructor({ updatePaymentService }) {
    this.updatePaymentService = updatePaymentService;
  }

  async execute(id, input) {
    try {
      const { error, value } = updatePaymentSchema.validate(input, {
        abortEarly: false,
      });

      if (error) {
        const errorMessages = error.details.map((detail) => detail.message);
        throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
      }

      const result = await this.updatePaymentService.execute(id, value);

      return result;
    } catch (error) {
      console.info(error);

      throw error;
    }
  }
}
