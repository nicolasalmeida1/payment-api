import Logger from '../../infrastructure/logger/logger.js';
import { PaymentEvent, PaymentStatus } from '../enums/index.js';
import { PaymentNotFoundError, PaymentAlreadyPaidError } from '../errors/domain.errors.js';

export default class UpdatePaymentService {
  constructor({ paymentRepository, paymentHistoryRepository }) {
    this.paymentRepository = paymentRepository;
    this.paymentHistoryRepository = paymentHistoryRepository;
    this.logger = new Logger(this.constructor.name);
  }

  buildUpdateData(validatedData) {
    const updateData = {};
    if (validatedData.status) updateData.status = validatedData.status;
    if (validatedData.description) updateData.description = validatedData.description;
    if (validatedData.amount) updateData.amount = validatedData.amount;

    return updateData;
  }

  shouldCreateHistoryEntry(validatedData, existingPayment) {
    return validatedData.status && validatedData.status !== existingPayment.status;
  }

  async createStatusHistoryEntry(id, oldStatus, newStatus) {
    this.logger.debug('Status changed, creating history entry', {
      paymentId: id,
      oldStatus,
      newStatus,
    });

    await this.paymentHistoryRepository.create({
      payment_id: id,
      event: PaymentEvent.PAYMENT_STATUS_CHANGED,
      event_data: {
        old_status: oldStatus,
        new_status: newStatus,
      },
    });
  }

  async execute(id, validatedData) {
    this.logger.info('Updating payment', { paymentId: id, ...validatedData });

    try {
      const existingPayment = await this.paymentRepository.findById(id);

      if (!existingPayment) {
        this.logger.warn('Payment not found', { paymentId: id });
        throw new PaymentNotFoundError(id);
      }

      if (existingPayment.status === PaymentStatus.PAID) {
        this.logger.warn('Attempt to update paid payment', {
          paymentId: id,
          currentStatus: existingPayment.status,
        });
        throw new PaymentAlreadyPaidError(id);
      }

      await this.paymentRepository.startTransaction();
      this.paymentHistoryRepository.setTransaction(this.paymentRepository.trx);

      const updateData = this.buildUpdateData(validatedData);
      const updatedPayment = await this.paymentRepository.update(id, updateData);

      if (this.shouldCreateHistoryEntry(validatedData, existingPayment)) {
        await this.createStatusHistoryEntry(id, existingPayment.status, validatedData.status);
      }

      await this.paymentRepository.commitTransaction();

      this.logger.info('Payment updated successfully', { paymentId: id });

      return {
        success: true,
        data: updatedPayment,
      };
    } catch (error) {
      await this.paymentRepository.rollbackTransaction();
      this.logger.error('Error updating payment', {
        error: error.message,
        stack: error.stack,
        paymentId: id,
      });
      throw error;
    }
  }
}
