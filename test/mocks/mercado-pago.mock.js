// Mocks para respostas da API do Mercado Pago

export const mockPayment = {
  id: 'payment-12345',
  cpf: '12345678901',
  description: 'Compra de produto teste',
  amount: 250.75,
  payment_method: 'CREDIT_CARD',
  status: 'PENDING',
};

export const mockPreferenceResponse = {
  id: 'preference-abc123xyz',
  init_point: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=preference-abc123xyz',
  sandbox_init_point: 'https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=preference-abc123xyz',
  additional_info: '',
  auto_return: 'approved',
  back_urls: {
    failure: 'https://my-app.com/api/payment/payment-12345/failure',
    pending: 'https://my-app.com/api/payment/payment-12345/pending',
    success: 'https://my-app.com/api/payment/payment-12345/success',
  },
  binary_mode: false,
  client_id: '123456',
  collector_id: 789012345,
  date_created: '2025-11-16T10:30:00.000-04:00',
  date_of_expiration: null,
  expiration_date_from: null,
  expiration_date_to: null,
  expires: false,
  external_reference: 'payment-12345',
  items: [
    {
      id: 'payment-12345',
      category_id: '',
      currency_id: 'BRL',
      description: 'Compra de produto teste',
      picture_url: '',
      title: 'Compra de produto teste',
      quantity: 1,
      unit_price: 250.75,
    },
  ],
  marketplace: 'NONE',
  marketplace_fee: 0,
  metadata: {
    payment_id: 'payment-12345',
    cpf: '12345678901',
  },
  notification_url: 'https://my-app.com/api/webhooks/mercado-pago',
  operation_type: 'regular_payment',
  payer: {
    phone: {
      area_code: '',
      number: '',
    },
    address: {
      zip_code: '',
      street_name: '',
      street_number: null,
    },
    email: '12345678901@payment-api.com',
    identification: {
      number: '12345678901',
      type: 'CPF',
    },
    name: '',
    surname: '',
    date_created: null,
    last_purchase: null,
  },
  payment_methods: {
    default_card_id: null,
    default_payment_method_id: null,
    excluded_payment_methods: [],
    excluded_payment_types: [],
    installments: null,
    default_installments: null,
  },
  processing_modes: null,
  product_id: null,
  redirect_urls: {
    failure: '',
    pending: '',
    success: '',
  },
  shipments: {
    default_shipping_method: null,
    receiver_address: {
      zip_code: '',
      street_name: '',
      street_number: null,
      floor: '',
      apartment: '',
      city_name: null,
      state_name: null,
      country_name: null,
    },
  },
  site_id: 'MLB',
  statement_descriptor: 'PAYMENT API',
  taxes: null,
  total_amount: null,
  last_updated: null,
};

export const mockPreferenceRequest = {
  items: [
    {
      id: 'payment-12345',
      title: 'Compra de produto teste',
      description: 'Compra de produto teste',
      quantity: 1,
      currency_id: 'BRL',
      unit_price: 250.75,
    },
  ],
  payer: {
    email: '12345678901@payment-api.com',
    identification: {
      type: 'CPF',
      number: '12345678901',
    },
  },
  back_urls: {
    success: 'https://my-app.com/api/payment/payment-12345/success',
    pending: 'https://my-app.com/api/payment/payment-12345/pending',
    failure: 'https://my-app.com/api/payment/payment-12345/failure',
  },
  notification_url: 'https://my-app.com/api/webhooks/mercado-pago',
  auto_return: 'approved',
  external_reference: 'payment-12345',
  statement_descriptor: 'PAYMENT API',
  metadata: {
    payment_id: 'payment-12345',
    cpf: '12345678901',
  },
};

