import CreatePaymentCommandFactory from '../factories/add-payment-command.factory.js';
import UpdatePaymentCommandFactory from '../factories/update-payment-command.factory.js';
import GetPaymentByIdCommandFactory from '../factories/get-payment-by-id-command.factory.js';
import ListPaymentsCommandFactory from '../factories/list-payments-command.factory.js';
import ProcessMercadoPagoWebhookCommandFactory from '../factories/process-mercado-pago-webhook-command.factory.js';

export default async function routes(fastify) {
  fastify.post('/api/payment', async (request, response) => {
    const command = CreatePaymentCommandFactory.create();
    const body = request.body;

    try {
      const result = await command.execute(body);

      response.send(result);
    } catch (error) {
      response.status(400).send({
        success: false,
        message: error.message || 'Error processing payment',
      });
    }
  });

  fastify.put('/api/payment/:id', async (request, response) => {
    const command = UpdatePaymentCommandFactory.create();
    const { id } = request.params;
    const body = request.body;

    try {
      const result = await command.execute(id, body);

      response.send(result);
    } catch (error) {
      const statusCode = error.message === 'Payment not found' ? 404 : 400;
      response.status(statusCode).send({
        success: false,
        message: error.message || 'Error updating payment',
      });
    }
  });

  fastify.get('/api/payment/:id', async (request, response) => {
    const command = GetPaymentByIdCommandFactory.create();
    const { id } = request.params;

    try {
      const result = await command.execute(id);

      response.send(result);
    } catch (error) {
      const statusCode = error.message === 'Payment not found' ? 404 : 400;
      response.status(statusCode).send({
        success: false,
        message: error.message || 'Error fetching payment',
      });
    }
  });

  fastify.get('/api/payment', async (request, response) => {
    const command = ListPaymentsCommandFactory.create();
    const filters = request.query;

    try {
      const result = await command.execute(filters);

      response.send(result);
    } catch (error) {
      response.status(400).send({
        success: false,
        message: error.message || 'Error listing payments',
      });
    }
  });

  fastify.post('/api/webhooks/mercado-pago', async (request, response) => {
    const command = ProcessMercadoPagoWebhookCommandFactory.create();
    const webhookData = request.body;

    try {
      const result = await command.execute(webhookData);

      response.send(result);
    } catch (error) {
      const statusCode = error.message === 'Payment not found' ? 404 : 400;
      response.status(statusCode).send({
        success: false,
        message: error.message || 'Error processing webhook',
      });
    }
  });
}
