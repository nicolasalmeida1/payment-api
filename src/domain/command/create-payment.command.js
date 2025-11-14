import createPaymentSchema from '../validators/create-payment.validator.js';

export default class CreatePaymentCommand {
  constructor({ createPaymentService }) {
    this.createPaymentService = createPaymentService;
  }

  async execute(input) {
    try {
      const { error, value } = createPaymentSchema.validate(input, {
        abortEarly: false,
      });

      if (error) {
        const errorMessages = error.details.map((detail) => detail.message);
        throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
      }

      const result = await this.createPaymentService.execute(value);

      return result;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }
}
