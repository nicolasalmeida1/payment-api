import Joi from 'joi';

export const createPaymentSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'id must be a valid UUID',
    'any.required': 'id is required',
  }),
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
  paymentMethod: Joi.string().valid('PIX', 'CREDIT_CARD').required().messages({
    'any.only': 'paymentMethod must be PIX or CREDIT_CARD',
    'any.required': 'paymentMethod is required',
  }),
});

export default createPaymentSchema;
