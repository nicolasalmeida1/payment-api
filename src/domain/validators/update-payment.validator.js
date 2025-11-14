import Joi from 'joi';

export const updatePaymentSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'PAID', 'FAIL').messages({
    'any.only': 'status must be PENDING, PAID or FAIL',
  }),
  description: Joi.string().min(1).messages({
    'string.empty': 'description cannot be empty',
  }),
  amount: Joi.number().positive().messages({
    'number.positive': 'amount must be a positive number',
  }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

export default updatePaymentSchema;
