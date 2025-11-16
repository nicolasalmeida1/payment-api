/**
 * @fileoverview Global type definitions for Payment API
 * This file contains TypeScript-style type definitions that can be referenced
 * in JSDoc comments throughout the application.
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * @typedef {'PIX' | 'CREDIT_CARD'} PaymentMethodType
 */

/**
 * @typedef {'PENDING' | 'PAID' | 'FAIL'} PaymentStatusType
 */

/**
 * @typedef {'PAYMENT_CREATED' | 'PAYMENT_STATUS_CHANGED'} PaymentEventType
 */

/**
 * @typedef {'approved' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back' | 'pending' | 'in_process' | 'in_mediation' | 'authorized'} MercadoPagoStatusType
 */

/**
 * @typedef {'debug' | 'info' | 'warn' | 'error'} LogLevel
 */

// ============================================================================
// Domain Models
// ============================================================================

/**
 * @typedef {Object} Payment
 * @property {string} id - Unique payment identifier (UUID)
 * @property {string} cpf - Customer CPF (11 digits)
 * @property {string} description - Payment description
 * @property {number} amount - Payment amount in BRL
 * @property {PaymentMethodType} payment_method - Payment method
 * @property {PaymentStatusType} status - Payment status
 * @property {Date} [created_at] - Creation timestamp
 * @property {Date} [updated_at] - Last update timestamp
 */

/**
 * @typedef {Object} PaymentHistory
 * @property {string} id - Unique history identifier (UUID)
 * @property {string} payment_id - Payment identifier
 * @property {PaymentEventType} event - Event type
 * @property {Object} event_data - Event metadata
 * @property {Date} created_at - Event timestamp
 */

/**
 * @typedef {Object} PaymentData
 * @property {string} id - Payment identifier
 * @property {string} cpf - Customer CPF
 * @property {string} description - Payment description
 * @property {number} amount - Payment amount
 * @property {PaymentMethodType} payment_method - Payment method
 * @property {PaymentStatusType} status - Payment status
 */

/**
 * @typedef {Object} PaymentHistoryData
 * @property {string} payment_id - Payment identifier
 * @property {PaymentEventType} event - Event type
 * @property {Object} event_data - Event data
 */

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

/**
 * @typedef {Object} CreatePaymentInput
 * @property {string} cpf - Customer CPF (11 digits)
 * @property {string} description - Payment description
 * @property {number} amount - Payment amount
 * @property {PaymentMethodType} paymentMethod - Payment method
 */

/**
 * @typedef {Object} UpdatePaymentInput
 * @property {string} id - Payment identifier
 * @property {PaymentStatusType} [status] - New payment status
 * @property {string} [description] - New description
 */

/**
 * @typedef {Object} GetPaymentByIdInput
 * @property {string} id - Payment identifier
 */

/**
 * @typedef {Object} ListPaymentsInput
 * @property {number} [page=1] - Page number
 * @property {number} [take=10] - Items per page
 * @property {string} [cpf] - Filter by CPF
 * @property {PaymentMethodType} [paymentMethod] - Filter by payment method
 * @property {PaymentStatusType} [status] - Filter by status
 */

/**
 * @typedef {Object} MercadoPagoWebhookInput
 * @property {string} action - Webhook action
 * @property {string} type - Webhook type
 * @property {Object} data - Webhook data
 * @property {string} data.id - Payment ID
 */

// ============================================================================
// Service Responses
// ============================================================================

/**
 * @typedef {Object} ServiceResponse
 * @property {boolean} success - Operation success status
 * @property {*} [data] - Response data
 * @property {string} [message] - Response message
 * @property {string} [error] - Error message
 */

/**
 * @typedef {Object} CreatePaymentResponse
 * @property {boolean} success - Operation success
 * @property {Payment} data - Created payment
 * @property {MercadoPagoPreferenceResponse} [mercadoPago] - Mercado Pago data
 * @property {WorkflowResponse} [workflow] - Temporal workflow data
 */

