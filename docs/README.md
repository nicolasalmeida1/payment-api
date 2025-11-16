# Payment API - Documentação JSDoc

Esta pasta contém a documentação JSDoc gerada automaticamente do código-fonte da Payment API.

## 📚 Visão Geral

A documentação foi gerada a partir dos comentários JSDoc presentes no código-fonte e inclui:

- **Tipos globais**: Definições TypeScript-style em `global.d.ts`
- **Classes e Métodos**: Documentação completa de todas as classes
- **Parâmetros e Retornos**: Tipos detalhados de entrada e saída
- **Exemplos**: Casos de uso quando aplicável

## 🏗️ Estrutura da API

### Domain Layer (Domínio)
- **Commands**: Implementação do padrão Command
  - `CreatePaymentCommand`
  - `UpdatePaymentCommand`
  - `GetPaymentByIdCommand`
  - `ListPaymentsCommand`
  - `ProcessMercadoPagoWebhookCommand`

- **Services**: Lógica de negócio
  - `CreatePaymentService`
  - `UpdatePaymentService`
  - `GetPaymentByIdService`
  - `ListPaymentsService`
  - `ProcessMercadoPagoWebhookService`

- **Errors**: Erros customizados do domínio
  - `DomainError`
  - `PaymentNotFoundError`
  - `ValidationError`
  - `PaymentAlreadyPaidError`

### Infrastructure Layer (Infraestrutura)
- **Repositories**: Acesso a dados
  - `BaseRepository`
  - `PaymentRepository`
  - `PaymentHistoryRepository`

- **Services**: Serviços externos
  - `MercadoPagoService`
  - `MercadoPagoMockService`

- **Factories**: Injeção de dependências
  - Factories para criação de Commands

- **Logger**: Sistema de logging estruturado
  - `Logger`

### Temporal Layer (Orquestração)
- **Client**: Cliente Temporal
  - `getTemporalClient()`
  - `startCreditCardPaymentWorkflow()`
  - `getCreditCardPaymentWorkflowResult()`
  - `getCreditCardPaymentWorkflowStatus()`

- **Workflows**: Workflows Temporal
  - `creditCardPaymentWorkflow`

- **Activities**: Activities Temporal
  - `createPaymentRecord()`
  - `createMercadoPagoPreference()`
  - `checkPaymentStatus()`
  - `updatePaymentStatus()`
  - `mapMercadoPagoStatusToPaymentStatus()`

- **Worker**: Temporal Worker
  - `createWorker()`
  - `runWorker()`

## 📖 Como Usar a Documentação

### Gerar a Documentação

```bash
npm run docs
```

### Visualizar a Documentação

```bash
npm run docs:serve
```

Acesse: http://localhost:8080

## 🔍 Tipos Principais

### Payment
```javascript
/**
 * @typedef {Object} Payment
 * @property {string} id - UUID do pagamento
 * @property {string} cpf - CPF do cliente (11 dígitos)
 * @property {string} description - Descrição do pagamento
 * @property {number} amount - Valor do pagamento em BRL
 * @property {PaymentMethodType} payment_method - Método de pagamento
 * @property {PaymentStatusType} status - Status do pagamento
 */
```

### CreatePaymentInput
```javascript
/**
 * @typedef {Object} CreatePaymentInput
 * @property {string} cpf - CPF do cliente
 * @property {string} description - Descrição
 * @property {number} amount - Valor
 * @property {PaymentMethodType} paymentMethod - Método
 */
```

### ServiceResponse
```javascript
/**
 * @typedef {Object} ServiceResponse
 * @property {boolean} success - Status de sucesso
 * @property {*} [data] - Dados da resposta
 * @property {string} [message] - Mensagem
 * @property {string} [error] - Mensagem de erro
 */
```

## 🎯 Convenções de Documentação

### Classes
Todas as classes incluem:
- Descrição do propósito
- Documentação do construtor
- Parâmetros de entrada tipados
- Valores de retorno tipados

### Métodos
Todos os métodos incluem:
- Descrição funcional
- `@param` para cada parâmetro
- `@returns` com tipo de retorno
- `@throws` quando aplicável

### Tipos
Definidos em `global.d.ts`:
- Enums como union types
- Objetos de domínio
- DTOs (Data Transfer Objects)
- Responses de serviços

## 🚀 Exemplos de Uso

### Criar um Pagamento

```javascript
const factory = CreatePaymentCommandFactory.create();
const result = await factory.execute({
  cpf: '12345678901',
  description: 'Pagamento teste',
  amount: 100.50,
  paymentMethod: 'CREDIT_CARD'
});
```

### Buscar um Pagamento

```javascript
const factory = GetPaymentByIdCommandFactory.create();
const result = await factory.execute('payment-uuid');
```

### Iniciar Workflow Temporal

```javascript
const workflow = await startCreditCardPaymentWorkflow({
  id: 'payment-uuid',
  cpf: '12345678901',
  description: 'Pagamento teste',
  amount: 100.50,
  paymentMethod: 'CREDIT_CARD'
});
```

## 📝 Notas Adicionais

- A documentação é regenerada a cada execução de `npm run docs`
- Tipos são referenciados do arquivo `global.d.ts`
- JSDoc suporta sintaxe TypeScript para tipos
- Documentação gerada em `docs/jsdoc/`

## 🔗 Links Úteis

- [JSDoc Documentation](https://jsdoc.app/)
- [TypeScript JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [Temporal.io Documentation](https://docs.temporal.io/)

---

**Última atualização**: Automaticamente gerada pelo JSDoc
