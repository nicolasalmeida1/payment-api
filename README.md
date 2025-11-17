# payment-api

API de pagamentos com integração Mercado Pago e orquestração via Temporal.io

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Fastify** - Framework web de alta performance
- **PostgreSQL** - Banco de dados relacional
- **Objection.js** - ORM para Node.js
- **Temporal.io** - Orquestração de workflows duráveis
- **Mercado Pago** - Gateway de pagamento
- **Jest** - Framework de testes

## 📋 Pré-requisitos

- Node.js >= 18
- PostgreSQL >= 14
- Temporal CLI (para desenvolvimento)

## 🔧 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Executar migrations
npm run migrate:up
```

## 🏃 Executando

### API REST

```bash
npm start
```

### Temporal Server (Desenvolvimento)

```bash
npm run temporal:dev
```

### Temporal Worker

```bash
npm run temporal:worker
```

### Testar API

```bash
# Executar suite completa de testes da API
chmod +x scripts/test-api.sh
./scripts/test-api.sh

# Modo verbose (mostra responses completos)
VERBOSE=true ./scripts/test-api.sh

# Testar em ambiente diferente
API_URL=https://staging.api.com ./scripts/test-api.sh
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar com watch mode
npm test:watch

# Executar com coverage
npm test:coverage
```

## 📚 Documentação

### 🚀 Quick Start

- **[Quick Start Guide](docs/QUICKSTART.md)** - Comece em 5 minutos!

### ⚙️ Advanced

- **[Temporal Integration](src/temporal/README.md)** - Documentação completa do Temporal.io
- **[Temporal Testing](src/temporal/TESTING.md)** - Guia de testes do Temporal

## 🏗️ Arquitetura

Este projeto segue os princípios de **Clean Architecture**:

```
src/
├── config/          # Configurações
├── db/              # Database (migrations, models, connection)
├── domain/          # Lógica de negócio (commands, services, enums)
├── infrastructure/  # Infraestrutura (repositories, external services)
└── temporal/        # Workflows e activities do Temporal.io
```

## 🔐 Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/payment_db

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=your_token_here

# Temporal
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default
```

## 📊 Status

- ✅ CRUD de pagamentos
- ✅ Integração Mercado Pago
- ✅ Webhooks
- ✅ Temporal.io workflows
- ✅ 164 testes passando
- ✅ 100% coverage em serviços críticos
