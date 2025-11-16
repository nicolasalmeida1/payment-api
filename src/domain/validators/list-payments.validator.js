import Joi from 'joi';
import { PaymentStatus, PaymentMethod } from '../enums/index.js';

export const listPaymentsSchema = Joi.object({
  cpf: Joi.string()
    .pattern(/^\d{11}$/)
    .messages({
      'string.pattern.base': 'cpf must contain 11 numeric digits',
    }),
  paymentMethod: Joi.string()
    .valid(...Object.values(PaymentMethod))
    .messages({
      'any.only': 'paymentMethod must be PIX or CREDIT_CARD',
    }),
  status: Joi.string()
    .valid(...Object.values(PaymentStatus))
    .messages({
      'any.only': 'status must be PENDING, PAID or FAIL',
    }),
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'page must be a number',
    'number.integer': 'page must be an integer',
    'number.min': 'page must be at least 1',
  }),
  take: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'take must be a number',
    'number.integer': 'take must be an integer',
    'number.min': 'take must be at least 1',
    'number.max': 'take must not exceed 100',
  }),
});

export default listPaymentsSchema;
