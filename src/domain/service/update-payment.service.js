export default class UpdatePaymentService {
  constructor({ paymentRepository, paymentHistoryRepository }) {
    this.paymentRepository = paymentRepository;
    this.paymentHistoryRepository = paymentHistoryRepository;
  }

  async execute(id, validatedData) {
    try {
      const existingPayment = await this.paymentRepository.findById(id);

      if (!existingPayment) {
        throw new Error('Payment not found');
      }

      const updateData = {};
      if (validatedData.status) updateData.status = validatedData.status;
      if (validatedData.description)
        updateData.description = validatedData.description;
      if (validatedData.amount) updateData.amount = validatedData.amount;

      const updatedPayment = await this.paymentRepository.update(
        id,
        updateData,
      );

      if (
        validatedData.status &&
        validatedData.status !== existingPayment.status
      ) {
        await this.paymentHistoryRepository.create({
          payment_id: id,
          event: 'PAYMENT_STATUS_CHANGED',
          event_data: {
            old_status: existingPayment.status,
            new_status: validatedData.status,
          },
        });
      }

      return {
        success: true,
        data: updatedPayment,
      };
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }
}
