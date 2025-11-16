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
});

export default listPaymentsSchema;
