export default class CreatePaymentService {
  constructor({ paymentRepository, paymentHistoryRepository }) {
    this.paymentRepository = paymentRepository;
    this.paymentHistoryRepository = paymentHistoryRepository;
  }

  async execute(validatedData) {
    try {
      const paymentData = {
        id: validatedData.id,
        cpf: validatedData.cpf,
        description: validatedData.description,
        amount: validatedData.amount,
        payment_method: validatedData.paymentMethod,
        status: 'PENDING',
      };

      const historyData = {
        payment_id: validatedData.id,
        event: 'PAYMENT_CREATED',
        event_data: {
          cpf: validatedData.cpf,
          description: validatedData.description,
          amount: validatedData.amount,
          payment_method: validatedData.paymentMethod,
          status: 'PENDING',
        },
      };

      const payment = await this.paymentRepository.createWithHistory(
        paymentData,
        historyData,
        this.paymentHistoryRepository,
      );

      return {
        success: true,
        data: payment,
      };
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }
}
