import BaseCommand from './base.command.js';
import { mercadoPagoWebhookSchema } from '../validators/mercado-pago-webhook.validator.js';

export default class ProcessMercadoPagoWebhookCommand extends BaseCommand {
  constructor({ processMercadoPagoWebhookService }) {
    super();
    this.processMercadoPagoWebhookService = processMercadoPagoWebhookService;
    this.context = 'ProcessMercadoPagoWebhookCommand';
  }

  async execute(webhookData) {
    this.logger.info('Executing ProcessMercadoPagoWebhookCommand', {
      action: webhookData.action,
      type: webhookData.type,
    });

    const validatedData = this.validate(mercadoPagoWebhookSchema, webhookData, this.context);

    try {
      const result = await this.processMercadoPagoWebhookService.execute(validatedData);

      return result;
    } catch (error) {
      this.handleError(error, this.context);

      throw error;
    }
  }
}
