export default class ListPaymentsService {
  constructor({ paymentRepository }) {
    this.paymentRepository = paymentRepository;
  }

  async execute(filters) {
    try {
      const payments = await this.paymentRepository.findAll(filters);

      return {
        success: true,
        data: payments,
        count: payments.length,
      };
    } catch (error) {
      console.error('Error listing payments:', error);
      throw error;
    }
  }
}
