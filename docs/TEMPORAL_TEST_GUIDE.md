# Guia de Teste - Temporal com Mercado Pago Mock

## 📋 Visão Geral

Este guia mostra como testar o sistema de pagamentos usando **Temporal** para orquestração e **Mercado Pago Mock** para simular respostas da API do Mercado Pago.

## 🎯 O que será testado

1. **Criação de pagamento** com cartão de crédito
2. **Início do workflow Temporal** para processar o pagamento
3. **Polling do status** do pagamento no Mercado Pago (mock)
4. **Atualização automática** do status do pagamento de PENDING → PAID

## 🔧 Pré-requisitos

### 1. Temporal Server

Instale e inicie o Temporal Server:

```bash
# Com Temporal CLI
temporal server start-dev

# Ou com Docker
docker run -p 7233:7233 -p 8233:8233 temporalio/auto-setup:latest
```

Verifique se está rodando:
- Temporal Server: http://localhost:7233
- Temporal UI: http://localhost:8233

### 2. Banco de Dados

Certifique-se de que o PostgreSQL está rodando e as migrations foram aplicadas:

```bash
npm run migrate:latest
```

### 3. Variáveis de Ambiente

O arquivo `.env` já está configurado com:

```env
USE_TEMPORAL_WORKFLOW=true
USE_MERCADO_PAGO_MOCK=true
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default
```

## 🚀 Como Executar

### Passo 1: Iniciar o Temporal Worker

Em um terminal, execute:

```bash
npm run worker
```

Você deve ver logs indicando que o worker está conectado:
```
[TemporalWorker] Worker started successfully
[TemporalWorker] Listening on task queue: payment-queue
```

### Passo 2: Iniciar a API

Em outro terminal, execute:

```bash
npm start
```

A API deve iniciar na porta 3000.

### Passo 3: Executar o Script de Teste

Em um terceiro terminal, execute:

```bash
chmod +x scripts/test-temporal.sh
./scripts/test-temporal.sh
```

## 📊 O que acontece durante o teste

### 1. Criação do Pagamento (API)

```json
POST /api/payment
{
  "cpf": "12345678901",
  "description": "Teste Temporal - Pagamento com Cartão",
  "amount": 299.90,
  "paymentMethod": "CREDIT_CARD"
}
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-do-pagamento",
    "status": "PENDING",
    ...
  },
  "workflow": {
    "workflowId": "credit-card-payment-uuid",
    "runId": "run-id"
  }
}
```

### 2. Workflow Temporal (Background)

O workflow executa as seguintes activities:

#### Activity 1: Create Payment Record
- Cria o registro no banco de dados
- Status inicial: `PENDING`

#### Activity 2: Create Mercado Pago Preference (Mock)
- **Mock retorna:**
```json
{
  "id": "pref-mock-12345678",
  "init_point": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=pref-mock-12345678",
  "sandbox_init_point": "https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=pref-mock-12345678"
}
```

#### Activity 3: Check Payment Status (Loop)

O workflow faz polling a cada 3 segundos com backoff exponencial:

**Primeira chamada (t=3s):**
```json
{
  "id": "payment-id",
  "status": "pending",
  "status_detail": "pending_contingency"
}
```
- ⏳ Status ainda PENDING, continua no loop

**Segunda chamada (t=6s):**
```json
{
  "id": "payment-id",
  "status": "approved",
  "status_detail": "accredited"
}
```
- ✅ Status mudou para APPROVED!

#### Activity 4: Update Payment Status
- Atualiza o pagamento no banco para `PAID`
- Cria histórico de mudança de status

### 3. Verificação (Script)

Após 15 segundos, o script consulta o status:

```bash
GET /api/payment/{id}
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-do-pagamento",
    "status": "PAID",
    "amount": 299.90,
    ...
  }
}
```

## 🔍 Logs para Monitorar

### Logs do Worker

```
[PaymentActivities] Creating payment record in database
[PaymentActivities] Creating Mercado Pago preference
[MercadoPagoMockService] [MOCK] Creating Mercado Pago preference
[MercadoPagoMockService] [MOCK] Preference created successfully
[PaymentActivities] Checking payment status on Mercado Pago
[MercadoPagoMockService] [MOCK] Payment status - callNumber: 1, status: pending
[PaymentActivities] Checking payment status on Mercado Pago
[MercadoPagoMockService] [MOCK] Payment status - callNumber: 2, status: approved
[PaymentActivities] Updating payment status
[PaymentActivities] Payment status updated successfully
```

### Logs da API

```
[CreatePaymentService] Creating payment
[CreatePaymentService] Payment created successfully
[CreatePaymentService] Starting Temporal workflow for credit card payment
[TemporalClient] Credit card payment workflow started
```

## 🧪 Testes Manuais

### Teste 1: Verificar Status no Meio do Processo

```bash
# Durante o workflow, consulte o status
curl http://localhost:3000/api/payment/{payment-id} | jq '.data.status'

# Deve retornar "PENDING" inicialmente
# Após 6-9 segundos, deve retornar "PAID"
```

### Teste 2: Verificar Histórico

```bash
# Consulte o histórico do pagamento
curl http://localhost:3000/api/payment/{payment-id} | jq '.data'

# Deve mostrar eventos:
# - PAYMENT_CREATED
# - STATUS_CHANGED (PENDING → PAID)
```

### Teste 3: Múltiplos Pagamentos

Execute o teste várias vezes para garantir que o mock está funcionando corretamente:

```bash
for i in {1..3}; do
  echo "Teste $i"
  ./scripts/test-temporal.sh
  sleep 20
done
```

## 🐛 Troubleshooting

### Erro: "Failed to connect Temporal client"

**Solução:** Verifique se o Temporal Server está rodando:
```bash
temporal server start-dev
```

### Erro: "Worker not found"

**Solução:** Certifique-se de que o worker está rodando:
```bash
npm run worker
```

### Workflow não atualiza o status

**Verificações:**
1. Worker está conectado?
2. Logs do worker mostram erros?
3. Temporal UI mostra o workflow em execução?

```bash
# Acesse a Temporal UI
open http://localhost:8233
```

### Mock não está sendo usado

**Verificação:** Confirme as variáveis de ambiente:
```bash
grep "USE_MERCADO_PAGO_MOCK" .env
# Deve retornar: USE_MERCADO_PAGO_MOCK=true
```

## 📝 Notas Importantes

1. **Delays do Mock:**
   - createPreference: 500ms
   - getPayment: 300ms

2. **Polling do Workflow:**
   - Intervalo inicial: 3 segundos
   - Backoff: 1.2x (exponencial)
   - Máximo de tentativas: 20

3. **Comportamento do Mock:**
   - **Primeira chamada:** status `pending`
   - **Segunda+ chamadas:** status `approved`

4. **Reset do Mock:**
   O contador de chamadas é mantido em memória no worker. Se precisar resetar, reinicie o worker.

## ✅ Resultado Esperado

Ao final do teste, você deve ter:

- ✅ Pagamento criado com status PENDING
- ✅ Workflow Temporal iniciado
- ✅ Preferência do Mercado Pago (mock) criada
- ✅ Status verificado 2 vezes (pending → approved)
- ✅ Status do pagamento atualizado para PAID
- ✅ Histórico de eventos registrado

## 🎓 Próximos Passos

Após validar o funcionamento com mock:

1. Configure credenciais reais do Mercado Pago
2. Desabilite o mock: `USE_MERCADO_PAGO_MOCK=false`
3. Teste com preferências reais
4. Implemente tratamento de webhook para atualizações em tempo real