/**
 * @typedef {Object} UpdatePaymentResponse
 * @property {boolean} success - Operation success
 * @property {Payment} data - Updated payment
 */

/**
 * @typedef {Object} GetPaymentResponse
 * @property {boolean} success - Operation success
 * @property {Payment} data - Payment data
 */

/**
 * @typedef {Object} ListPaymentsResponse
 * @property {boolean} success - Operation success
 * @property {Payment[]} data - List of payments
 */

// ============================================================================
// Mercado Pago Types
// ============================================================================

/**
 * @typedef {Object} MercadoPagoPreferenceResponse
 * @property {string} preference_id - Mercado Pago preference ID
 * @property {string} init_point - Payment URL
 * @property {string} sandbox_init_point - Sandbox payment URL
 */

/**
 * @typedef {Object} MercadoPagoPreference
 * @property {string} id - Preference ID
 * @property {string} init_point - Payment URL
 * @property {string} sandbox_init_point - Sandbox payment URL
 * @property {string} external_reference - Payment reference
 * @property {MercadoPagoItem[]} [items] - Payment items
 */

/**
 * @typedef {Object} MercadoPagoItem
 * @property {string} id - Item ID
 * @property {string} title - Item title
 * @property {string} [description] - Item description
 * @property {number} quantity - Item quantity
 * @property {string} currency_id - Currency (e.g., 'BRL')
 * @property {number} unit_price - Unit price
 */

/**
 * @typedef {Object} MercadoPagoPayment
 * @property {string} id - Payment ID
 * @property {MercadoPagoStatusType} status - Payment status
 * @property {string} status_detail - Status detail
 * @property {string} external_reference - Payment reference
 * @property {number} transaction_amount - Transaction amount
 * @property {string} [date_created] - Creation date
 * @property {string} [date_approved] - Approval date
 */

/**
 * @typedef {Object} MercadoPagoPayer
 * @property {string} email - Payer email
 * @property {Object} identification - Payer identification
 * @property {string} identification.type - ID type (e.g., 'CPF')
 * @property {string} identification.number - ID number
 */

/**
 * @typedef {Object} MercadoPagoPreferenceData
 * @property {MercadoPagoItem[]} items - Payment items
 * @property {MercadoPagoPayer} payer - Payer information
 * @property {Object} back_urls - Callback URLs
 * @property {string} back_urls.success - Success URL
 * @property {string} back_urls.pending - Pending URL
 * @property {string} back_urls.failure - Failure URL
 * @property {string} notification_url - Webhook URL
 * @property {string} auto_return - Auto return policy
 * @property {string} external_reference - Payment reference
 * @property {string} statement_descriptor - Statement descriptor
 * @property {Object} metadata - Additional metadata
 */

/**
 * @typedef {Object} MercadoPagoStatusResponse
 * @property {MercadoPagoStatusType} status - Payment status
 * @property {string} external_reference - Payment reference
 * @property {number} transaction_amount - Transaction amount
 */

// ============================================================================
// Temporal Workflow Types
// ============================================================================

/**
 * @typedef {Object} WorkflowResponse
 * @property {string} workflowId - Temporal workflow ID
 * @property {string} runId - Workflow execution run ID
 */

/**
 * @typedef {Object} WorkflowStatusResponse
 * @property {string} workflowId - Workflow ID
 * @property {string} status - Workflow status
 * @property {Date} [startTime] - Start time
 * @property {Date} [closeTime] - Close time
 * @property {number} [executionTime] - Execution time in ms
 */

/**
 * @typedef {Object} PaymentWorkflowInput
 * @property {string} id - Payment identifier
 * @property {string} cpf - Customer CPF
 * @property {string} description - Payment description
 * @property {number} amount - Payment amount
 * @property {PaymentMethodType} paymentMethod - Payment method
 */

