import Logger from '../logger/logger.js';
import { MercadoPagoRoutes } from '../../domain/enums/mercado-pago-routes.enum.js';

export default class MercadoPagoService {
  constructor() {
    this.logger = new Logger('MercadoPagoService');
    this.baseUrl =
      process.env.MERCADO_PAGO_BASE_URL || 'https://api.mercadopago.com';
    this.accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!this.accessToken) {
      this.logger.warn('MERCADO_PAGO_ACCESS_TOKEN not configured');
    }
  }

  async createPreference(preferenceData) {
    this.logger.debug('Creating Mercado Pago preference', { preferenceData });

    try {
      const response = await fetch(
        `${this.baseUrl}${MercadoPagoRoutes.CREATE_PREFERENCE}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify(preferenceData),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error('Mercado Pago API error', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });

        throw new Error(
          `Mercado Pago API error: ${response.status} - ${JSON.stringify(errorData)}`,
        );
      }

      const data = await response.json();
      this.logger.info('Preference created successfully', {
        preferenceId: data.id,
        initPoint: data.init_point,
      });

      return data;
    } catch (error) {
      this.logger.error('Failed to create Mercado Pago preference', {
        error: error.message,
        stack: error.stack,
      });

      throw error;
    }
  }

  buildPreferenceData(payment) {
    this.logger.debug('Building preference data', { paymentId: payment.id });

    const preferenceData = {
      items: [
        {
          id: payment.id,
          title: payment.description,
          description: payment.description,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: Number(payment.amount),
        },
      ],
      payer: {
        email: this.extractEmailFromCpf(payment.cpf),
        identification: {
          type: 'CPF',
          number: payment.cpf,
        },
      },
      back_urls: {
        success: `${process.env.APP_URL}/api/payment/${payment.id}/success`,
        pending: `${process.env.APP_URL}/api/payment/${payment.id}/pending`,
        failure: `${process.env.APP_URL}/api/payment/${payment.id}/failure`,
      },
      notification_url: `${process.env.APP_URL}/api/webhooks/mercado-pago`,
      auto_return: 'approved',
      external_reference: payment.id,
      statement_descriptor: 'PAYMENT API',
      metadata: {
        payment_id: payment.id,
        cpf: payment.cpf,
      },
    };

    return preferenceData;
  }

  extractEmailFromCpf(cpf) {
    return `${cpf}@payment-api.com`;
  }

  async getPreference(preferenceId) {
    this.logger.debug('Getting Mercado Pago preference', { preferenceId });

    try {
      const response = await fetch(
        `${this.baseUrl}${MercadoPagoRoutes.GET_PREFERENCE}/${preferenceId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error('Mercado Pago API error', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });

        throw new Error(
          `Mercado Pago API error: ${response.status} - ${JSON.stringify(errorData)}`,
        );
      }

      const data = await response.json();
      this.logger.debug('Preference retrieved successfully', { preferenceId });

      return data;
    } catch (error) {
      this.logger.error('Failed to get Mercado Pago preference', {
        error: error.message,
        stack: error.stack,
        preferenceId,
      });

      throw error;
    }
  }

  async getPayment(paymentId) {
    this.logger.debug('Getting Mercado Pago payment', { paymentId });

    try {
      const response = await fetch(
        `${this.baseUrl}${MercadoPagoRoutes.GET_PAYMENT}/${paymentId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error('Mercado Pago API error', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });

        throw new Error(
          `Mercado Pago API error: ${response.status} - ${JSON.stringify(errorData)}`,
        );
      }

      const data = await response.json();
      this.logger.debug('Payment retrieved successfully', { paymentId });

      return data;
    } catch (error) {
      this.logger.error('Failed to get Mercado Pago payment', {
        error: error.message,
        stack: error.stack,
        paymentId,
      });

      throw error;
    }
  }
}
