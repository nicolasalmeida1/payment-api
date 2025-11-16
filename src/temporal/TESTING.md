# Guia de Teste do Temporal.io

Este guia mostra como testar a integração do Temporal.io passo a passo.

## 📝 Pré-requisitos

1. PostgreSQL rodando
2. Migrations executadas (`npm run migrate:up`)
3. Temporal CLI instalado

## 🧪 Teste Passo a Passo

### 1. Iniciar o Servidor Temporal

```bash
# Terminal 1
npm run temporal:dev
```

Aguarde até ver a mensagem:

```
Temporal server is running on http://localhost:8233
```

### 2. Iniciar o Worker

```bash
# Terminal 2
npm run temporal:worker
```

Aguarde até ver:

```
🚀 Starting Temporal Worker for payment processing...
Temporal worker created successfully
```

### 3. Testar Workflow Manualmente

Você pode testar o workflow de duas formas:

#### Opção A: Via Node.js REPL

```bash
# Terminal 3
node
```

```javascript
// No REPL do Node
import { startCreditCardPaymentWorkflow, getCreditCardPaymentWorkflowStatus } from './src/temporal/client.js';

// Dados de teste
const paymentData = {
  id: crypto.randomUUID(),
  cpf: '12345678901',
  description: 'Teste de pagamento com Temporal',
  amount: 100.0,
  paymentMethod: 'CREDIT_CARD',
};

// Iniciar workflow
const result = await startCreditCardPaymentWorkflow(paymentData);
console.log('Workflow iniciado:', result);

// Consultar status (após alguns segundos)
const status = await getCreditCardPaymentWorkflowStatus(result.workflowId);
console.log('Status:', status);
```

#### Opção B: Via Temporal CLI

```bash
# Iniciar workflow via CLI
temporal workflow start \
  --type creditCardPaymentWorkflow \
  --task-queue payment-queue \
  --workflow-id test-payment-123 \
  --input '{"id":"test-123","cpf":"12345678901","description":"Test","amount":100,"paymentMethod":"CREDIT_CARD"}'

# Consultar status
temporal workflow describe --workflow-id test-payment-123

# Ver execução em tempo real
temporal workflow show --workflow-id test-payment-123
```

### 4. Monitorar via Web UI

1. Abra http://localhost:8233 no navegador
2. Você verá o workflow em execução
3. Clique no workflow para ver detalhes:
   - Timeline de execução
   - Activities executadas
   - Eventos do workflow
   - Stack trace (se houver erro)

### 5. Verificar no Banco de Dados

```bash
# Conectar ao PostgreSQL
psql -U seu_usuario -d payment_db

# Verificar pagamento criado
SELECT * FROM payments WHERE id = 'seu-payment-id';

# Verificar histórico
SELECT * FROM payment_history WHERE payment_id = 'seu-payment-id';
```

## 🔍 Verificações Importantes

### ✅ Worker está processando workflows?

No terminal do worker, você deve ver logs como:

```
Temporal worker created successfully
Starting Temporal worker...
```

### ✅ Workflow está sendo executado?

Na Web UI, o workflow deve aparecer com status:

- `Running` - Em execução
- `Completed` - Finalizado com sucesso
- `Failed` - Falhou (veja os detalhes do erro)

### ✅ Activities estão sendo chamadas?

Na Web UI, na aba "Activities", você deve ver:

- `createPaymentRecord` - Criação do pagamento
- `createMercadoPagoPreference` - Criação da preferência
- `checkPaymentStatus` - Verificações de status (múltiplas)
- `updatePaymentStatus` - Atualização final

### ✅ Banco de dados foi atualizado?

Verifique se:

- Registro existe na tabela `payments` com status inicial `PENDING`
- Existe entrada na `payment_history` para criação
- Status foi atualizado para `PAID` ou `FAIL` após processamento

## 🐛 Troubleshooting

### Erro: "Connection refused to localhost:7233"

**Problema**: Servidor Temporal não está rodando

**Solução**:

```bash
npm run temporal:dev
```

### Erro: "No registered workers for task queue"

**Problema**: Worker não está rodando

**Solução**:

```bash
npm run temporal:worker
```

### Erro: "Cannot find module '@temporalio/...'"

**Problema**: Dependências não instaladas

**Solução**:

```bash
npm install
```

### Workflow fica em "Running" para sempre

**Possíveis causas**:

1. Mercado Pago API não está respondendo (esperado em dev)
2. Configuração de timeout muito alta
3. Activities travando

**Como verificar**:

1. Veja os logs do worker
2. Verifique a Web UI para ver qual activity está travada
3. Veja os logs de erro nas activities

### Activities falhando com retry

**Comportamento esperado**: Activities têm retry automático (3 tentativas)

**Como ver**:

1. Na Web UI, vá até o workflow
2. Clique na activity que falhou
3. Veja os "Retry Attempts" e o erro

## 📊 Métricas e Observabilidade

### Temporal Web UI (http://localhost:8233)

1. **Workflows**: Lista todos os workflows
2. **Task Queues**: Mostra workers conectados
3. **Archival**: Histórico de workflows completos

### Logs do Worker

O worker loga:

- Início de workflows
- Execução de activities
- Erros e retries
- Conclusão de workflows

### Logs das Activities

As activities logam:

- Operações de banco de dados
- Chamadas à API do Mercado Pago
- Erros e exceções

## 🎯 Próximos Passos

Após validar o Temporal:

1. ✅ Integrar com `CreatePaymentService`
2. ✅ Adicionar endpoint para consultar status do workflow
3. ✅ Criar testes automatizados para workflows
4. ✅ Configurar Temporal em produção (Temporal Cloud ou self-hosted)
5. ✅ Adicionar métricas e alertas

## 📚 Recursos Adicionais

- [Temporal Docs](https://docs.temporal.io/)
- [Node.js SDK](https://docs.temporal.io/dev-guide/typescript)
- [Testing Workflows](https://docs.temporal.io/dev-guide/typescript/testing)
- [Production Deployment](https://docs.temporal.io/cluster-deployment-guide)