export const mockPaymentResponseApproved = {
  id: 98765432,
  date_created: '2025-11-16T10:35:00.000-04:00',
  date_approved: '2025-11-16T10:35:05.000-04:00',
  date_last_updated: '2025-11-16T10:35:05.000-04:00',
  money_release_date: '2025-11-30T10:35:05.000-04:00',
  operation_type: 'regular_payment',
  issuer_id: '24',
  payment_method_id: 'visa',
  payment_type_id: 'credit_card',
  status: 'approved',
  status_detail: 'accredited',
  currency_id: 'BRL',
  description: 'Compra de produto teste',
  live_mode: false,
  sponsor_id: null,
  authorization_code: '123456',
  collector_id: 789012345,
  payer: {
    type: 'customer',
    id: '456789123',
    email: '12345678901@payment-api.com',
    identification: {
      type: 'CPF',
      number: '12345678901',
    },
    phone: {
      area_code: '11',
      number: '987654321',
      extension: null,
    },
    first_name: 'Test',
    last_name: 'User',
    entity_type: null,
  },
  metadata: {
    payment_id: 'payment-12345',
    cpf: '12345678901',
  },
  additional_info: {},
  order: {},
  external_reference: 'payment-12345',
  transaction_amount: 250.75,
  transaction_amount_refunded: 0,
  coupon_amount: 0,
  differential_pricing_id: null,
  deduction_schema: null,
  transaction_details: {
    net_received_amount: 238.21,
    total_paid_amount: 250.75,
    overpaid_amount: 0,
    external_resource_url: null,
    installment_amount: 250.75,
    financial_institution: null,
    payment_method_reference_id: null,
    payable_deferral_period: null,
    acquirer_reference: null,
  },
  fee_details: [
    {
      type: 'mercadopago_fee',
      amount: 12.54,
      fee_payer: 'collector',
    },
  ],
  captured: true,
  binary_mode: false,
  call_for_authorize_id: null,
  statement_descriptor: 'PAYMENT API',
  installments: 1,
  card: {
    id: null,
    first_six_digits: '411111',
    last_four_digits: '1111',
    expiration_month: 12,
    expiration_year: 2026,
    date_created: '2025-11-16T10:35:00.000-04:00',
    date_last_updated: '2025-11-16T10:35:00.000-04:00',
    cardholder: {
      name: 'TEST USER',
      identification: {
        number: '12345678901',
        type: 'CPF',
      },
    },
  },
  notification_url: 'https://my-app.com/api/webhooks/mercado-pago',
  refunds: [],
  processing_mode: 'aggregator',
  merchant_account_id: null,
  acquirer: null,
  merchant_number: null,
  point_of_interaction: {
    type: 'UNSPECIFIED',
  },
};

export const mockPaymentResponsePending = {
  ...mockPaymentResponseApproved,
  id: 98765433,
  status: 'pending',
  status_detail: 'pending_contingency',
  date_approved: null,
};

export const mockPaymentResponseRejected = {
  ...mockPaymentResponseApproved,
  id: 98765434,
  status: 'rejected',
  status_detail: 'cc_rejected_insufficient_amount',
  date_approved: null,
};

export const mockPaymentResponseNotFound = {
  message: 'Payment not found',
  error: 'not_found',
  status: 404,
  cause: [],
};

export const mockPreferenceNotFound = {
  message: 'Preference not found',
  error: 'not_found',
  status: 404,
  cause: [],
};

export const mockApiErrorInvalidItems = {
  message: 'Invalid items',
  error: 'invalid_items',
  status: 400,
  cause: [
    {
      code: '1',
      description: 'Items must have at least one item',
      data: null,
    },
  ],
};

export const mockApiErrorUnauthorized = {
  message: 'Invalid credentials',
  error: 'unauthorized',
  status: 401,
  cause: [],
};

export const mockApiErrorRateLimit = {
  message: 'Too many requests',
  error: 'too_many_requests',
  status: 429,
  cause: [],
};

// Helper para criar mocks personalizados
export function createMockPayment(overrides = {}) {
  return {
    ...mockPayment,
    ...overrides,
  };
}

export function createMockPreferenceResponse(overrides = {}) {
  return {
    ...mockPreferenceResponse,
    ...overrides,
  };
}

export function createMockPaymentResponse(status = 'approved', overrides = {}) {
  const baseResponse =
    status === 'approved'
      ? mockPaymentResponseApproved
      : status === 'pending'
        ? mockPaymentResponsePending
        : mockPaymentResponseRejected;

  return {
    ...baseResponse,
    ...overrides,
  };
}
