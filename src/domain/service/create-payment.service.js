import { randomUUID } from 'crypto';
import Logger from '../../infrastructure/logger/logger.js';
import { PaymentStatus, PaymentEvent, PaymentMethod } from '../enums/index.js';
import { startCreditCardPaymentWorkflow } from '../../temporal/client.js';

export default class CreatePaymentService {
  constructor({ paymentRepository, paymentHistoryRepository, mercadoPagoService }) {
    this.paymentRepository = paymentRepository;
    this.paymentHistoryRepository = paymentHistoryRepository;
    this.mercadoPagoService = mercadoPagoService;
    this.logger = new Logger(this.constructor.name);
    this.useTemporalWorkflow = process.env.USE_TEMPORAL_WORKFLOW === 'true';
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

  async processCreditCardPayment(payment) {
    this.logger.info('Processing credit card payment with Mercado Pago', {
      paymentId: payment.id,
    });

    try {
      const mercadoPagoPreference = await this.mercadoPagoService.createPreference(payment);

      return {
        preference_id: mercadoPagoPreference.id,
        init_point: mercadoPagoPreference.init_point,
        sandbox_init_point: mercadoPagoPreference.sandbox_init_point,
      };
    } catch (error) {
      this.logger.error('Error creating Mercado Pago preference', {
        error: error.message,
        stack: error.stack,
        paymentId: payment.id,
      });

      throw error;
    }
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

      let mercadoPagoData = null;
      let workflowData = null;

      if (validatedData.paymentMethod === PaymentMethod.CREDIT_CARD) {
        if (this.useTemporalWorkflow) {
          this.logger.info('Starting Temporal workflow for credit card payment', {
            paymentId: payment.id,
          });

          try {
            workflowData = await startCreditCardPaymentWorkflow({
              id: payment.id,
              cpf: payment.cpf,
              description: payment.description,
              amount: payment.amount,
              paymentMethod: payment.payment_method,
            });

            this.logger.info('Temporal workflow started successfully', {
              paymentId: payment.id,
              workflowId: workflowData.workflowId,
            });
          } catch (error) {
            this.logger.error('Error starting Temporal workflow', {
              error: error.message,
              stack: error.stack,
              paymentId: payment.id,
            });
          }
        } else {
          mercadoPagoData = await this.processCreditCardPayment(payment);
        }
      }

      return {
        success: true,
        data: payment,
        mercadoPago: mercadoPagoData,
        workflow: workflowData,
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
