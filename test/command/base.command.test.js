import BaseCommand from '../../src/domain/command/base.command.js';
import Joi from 'joi';
import { ValidationError } from '../../src/domain/errors/domain.errors.js';

describe('BaseCommand', () => {
  let baseCommand;

  beforeEach(() => {
    baseCommand = new BaseCommand();
  });

  describe('validate', () => {
    it('should validate and return value when input is valid', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().required(),
      });

      const input = { name: 'John', age: 30 };
      const result = baseCommand.validate(schema, input);

      expect(result).toEqual(input);
    });

    it('should throw ValidationError when input is invalid', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().required(),
      });

      const input = { name: 'John' };

      expect(() => {
        baseCommand.validate(schema, input);
      }).toThrow(ValidationError);
    });

    it('should include context in validation error', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      });

      const input = {};
      const context = { userId: 123 };

      try {
        baseCommand.validate(schema, input, context);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.errors).toContain('"name" is required');
      }
    });
  });

  describe('handleError', () => {
    it('should log error and rethrow', async () => {
      const error = new Error('Test error');
      const context = { paymentId: '123' };

      await expect(baseCommand.handleError(error, context)).rejects.toThrow('Test error');
    });
  });
});
