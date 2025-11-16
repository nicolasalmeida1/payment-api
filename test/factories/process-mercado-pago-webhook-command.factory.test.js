import ProcessMercadoPagoWebhookCommandFactory from '../../src/infrastructure/factories/process-mercado-pago-webhook-command.factory.js';
import ProcessMercadoPagoWebhookCommand from '../../src/domain/command/process-mercado-pago-webhook.command.js';

describe('ProcessMercadoPagoWebhookCommandFactory', () => {
  it('should create ProcessMercadoPagoWebhookCommand instance', () => {
    const command = ProcessMercadoPagoWebhookCommandFactory.create();

    expect(command).toBeInstanceOf(ProcessMercadoPagoWebhookCommand);
  });

  it('should inject processMercadoPagoWebhookService', () => {
    const command = ProcessMercadoPagoWebhookCommandFactory.create();

    expect(command.processMercadoPagoWebhookService).toBeDefined();
    expect(command.processMercadoPagoWebhookService.execute).toBeDefined();
    expect(typeof command.processMercadoPagoWebhookService.execute).toBe('function');
  });

  it('should create new instance on each call', () => {
    const command1 = ProcessMercadoPagoWebhookCommandFactory.create();
    const command2 = ProcessMercadoPagoWebhookCommandFactory.create();

    expect(command1).not.toBe(command2);
  });
});
