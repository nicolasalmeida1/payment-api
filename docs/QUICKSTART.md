# 🚀 Quick Start - Payment API

Guia rápido para começar a usar a API em 5 minutos.

## 1️⃣ Iniciar a API

```bash
npm start
```

A API estará disponível em: `http://localhost:3000`

## 2️⃣ Criar seu primeiro pagamento

### PIX

```bash
curl -X POST "http://localhost:3000/api/payment" \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "12345678901",
    "description": "Meu primeiro pagamento",
    "amount": 100.00,
    "payment_method": "PIX"
  }'
```

**Resposta:**

```json
{
  "success": true,
  "payment_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "PENDING",
  "qr_code": "00020126580014br.gov.bcb.pix...",
  "qr_code_image": "data:image/png;base64,..."
}
```

### Cartão de Crédito

```bash
curl -X POST "http://localhost:3000/api/payment" \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "12345678901",
    "description": "Pagamento com cartão",
    "amount": 150.00,
    "payment_method": "CREDIT_CARD"
  }'
```

**Resposta:**

```json
{
  "success": true,
  "payment_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "PENDING",
  "init_point": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=123456"
}
```

## 3️⃣ Consultar o pagamento

```bash
# Salve o payment_id da resposta anterior
PAYMENT_ID="f47ac10b-58cc-4372-a567-0e02b2c3d479"

# Busque o pagamento
curl -X GET "http://localhost:3000/api/payment/$PAYMENT_ID"
```

**Resposta:**

```json
{
  "success": true,
  "payment": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "cpf": "12345678901",
    "description": "Meu primeiro pagamento",
    "amount": "100.00",
    "payment_method": "PIX",
    "status": "PENDING",
    "created_at": "2025-11-16T10:30:00.000Z",
    "updated_at": "2025-11-16T10:30:00.000Z"
  }
}
```

## 4️⃣ Listar todos os pagamentos

```bash
curl -X GET "http://localhost:3000/api/payment?page=1&take=10"
```

**Resposta:**

```json
{
  "success": true,
  "payments": [
    {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "cpf": "12345678901",
      "description": "Meu primeiro pagamento",
      "amount": "100.00",
      "payment_method": "PIX",
      "status": "PENDING",
      "created_at": "2025-11-16T10:30:00.000Z",
      "updated_at": "2025-11-16T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "take": 10,
    "total": 1,
    "total_pages": 1
  }
}
```

## 5️⃣ Atualizar status do pagamento

```bash
curl -X PUT "http://localhost:3000/api/payment/$PAYMENT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PAID"
  }'
```

**Resposta:**

```json
{
  "success": true,
  "payment": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "cpf": "12345678901",
    "description": "Meu primeiro pagamento",
    "amount": "100.00",
    "payment_method": "PIX",
    "status": "PAID",
    "created_at": "2025-11-16T10:30:00.000Z",
    "updated_at": "2025-11-16T10:35:00.000Z"
  }
}
```

## 🎯 Próximos Passos

Agora que você já testou o básico, explore:

1. **[Exemplos Completos de CURL](API-CURL-EXAMPLES.md)** - Todos os cenários e filtros
2. **[Postman Collection](Payment-API.postman_collection.json)** - Importe e teste via Postman
3. **[Temporal Integration](../src/temporal/README.md)** - Workflows duráveis para pagamentos

## 💡 Dicas

### Filtrar pagamentos

```bash
# Por status
curl "http://localhost:3000/api/payment?status=PAID&page=1&take=10"

# Por método de pagamento
curl "http://localhost:3000/api/payment?payment_method=PIX&page=1&take=10"

# Por CPF
curl "http://localhost:3000/api/payment?cpf=12345678901&page=1&take=10"

# Combinar filtros
curl "http://localhost:3000/api/payment?cpf=12345678901&status=PAID&page=1&take=10"
```

### Usar variáveis de ambiente

```bash
# Definir uma vez
export API_URL="http://localhost:3000"
export PAYMENT_ID="f47ac10b-58cc-4372-a567-0e02b2c3d479"

# Usar em todas as requisições
curl -X GET "$API_URL/api/payment/$PAYMENT_ID"
```

### Usar jq para formatar JSON

```bash
# Instale jq primeiro (https://stedolan.github.io/jq/)
curl -X GET "$API_URL/api/payment" | jq '.'

# Extrair apenas os IDs
curl -X GET "$API_URL/api/payment" | jq '.payments[].id'

# Contar total de pagamentos
curl -X GET "$API_URL/api/payment" | jq '.pagination.total'
```

## 🐛 Resolução de Problemas

### API não responde?

```bash
# Verifique se a API está rodando
curl http://localhost:3000

# Verifique os logs
tail -f logs/app.log
```

### Erro de validação?

Verifique se:

- CPF tem 11 dígitos
- Amount é maior que 0
- Payment method é PIX ou CREDIT_CARD
- Description tem pelo menos 3 caracteres

### Payment not found?

- Verifique se o payment_id está correto
- Consulte a lista de pagamentos para verificar IDs existentes

## 📖 Documentação Completa

- [API CURL Examples](API-CURL-EXAMPLES.md) - Exemplos detalhados
- [Postman Collection](Payment-API.postman_collection.json) - Collection completa
- [README Principal](../README.md) - Visão geral do projeto
