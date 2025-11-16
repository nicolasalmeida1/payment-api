import Joi from 'joi';

export const getPaymentByIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'id must be a valid UUID',
    'string.empty': 'id cannot be empty',
    'any.required': 'id is required',
  }),
});

export default getPaymentByIdSchema;
