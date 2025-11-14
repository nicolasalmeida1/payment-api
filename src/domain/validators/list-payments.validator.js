import Joi from 'joi';

export const listPaymentsSchema = Joi.object({
  cpf: Joi.string()
    .pattern(/^\d{11}$/)
    .messages({
      'string.pattern.base': 'cpf must contain 11 numeric digits',
    }),
  paymentMethod: Joi.string().valid('PIX', 'CREDIT_CARD').messages({
    'any.only': 'paymentMethod must be PIX or CREDIT_CARD',
  }),
  status: Joi.string().valid('PENDING', 'PAID', 'FAIL').messages({
    'any.only': 'status must be PENDING, PAID or FAIL',
  }),
});

export default listPaymentsSchema;
