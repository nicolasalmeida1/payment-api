import BaseCommand from './base.command.js';
import { mercadoPagoWebhookSchema } from '../validators/mercado-pago-webhook.validator.js';

/**
 * Command for processing Mercado Pago webhook notifications
 * @class ProcessMercadoPagoWebhookCommand
 * @extends BaseCommand
 */
export default class ProcessMercadoPagoWebhookCommand extends BaseCommand {
  /**
   * Creates an instance of ProcessMercadoPagoWebhookCommand
   * @param {Object} dependencies - Command dependencies
   * @param {*} dependencies.processMercadoPagoWebhookService - Process webhook service instance
   */
  constructor({ processMercadoPagoWebhookService }) {
    super();
    this.processMercadoPagoWebhookService = processMercadoPagoWebhookService;
  }

  /**
   * Executes the webhook processing command
   * @param {MercadoPagoWebhookInput} webhookData - Webhook payload data
   * @returns {Promise<CommandResult>} Command execution result
   */
  async execute(webhookData) {
    const validatedData = this.validate(mercadoPagoWebhookSchema, webhookData);

    try {
      const result = await this.processMercadoPagoWebhookService.execute(validatedData);

      return result;
    } catch (error) {
      this.handleError(error);

      throw error;
    }
  }
}
