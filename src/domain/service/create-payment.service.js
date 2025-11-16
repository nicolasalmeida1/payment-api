import Logger from '../../infrastructure/logger/logger.js';
import { PaymentStatus, PaymentEvent } from '../enums/index.js';

export default class CreatePaymentService {
  constructor({ paymentRepository, paymentHistoryRepository }) {
    this.paymentRepository = paymentRepository;
    this.paymentHistoryRepository = paymentHistoryRepository;
    this.logger = new Logger(this.constructor.name);
  }

  async execute(validatedData) {
    this.logger.info('Creating payment', {
      paymentId: validatedData.id,
      cpf: validatedData.cpf,
      amount: validatedData.amount,
    });

    try {
      const paymentData = {
        id: validatedData.id,
        cpf: validatedData.cpf,
        description: validatedData.description,
        amount: validatedData.amount,
        payment_method: validatedData.paymentMethod,
        status: PaymentStatus.PENDING,
      };

      const historyData = {
        payment_id: validatedData.id,
        event: PaymentEvent.PAYMENT_CREATED,
        event_data: {
          cpf: validatedData.cpf,
          description: validatedData.description,
          amount: validatedData.amount,
          payment_method: validatedData.paymentMethod,
          status: PaymentStatus.PENDING,
        },
      };

      const payment = await this.paymentRepository.createWithHistory(
        paymentData,
        historyData,
        this.paymentHistoryRepository,
      );

      this.logger.info('Payment created successfully', {
        paymentId: payment.id,
      });

      return {
        success: true,
        data: payment,
      };
    } catch (error) {
      this.logger.error('Error creating payment', {
        error: error.message,
        stack: error.stack,
        paymentId: validatedData.id,
      });
      throw error;
    }
  }
}
