export default class GetPaymentByIdService {
  constructor({ paymentRepository }) {
    this.paymentRepository = paymentRepository;
  }

  async execute(id) {
    try {
      const payment = await this.paymentRepository.findById(id);

      if (!payment) {
        throw new Error('Payment not found');
      }

      return {
        success: true,
        data: payment,
      };
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  }
}
