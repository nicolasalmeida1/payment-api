# Logger

Classe utilitária para gerenciar logs estruturados na aplicação.

## Características

- **Logs estruturados em JSON** com timestamp, level, context e metadata
- **Níveis de log configuráveis** (debug, info, warn, error)
- **Filtro por nível de log** via variável de ambiente
- **Contexto configurável** para identificar a origem dos logs
- **Metadata personalizado** para cada log

## Configuração

Configure o nível de log através da variável de ambiente `LOG_LEVEL` no arquivo `.env`:

```bash
# Níveis disponíveis: debug, info, warn, error
# Padrão: info
LOG_LEVEL=info
```

### Hierarquia de Níveis

1. **debug** (0) - Exibe todos os logs
2. **info** (1) - Exibe info, warn e error
3. **warn** (2) - Exibe warn e error
4. **error** (3) - Exibe apenas error

## Uso Básico

```javascript
import Logger from '../infrastructure/logger/logger.js';

class MyService {
  constructor() {
    // Usa this.constructor.name para pegar o nome da classe automaticamente
    this.logger = new Logger(this.constructor.name);
  }

  async execute() {
    this.logger.info('Starting operation');

    try {
      // sua lógica
      this.logger.debug('Operation details', { data: 'some data' });
      this.logger.info('Operation completed successfully');
    } catch (error) {
      this.logger.error('Operation failed', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
```

## Métodos

### `debug(message, meta = {})`

Loga mensagens de debug para desenvolvimento e troubleshooting detalhado.

```javascript
logger.debug('User data fetched', { userId: '123', count: 5 });
```

### `info(message, meta = {})`

Loga informações importantes do fluxo da aplicação.

```javascript
logger.info('Payment created', { paymentId: 'abc-123', amount: 100.5 });
```

### `warn(message, meta = {})`

Loga avisos que não impedem a execução mas requerem atenção.

```javascript
logger.warn('Invalid cache key', { key: 'expired-key' });
```

### `error(message, meta = {})`

Loga erros e exceções.

```javascript
logger.error('Database connection failed', {
  error: error.message,
  stack: error.stack,
  host: 'localhost',
});
```

### `setContext(context)`

Atualiza o contexto do logger dinamicamente.

```javascript
const logger = new Logger('InitialService');
logger.setContext('UpdatedService');
```

## Formato de Saída

Todos os logs são estruturados em JSON:

```json
{
  "timestamp": "2025-11-16T10:30:45.123Z",
  "level": "INFO",
  "context": "CreatePaymentService",
  "message": "Payment created successfully",
  "paymentId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 100.5
}
```

## Benefícios

1. **Centralização**: Um único ponto para gerenciar todos os logs
2. **Testabilidade**: Fácil de mockar em testes unitários
3. **Flexibilidade**: Fácil migrar para outras bibliotecas (Winston, Pino, etc)
4. **Estruturação**: Logs em JSON facilitam parsing e análise
5. **Contextualização**: Identificação clara da origem dos logs
6. **Rastreabilidade**: Metadata rica para debugging

## Exemplo Completo

```javascript
import Logger from '../../infrastructure/logger/logger.js';

export default class CreatePaymentService {
  constructor({ paymentRepository, paymentHistoryRepository }) {
    this.paymentRepository = paymentRepository;
    this.paymentHistoryRepository = paymentHistoryRepository;
    this.logger = new Logger(this.constructor.name);
  }

  async execute(validatedData) {
    this.logger.info('Creating payment', {
      paymentId: validatedData.id,
      cpf: validatedData.cpf,
      amount: validatedData.amount,
    });

    try {
      const payment = await this.paymentRepository.createWithHistory(
        paymentData,
        historyData,
        this.paymentHistoryRepository,
      );

      this.logger.info('Payment created successfully', {
        paymentId: payment.id,
      });

      return {
        success: true,
        data: payment,
      };
    } catch (error) {
      this.logger.error('Error creating payment', {
        error: error.message,
        stack: error.stack,
        paymentId: validatedData.id,
      });
      throw error;
    }
  }
}
```

## Testes

Para testar código que usa o Logger, basta mockar a instância:

```javascript
import { jest } from '@jest/globals';
import MyService from './my-service.js';

describe('MyService', () => {
  let service;

  beforeEach(() => {
    service = new MyService();

    // Mock logger
    service.logger = {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    };
  });

  it('should log success', async () => {
    await service.execute();

    expect(service.logger.info).toHaveBeenCalledWith('Operation completed', {
      someData: 'value',
    });
  });
});
```
