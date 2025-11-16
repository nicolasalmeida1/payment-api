import Joi from 'joi';

export const mercadoPagoWebhookSchema = Joi.object({
  action: Joi.string().required().messages({
    'any.required': 'action is required',
    'string.base': 'action must be a string',
  }),
  type: Joi.string().required().messages({
    'any.required': 'type is required',
    'string.base': 'type must be a string',
  }),
  data: Joi.object({
    id: Joi.string().required().messages({
      'any.required': 'data.id is required',
      'string.base': 'data.id must be a string',
    }),
  })
    .required()
    .messages({
      'any.required': 'data is required',
      'object.base': 'data must be an object',
    }),
  live_mode: Joi.boolean().optional(),
  date_created: Joi.string().optional(),
  user_id: Joi.number().optional(),
  api_version: Joi.string().optional(),
}).unknown(true);
