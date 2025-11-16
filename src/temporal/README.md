# Temporal.io Integration

Este projeto usa Temporal.io para orquestrar workflows duráveis de pagamento com cartão de crédito.

## 📋 Pré-requisitos

- Temporal CLI instalado e no PATH
- Servidor Temporal rodando localmente ou remotamente

## 🚀 Iniciando o Servidor Temporal

### Desenvolvimento Local

```bash
# Inicia o servidor Temporal em modo desenvolvimento
npm run temporal:dev
```

O servidor estará disponível em:

- Temporal Server: `localhost:7233`
- Temporal Web UI: `http://localhost:8233`

## 🔧 Iniciando o Worker

O Worker processa os workflows e activities. Deve estar rodando para executar workflows.

```bash
# Em um terminal separado
npm run temporal:worker
```

## 📚 Estrutura

```
src/temporal/
├── activities/
│   └── payment.activities.js    # Activities para operações de DB e API
├── workflows/
│   └── credit-card-payment.workflow.js  # Workflow de pagamento
├── client.js                    # Cliente para iniciar workflows
├── worker.js                    # Worker que processa workflows
└── start-worker.js             # Script de inicialização
```

## 🔄 Como Funciona

### 1. Activities (payment.activities.js)

Activities são funções que realizam operações externas:

- `createPaymentRecord()` - Cria registro do pagamento no DB
- `createMercadoPagoPreference()` - Cria preferência no Mercado Pago
- `checkPaymentStatus()` - Consulta status no Mercado Pago
- `updatePaymentStatus()` - Atualiza status do pagamento no DB
- `mapMercadoPagoStatusToPaymentStatus()` - Mapeia status do MP para nosso status

### 2. Workflow (credit-card-payment.workflow.js)

O workflow orquestra o processo completo de pagamento:

1. Cria registro do pagamento com status PENDING
2. Cria preferência no Mercado Pago
3. Aguarda processamento (polling com backoff exponencial)
4. Atualiza status para PAID ou FAIL
5. Retorna resultado final

**Características importantes:**

- **Durável**: Sobrevive a crashes do servidor
- **Retentável**: Activities têm retry policy automático
- **Observável**: Pode ser monitorado via Temporal Web UI
- **Testável**: Workflows podem ser testados isoladamente

### 3. Client (client.js)

Cliente para interagir com workflows:

- `getTemporalClient()` - Obtém cliente singleton
- `startCreditCardPaymentWorkflow()` - Inicia workflow de pagamento
- `getCreditCardPaymentWorkflowResult()` - Obtém resultado do workflow
- `getCreditCardPaymentWorkflowStatus()` - Consulta status do workflow

### 4. Worker (worker.js)

Worker que processa workflows e activities:

- Conecta ao servidor Temporal
- Registra workflows e activities
- Processa tasks da fila `payment-queue`

## 🔌 Integração com a API

Para integrar o Temporal com o serviço de pagamento existente:

```javascript
import { startCreditCardPaymentWorkflow } from './temporal/client.js';

// No CreatePaymentService
async processCreditCardPayment(payment) {
  const { workflowId } = await startCreditCardPaymentWorkflow({
    id: payment.id,
    cpf: payment.cpf,
    description: payment.description,
    amount: payment.amount,
    paymentMethod: payment.payment_method,
  });

  return {
    payment_id: payment.id,
    workflow_id: workflowId,
    status: 'PENDING',
  };
}
```

## 📊 Monitoramento

Acesse a Web UI do Temporal em `http://localhost:8233` para:

- Ver workflows em execução
- Consultar histórico de execuções
- Visualizar detalhes de cada workflow
- Ver activities executadas
- Analisar erros e retentativas

## ⚙️ Configuração

Variáveis de ambiente disponíveis:

```bash
TEMPORAL_ADDRESS=localhost:7233  # Endereço do servidor Temporal
TEMPORAL_NAMESPACE=default       # Namespace do Temporal
```

## 🧪 Benefícios do Temporal

1. **Durabilidade**: Workflows sobrevivem a crashes e reinicializações
2. **Confiabilidade**: Retry automático de activities falhadas
3. **Visibilidade**: Monitoramento completo via Web UI
4. **Escalabilidade**: Workers podem ser escalados horizontalmente
5. **Testabilidade**: Workflows e activities podem ser testados isoladamente
6. **Manutenibilidade**: Código de orquestração separado da lógica de negócio

## 🔒 Segurança

- O Temporal armazena o estado dos workflows de forma segura
- Activities são executadas de forma isolada
- Retry policy evita perda de dados em caso de falhas temporárias
- Transações garantem consistência no banco de dados

## 📖 Documentação Adicional

- [Temporal Documentation](https://docs.temporal.io/)
- [Node.js SDK](https://docs.temporal.io/dev-guide/typescript)
- [Best Practices](https://docs.temporal.io/kb/best-practices)
