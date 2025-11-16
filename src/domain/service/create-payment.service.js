import { randomUUID } from 'crypto';
import Logger from '../../infrastructure/logger/logger.js';
import { PaymentStatus, PaymentEvent } from '../enums/index.js';

export default class CreatePaymentService {
  constructor({ paymentRepository, paymentHistoryRepository }) {
    this.paymentRepository = paymentRepository;
    this.paymentHistoryRepository = paymentHistoryRepository;
    this.logger = new Logger(this.constructor.name);
  }

  getPaymentData(validatedData, paymentId) {
    return {
      id: paymentId,
      cpf: validatedData.cpf,
      description: validatedData.description,
      amount: validatedData.amount,
      payment_method: validatedData.paymentMethod,
      status: PaymentStatus.PENDING,
    };
  }

  getHistoryData(validatedData, paymentId) {
    return {
      payment_id: paymentId,
      event: PaymentEvent.PAYMENT_CREATED,
      event_data: {
        cpf: validatedData.cpf,
        description: validatedData.description,
        amount: validatedData.amount,
        payment_method: validatedData.paymentMethod,
        status: PaymentStatus.PENDING,
      },
    };
  }

  async execute(validatedData) {
    const paymentId = randomUUID();

    this.logger.info('Creating payment', {
      paymentId,
      cpf: validatedData.cpf,
      amount: validatedData.amount,
      paymentMethod: validatedData.paymentMethod,
    });

    try {
      await this.paymentRepository.startTransaction();
      this.paymentHistoryRepository.setTransaction(this.paymentRepository.trx);

      const paymentData = this.getPaymentData(validatedData, paymentId);
      const historyData = this.getHistoryData(validatedData, paymentId);

      const payment = await this.paymentRepository.create(paymentData);
      await this.paymentHistoryRepository.create(historyData);

      await this.paymentRepository.commitTransaction();

      this.logger.info('Payment created successfully', {
        paymentId: payment.id,
        paymentMethod: validatedData.paymentMethod,
        status: payment.status,
      });

      return {
        success: true,
        data: payment,
      };
    } catch (error) {
      await this.paymentRepository.rollbackTransaction();
      this.logger.error('Error creating payment', {
        error: error.message,
        stack: error.stack,
        paymentId,
      });
      throw error;
    }
  }
}
