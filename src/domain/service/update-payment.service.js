import Logger from '../../infrastructure/logger/logger.js';
import { PaymentEvent, PaymentStatus } from '../enums/index.js';
import { PaymentNotFoundError, PaymentAlreadyPaidError } from '../errors/domain.errors.js';

/**
 * Service responsible for updating existing payments
 * @class UpdatePaymentService
 */
export default class UpdatePaymentService {
  /**
   * Creates an instance of UpdatePaymentService
   * @param {Object} dependencies - Service dependencies
   * @param {*} dependencies.paymentRepository - Payment repository instance
   * @param {*} dependencies.paymentHistoryRepository - Payment history repository instance
   */
  constructor({ paymentRepository, paymentHistoryRepository }) {
    this.paymentRepository = paymentRepository;
    this.paymentHistoryRepository = paymentHistoryRepository;
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * Builds update data object from validated input
   * @param {UpdatePaymentInput} validatedData - Validated update input
   * @returns {Partial<PaymentData>} Update data for repository
   */
  buildUpdateData(validatedData) {
    const updateData = {};
    if (validatedData.status) updateData.status = validatedData.status;
    if (validatedData.description) updateData.description = validatedData.description;
    if (validatedData.amount) updateData.amount = validatedData.amount;

    return updateData;
  }

  /**
   * Checks if history entry should be created for status change
   * @param {UpdatePaymentInput} validatedData - Validated input
   * @param {Payment} existingPayment - Existing payment record
   * @returns {boolean} True if history entry should be created
   */
  shouldCreateHistoryEntry(validatedData, existingPayment) {
    return validatedData.status && validatedData.status !== existingPayment.status;
  }

  /**
   * Creates a history entry for status change
   * @param {string} id - Payment ID
   * @param {PaymentStatusType} oldStatus - Previous status
   * @param {PaymentStatusType} newStatus - New status
   * @returns {Promise<void>}
   */
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

  /**
   * Executes payment update with transaction support
   * @param {string} id - Payment ID to update
   * @param {UpdatePaymentInput} validatedData - Validated update data
   * @returns {Promise<UpdatePaymentResponse>} Updated payment data
   * @throws {PaymentNotFoundError} If payment doesn't exist
   * @throws {PaymentAlreadyPaidError} If payment is already paid
   */
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
