#!/bin/bash

# =========================================
# Payment API - Complete Test Script
# =========================================
# Este script testa todos os endpoints da API
# Execute: chmod +x test-api.sh && ./test-api.sh
# =========================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuração
API_URL="${API_URL:-http://localhost:3000}"
VERBOSE="${VERBOSE:-false}"

# Contadores
TESTS_PASSED=0
TESTS_FAILED=0

# Função para extrair valores JSON sem jq
json_extract() {
    local json="$1"
    local key="$2"
    echo "$json" | grep -o "\"$key\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | sed 's/.*"\([^"]*\)"$/\1/' | head -1
}

json_extract_bool() {
    local json="$1"
    local key="$2"
    echo "$json" | grep -o "\"$key\"[[:space:]]*:[[:space:]]*[a-z]*" | sed 's/.*:[[:space:]]*//' | head -1
}

json_extract_number() {
    local json="$1"
    local key="$2"
    echo "$json" | grep -o "\"$key\"[[:space:]]*:[[:space:]]*[0-9]*" | sed 's/.*:[[:space:]]*//' | head -1
}

# Funções auxiliares
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_test() {
    echo -e "${YELLOW}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((TESTS_PASSED++))
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    ((TESTS_FAILED++))
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Verificar se a API está rodando
check_api() {
    print_header "Verificando API"
    if curl -s -f "$API_URL" > /dev/null 2>&1; then
        print_success "API está respondendo em $API_URL"
    else
        print_error "API não está respondendo em $API_URL"
        print_info "Execute: npm start"
        exit 1
    fi
    echo ""
}

# Teste 1: Criar pagamento PIX
test_create_pix() {
    print_header "Teste 1: Criar Pagamento PIX"
    
    local response=$(curl -s -X POST "$API_URL/api/payment" \
        -H "Content-Type: application/json" \
        -d '{
            "cpf": "12345678901",
            "description": "Teste de pagamento PIX",
            "amount": 150.50,
            "payment_method": "PIX"
        }')
    
    if [[ $VERBOSE == "true" ]]; then
        echo "$response"
    fi
    
    local success=$(json_extract_bool "$response" "success")
    PAYMENT_ID_PIX=$(json_extract "$response" "payment_id")
    
    if [[ "$success" == "true" ]] && [[ -n "$PAYMENT_ID_PIX" ]] && [[ "$PAYMENT_ID_PIX" != "" ]]; then
        print_success "Pagamento PIX criado com ID: $PAYMENT_ID_PIX"
    else
        print_error "Falha ao criar pagamento PIX"
    fi
    echo ""
}

# Teste 2: Criar pagamento Cartão de Crédito
test_create_credit_card() {
    print_header "Teste 2: Criar Pagamento Cartão de Crédito"
    
    local response=$(curl -s -X POST "$API_URL/api/payment" \
        -H "Content-Type: application/json" \
        -d '{
            "cpf": "98765432100",
            "description": "Teste de pagamento Cartão",
            "amount": 250.75,
            "payment_method": "CREDIT_CARD"
        }')
    
    if [[ $VERBOSE == "true" ]]; then
        echo "$response"
    fi
    
    local success=$(json_extract_bool "$response" "success")
    PAYMENT_ID_CC=$(json_extract "$response" "payment_id")
    
    if [[ "$success" == "true" ]] && [[ -n "$PAYMENT_ID_CC" ]] && [[ "$PAYMENT_ID_CC" != "" ]]; then
        print_success "Pagamento Cartão criado com ID: $PAYMENT_ID_CC"
    else
        print_error "Falha ao criar pagamento Cartão"
    fi
    echo ""
}

# Teste 3: Buscar pagamento por ID
test_get_payment() {
    print_header "Teste 3: Buscar Pagamento por ID"
    
    local response=$(curl -s -X GET "$API_URL/api/payment/$PAYMENT_ID_PIX")
    
    if [[ $VERBOSE == "true" ]]; then
        echo "$response"
    fi
    
    local success=$(json_extract_bool "$response" "success")
    
    if [[ "$success" == "true" ]] && echo "$response" | grep -q "$PAYMENT_ID_PIX"; then
        print_success "Pagamento encontrado com sucesso"
    else
        print_error "Falha ao buscar pagamento"
    fi
    echo ""
}

# Teste 4: Listar todos os pagamentos
test_list_payments() {
    print_header "Teste 4: Listar Pagamentos"
    
    local response=$(curl -s -X GET "$API_URL/api/payment?page=1&take=10")
    
    if [[ $VERBOSE == "true" ]]; then
        echo "$response"
    fi
    
    local success=$(json_extract_bool "$response" "success")
    local total=$(json_extract_number "$response" "total")
    
    if [[ "$success" == "true" ]] && [[ -n "$total" ]]; then
        print_success "Lista de pagamentos recuperada (Total: $total)"
    else
        print_error "Falha ao listar pagamentos"
    fi
    echo ""
}

# Teste 5: Filtrar por status
test_filter_by_status() {
    print_header "Teste 5: Filtrar por Status PENDING"
    
    local response=$(curl -s -X GET "$API_URL/api/payment?status=PENDING&page=1&take=10")
    
    if [[ $VERBOSE == "true" ]]; then
        echo "$response"
    fi
    
    local success=$(json_extract_bool "$response" "success")
    
    if [[ "$success" == "true" ]]; then
        print_success "Filtragem por status funcionando"
    else
        print_error "Falha ao filtrar por status"
    fi
    echo ""
}

# Teste 6: Filtrar por método de pagamento
test_filter_by_method() {
    print_header "Teste 6: Filtrar por Método PIX"
    
    local response=$(curl -s -X GET "$API_URL/api/payment?payment_method=PIX&page=1&take=10")
    
    if [[ $VERBOSE == "true" ]]; then
        echo "$response"
    fi
    
    local success=$(json_extract_bool "$response" "success")
    
    if [[ "$success" == "true" ]]; then
        print_success "Filtragem por método funcionando"
    else
        print_error "Falha ao filtrar por método"
    fi
    echo ""
}

# Teste 7: Atualizar status do pagamento
test_update_payment() {
    print_header "Teste 7: Atualizar Status do Pagamento"
    
    local response=$(curl -s -X PUT "$API_URL/api/payment/$PAYMENT_ID_PIX" \
        -H "Content-Type: application/json" \
        -d '{
            "status": "PAID"
        }')
    
    if [[ $VERBOSE == "true" ]]; then
        echo "$response"
    fi
    
    local success=$(json_extract_bool "$response" "success")
    
    if [[ "$success" == "true" ]] && echo "$response" | grep -q "PAID"; then
        print_success "Status atualizado para PAID"
    else
        print_error "Falha ao atualizar status"
    fi
    echo ""
}

# Teste 8: Verificar atualização
test_verify_update() {
    print_header "Teste 8: Verificar Atualização"
    
    local response=$(curl -s -X GET "$API_URL/api/payment/$PAYMENT_ID_PIX")
    
    if [[ $VERBOSE == "true" ]]; then
        echo "$response"
    fi
    
    if echo "$response" | grep -q "PAID"; then
        print_success "Status verificado: PAID"
    else
        print_error "Status não foi atualizado corretamente"
    fi
    echo ""
}

# Teste 9: Erro - CPF inválido
test_error_invalid_cpf() {
    print_header "Teste 9: Erro - CPF Inválido"
    
    local response=$(curl -s -X POST "$API_URL/api/payment" \
        -H "Content-Type: application/json" \
        -d '{
            "cpf": "123",
            "description": "Teste erro",
            "amount": 100,
            "payment_method": "PIX"
        }')
    
    if [[ $VERBOSE == "true" ]]; then
        echo "$response"
    fi
    
    local success=$(json_extract_bool "$response" "success")
    
    if [[ "$success" == "false" ]]; then
        print_success "Validação de CPF funcionando corretamente"
    else
        print_error "Validação de CPF não está funcionando"
    fi
    echo ""
}

# Teste 10: Erro - Valor negativo
test_error_negative_amount() {
    print_header "Teste 10: Erro - Valor Negativo"
    
    local response=$(curl -s -X POST "$API_URL/api/payment" \
        -H "Content-Type: application/json" \
        -d '{
            "cpf": "12345678901",
            "description": "Teste erro",
            "amount": -50,
            "payment_method": "PIX"
        }')
    
    if [[ $VERBOSE == "true" ]]; then
        echo "$response"
    fi
    
    local success=$(json_extract_bool "$response" "success")
    
    if [[ "$success" == "false" ]]; then
        print_success "Validação de valor funcionando corretamente"
    else
        print_error "Validação de valor não está funcionando"
    fi
    echo ""
}

# Teste 11: Erro - Pagamento não encontrado
test_error_not_found() {
    print_header "Teste 11: Erro - Pagamento Não Encontrado"
    
    local response=$(curl -s -X GET "$API_URL/api/payment/00000000-0000-0000-0000-000000000000")
    
    if [[ $VERBOSE == "true" ]]; then
        echo "$response"
    fi
    
    local success=$(json_extract_bool "$response" "success")
    
    if [[ "$success" == "false" ]]; then
        print_success "Tratamento de 404 funcionando corretamente"
    else
        print_error "Tratamento de 404 não está funcionando"
    fi
    echo ""
}

# Resumo dos testes
print_summary() {
    print_header "Resumo dos Testes"
    
    local total=$((TESTS_PASSED + TESTS_FAILED))
    
    echo -e "Total de testes: ${BLUE}$total${NC}"
    echo -e "Testes passados: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Testes falhados: ${RED}$TESTS_FAILED${NC}"
    echo ""
    
    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo -e "${GREEN}✓ Todos os testes passaram!${NC}"
        exit 0
    else
        echo -e "${RED}✗ Alguns testes falharam${NC}"
        exit 1
    fi
}

# Execução principal
main() {
    echo ""
    print_header "Payment API - Test Suite"
    echo ""
    print_info "API URL: $API_URL"
    print_info "Verbose: $VERBOSE"
    echo ""
    
    check_api
    test_create_pix
    test_create_credit_card
    test_get_payment
    test_list_payments
    test_filter_by_status
    test_filter_by_method
    test_update_payment
    test_verify_update
    test_error_invalid_cpf
    test_error_negative_amount
    test_error_not_found
    
    print_summary
}

# Executar
main
