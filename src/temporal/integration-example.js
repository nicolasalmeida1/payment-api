import { startCreditCardPaymentWorkflow, getCreditCardPaymentWorkflowStatus } from '../temporal/client.js';
import Logger from '../infrastructure/logger/logger.js';

const logger = new Logger('TemporalIntegrationExample');

/**
 * Exemplo de como integrar o Temporal.io com o CreatePaymentService
 *
 * Este arquivo demonstra como modificar o método processCreditCardPayment
 * para usar o workflow do Temporal ao invés de chamar diretamente o Mercado Pago
 */

// ANTES - Implementação original (sem Temporal)
async function processCreditCardPaymentOriginal(payment) {
  // Cria preferência diretamente no Mercado Pago
  const mercadoPagoService = new MercadoPagoService();
  const preference = await mercadoPagoService.createPreference(payment);

  return {
    payment_id: payment.id,
    preference_id: preference.id,
    init_point: preference.init_point,
    sandbox_init_point: preference.sandbox_init_point,
  };
}

// DEPOIS - Implementação com Temporal
async function processCreditCardPaymentWithTemporal(payment) {
  try {
    logger.info('Starting credit card payment workflow', { paymentId: payment.id });

    // Inicia o workflow do Temporal
    const { workflowId, runId } = await startCreditCardPaymentWorkflow({
      id: payment.id,
      cpf: payment.cpf,
      description: payment.description,
      amount: payment.amount,
      paymentMethod: payment.payment_method,
    });

    logger.info('Credit card payment workflow started', {
      paymentId: payment.id,
      workflowId,
      runId,
    });

    // Retorna informações do workflow
    return {
      payment_id: payment.id,
      workflow_id: workflowId,
      run_id: runId,
      status: 'PENDING',
      message: 'Payment workflow started successfully. Check status via workflow_id.',
    };
  } catch (error) {
    logger.error('Failed to start payment workflow', {
      error: error.message,
      stack: error.stack,
      paymentId: payment.id,
    });
    throw error;
  }
}

// Exemplo de endpoint para consultar status do workflow
async function getPaymentWorkflowStatus(workflowId) {
  try {
    const status = await getCreditCardPaymentWorkflowStatus(workflowId);

    logger.info('Payment workflow status retrieved', {
      workflowId,
      status: status.status,
    });

    return status;
  } catch (error) {
    logger.error('Failed to get workflow status', {
      error: error.message,
      stack: error.stack,
      workflowId,
    });
    throw error;
  }
}

/**
 * Como integrar no CreatePaymentService:
 *
 * 1. Importe as funções do client:
 *    import { startCreditCardPaymentWorkflow } from '../temporal/client.js';
 *
 * 2. Substitua a chamada direta ao MercadoPagoService por:
 *    const { workflowId } = await startCreditCardPaymentWorkflow(paymentData);
 *
 * 3. Retorne o workflowId junto com o payment_id para tracking
 *
 * 4. Crie um novo endpoint para consultar status do workflow:
 *    GET /payments/:paymentId/workflow-status
 *
 * 5. Use o webhook do Mercado Pago para notificações em tempo real
 *    (o workflow também faz polling como fallback)
 */

/**
 * Vantagens da integração com Temporal:
 *
 * ✅ Durabilidade: O workflow sobrevive a crashes do servidor
 * ✅ Rastreabilidade: Todos os passos ficam registrados
 * ✅ Retry automático: Activities falhadas são retentadas
 * ✅ Monitoramento: Web UI mostra status em tempo real
 * ✅ Escalabilidade: Workers podem ser adicionados conforme necessário
 * ✅ Testabilidade: Workflows podem ser testados isoladamente
 */

export { processCreditCardPaymentOriginal, processCreditCardPaymentWithTemporal, getPaymentWorkflowStatus };
