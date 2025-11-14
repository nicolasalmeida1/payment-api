export default class GetPaymentByIdCommand {
  constructor({ getPaymentByIdService }) {
    this.getPaymentByIdService = getPaymentByIdService;
  }

  async execute(id) {
    try {
      const result = await this.getPaymentByIdService.execute(id);

      return result;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }
}
