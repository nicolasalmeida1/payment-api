import Logger from '../../infrastructure/logger/logger.js';

export default class UpdatePaymentService {
  constructor({ paymentRepository, paymentHistoryRepository }) {
    this.paymentRepository = paymentRepository;
    this.paymentHistoryRepository = paymentHistoryRepository;
    this.logger = new Logger(this.constructor.name);
  }

  async execute(id, validatedData) {
    this.logger.info('Updating payment', { paymentId: id, ...validatedData });

    try {
      const existingPayment = await this.paymentRepository.findById(id);

      if (!existingPayment) {
        this.logger.warn('Payment not found', { paymentId: id });
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
        this.logger.debug('Status changed, creating history entry', {
          paymentId: id,
          oldStatus: existingPayment.status,
          newStatus: validatedData.status,
        });

        await this.paymentHistoryRepository.create({
          payment_id: id,
          event: 'PAYMENT_STATUS_CHANGED',
          event_data: {
            old_status: existingPayment.status,
            new_status: validatedData.status,
          },
        });
      }

      this.logger.info('Payment updated successfully', { paymentId: id });

      return {
        success: true,
        data: updatedPayment,
      };
    } catch (error) {
      this.logger.error('Error updating payment', {
        error: error.message,
        stack: error.stack,
        paymentId: id,
      });
      throw error;
    }
  }
}
