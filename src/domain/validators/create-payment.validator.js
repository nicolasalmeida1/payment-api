import Joi from 'joi';
import { PaymentMethod } from '../enums/index.js';

export const createPaymentSchema = Joi.object({
  cpf: Joi.string()
    .pattern(/^\d{11}$/)
    .required()
    .messages({
      'string.pattern.base': 'cpf must contain 11 numeric digits',
      'any.required': 'cpf is required',
    }),
  description: Joi.string().min(1).required().messages({
    'string.empty': 'description cannot be empty',
    'any.required': 'description is required',
  }),
  amount: Joi.number().positive().required().messages({
    'number.positive': 'amount must be a positive number',
    'any.required': 'amount is required',
  }),
  paymentMethod: Joi.string()
    .valid(...Object.values(PaymentMethod))
    .required()
    .messages({
      'any.only': 'paymentMethod must be PIX or CREDIT_CARD',
      'any.required': 'paymentMethod is required',
    }),
});

export default createPaymentSchema;