/**
 * @typedef {Object} PaymentWorkflowResult
 * @property {string} paymentId - Payment ID
 * @property {PaymentStatusType} status - Final payment status
 * @property {string} preferenceId - Mercado Pago preference ID
 * @property {string} initPoint - Payment URL
 * @property {string} sandboxInitPoint - Sandbox payment URL
 */

/**
 * @typedef {Object} UpdatePaymentStatusResult
 * @property {boolean} success - Operation success
 * @property {PaymentStatusType} oldStatus - Previous status
 * @property {PaymentStatusType} newStatus - New status
 */

// ============================================================================
// Repository Types
// ============================================================================

/**
 * @typedef {Object} RepositoryFilters
 * @property {string} [cpf] - Filter by CPF
 * @property {PaymentMethodType} [paymentMethod] - Filter by payment method
 * @property {PaymentStatusType} [status] - Filter by status
 * @property {number} [page] - Page number
 * @property {number} [take] - Items per page
 */

/**
 * @typedef {Object} TransactionContext
 * @property {*} trx - Database transaction object (Knex transaction)
 */

// ============================================================================
// Logger Types
// ============================================================================

/**
 * @typedef {Object} LogMetadata
 * @property {string} [paymentId] - Payment identifier
 * @property {string} [workflowId] - Workflow identifier
 * @property {string} [error] - Error message
 * @property {string} [stack] - Error stack trace
 * @property {*} [key] - Any additional metadata
 */

/**
 * @typedef {Object} LoggerConfig
 * @property {string} context - Logger context/name
 * @property {LogLevel} logLevel - Current log level
 * @property {Object.<LogLevel, number>} levels - Log level hierarchy
 */

// ============================================================================
// Error Types
// ============================================================================

/**
 * @typedef {Object} ValidationError
 * @property {string} message - Error message
 * @property {Array<{field: string, message: string}>} details - Validation details
 */

/**
 * @typedef {Object} DomainError
 * @property {string} name - Error name
 * @property {string} message - Error message
 * @property {number} statusCode - HTTP status code
 * @property {*} [details] - Error details
 */

// ============================================================================
// Command Pattern Types
// ============================================================================

/**
 * @typedef {Object} CommandResult
 * @property {boolean} success - Command execution success
 * @property {*} [data] - Result data
 * @property {string} [error] - Error message
 * @property {number} [statusCode] - HTTP status code
 */

// ============================================================================
// Dependency Injection Types
// ============================================================================

/**
 * @typedef {Object} ServiceDependencies
 * @property {*} paymentRepository - Payment repository instance
 * @property {*} paymentHistoryRepository - Payment history repository instance
 * @property {*} mercadoPagoService - Mercado Pago service instance
 */

/**
 * @typedef {Object} CommandDependencies
 * @property {*} createPaymentService - Create payment service instance
 * @property {*} updatePaymentService - Update payment service instance
 * @property {*} getPaymentByIdService - Get payment by ID service instance
 * @property {*} listPaymentsService - List payments service instance
 * @property {*} processMercadoPagoWebhookService - Process webhook service instance
 */

// ============================================================================
// Environment Configuration Types
// ============================================================================

/**
 * @typedef {Object} EnvironmentConfig
 * @property {string} NODE_ENV - Node environment (development, production, test)
 * @property {string} PORT - Application port
 * @property {string} DATABASE_URL - PostgreSQL connection URL
 * @property {string} LOG_LEVEL - Logging level
 * @property {string} [MERCADO_PAGO_BASE_URL] - Mercado Pago API base URL
 * @property {string} [MERCADO_PAGO_ACCESS_TOKEN] - Mercado Pago access token
 * @property {string} [APP_URL] - Application base URL
 * @property {string} [USE_TEMPORAL_WORKFLOW] - Enable Temporal workflow
 * @property {string} [USE_MERCADO_PAGO_MOCK] - Enable Mercado Pago mock
 * @property {string} [TEMPORAL_ADDRESS] - Temporal server address
 * @property {string} [TEMPORAL_NAMESPACE] - Temporal namespace
 */
