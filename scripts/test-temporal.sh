#!/bin/bash

# Script para testar Temporal com Mercado Pago Mock
# Execute: chmod +x scripts/test-temporal.sh && ./scripts/test-temporal.sh

echo "🚀 Iniciando teste do Temporal com Mercado Pago Mock"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📋 Pré-requisitos:${NC}"
echo "1. Temporal Server rodando em localhost:7233"
echo "2. Temporal Worker rodando (npm run worker)"
echo "3. API rodando em localhost:3000"
echo ""

echo -e "${YELLOW}⏳ Aguardando 2 segundos...${NC}"
sleep 2

echo -e "${BLUE}📤 Criando pagamento com cartão de crédito...${NC}"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/payment \
  -H "Content-Type: application/json" \
  -d '{"cpf":"12345678901","description":"Teste Temporal - Pagamento com Cartao","amount":299.90,"paymentMethod":"CREDIT_CARD"}')

echo "$RESPONSE"
echo ""

# Extrair payment_id e workflow_id sem jq
PAYMENT_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"\([^"]*\)"/\1/')
WORKFLOW_ID=$(echo "$RESPONSE" | grep -o '"workflowId":"[^"]*"' | sed 's/"workflowId":"\([^"]*\)"/\1/')

if [[ -z "$PAYMENT_ID" ]]; then
  echo -e "${RED}❌ Erro ao criar pagamento${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Pagamento criado com sucesso!${NC}"
echo -e "   Payment ID: ${YELLOW}$PAYMENT_ID${NC}"
echo -e "   Workflow ID: ${YELLOW}$WORKFLOW_ID${NC}"
echo ""

echo -e "${BLUE}⏱️  Aguardando processamento do workflow...${NC}"
echo "   O Temporal Workflow está fazendo:"
echo "   1. Criar preferência no Mercado Pago (mock)"
echo "   2. Polling do status a cada 3s (com backoff exponencial)"
echo "   3. 1ª verificação: pending → aguarda"
echo "   4. 2ª verificação: approved → atualiza para PAID"
echo ""
echo -e "${YELLOW}⏳ Aguardando 10 segundos para o workflow processar...${NC}"
sleep 10

echo ""
echo -e "${BLUE}🔍 Verificando status final do pagamento...${NC}"
PAYMENT_STATUS=$(curl -s -X GET "http://localhost:3000/api/payment/$PAYMENT_ID")
echo "$PAYMENT_STATUS"
echo ""

# Extrair status final
FINAL_STATUS=$(echo "$PAYMENT_STATUS" | grep -o '"status":"[^"]*"' | head -1 | sed 's/"status":"\([^"]*\)"/\1/')

if [[ "$FINAL_STATUS" == "PAID" ]]; then
  echo -e "${GREEN}✅ Teste concluído com sucesso!${NC}"
  echo -e "   Status final: ${GREEN}PAID${NC}"
  echo -e "   ✨ O workflow Temporal processou o pagamento corretamente!"
elif [[ "$FINAL_STATUS" == "PENDING" ]]; then
  echo -e "${YELLOW}⚠️  Status ainda PENDING após 10 segundos${NC}"
  echo "   Possíveis causas:"
  echo "   - Worker não está rodando"
  echo "   - Workflow está demorando mais que o esperado"
  echo "   - Verifique os logs do worker para mais detalhes"
  echo ""
  echo -e "${BLUE}💡 Dica: Espere mais alguns segundos e verifique novamente:${NC}"
  echo "   curl -s http://localhost:3000/api/payment/$PAYMENT_ID | grep status"
else
  echo -e "${YELLOW}⚠️  Status inesperado: $FINAL_STATUS${NC}"
  echo "   Esperado: PAID"
fi

echo ""
echo -e "${BLUE}📊 Logs sugeridos para verificar:${NC}"
echo "   - API logs: logs da requisição e criação do workflow"
echo "   - Worker logs: execução do workflow e activities"
echo "   - Temporal UI: http://localhost:8233 (se disponível)"
