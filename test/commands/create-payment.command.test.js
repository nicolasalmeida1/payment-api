import { jest } from '@jest/globals';
import CreatePaymentCommand from '../../src/domain/command/create-payment.command.js';

describe('CreatePaymentCommand', () => {
  let command;
  let mockCreatePaymentService;

  beforeEach(() => {
    mockCreatePaymentService = {
      execute: jest.fn(),
    };

    command = new CreatePaymentCommand({
      createPaymentService: mockCreatePaymentService,
    });

    command.logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };
  });

  describe('execute', () => {
    it('should execute command with valid data', async () => {
      const input = {
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.5,
        paymentMethod: 'PIX',
      };

      const expectedResult = {
        success: true,
        data: {
          id: expect.any(String),
          cpf: input.cpf,
          description: input.description,
          amount: input.amount,
          payment_method: 'PIX',
          status: 'PENDING',
        },
      };

      mockCreatePaymentService.execute.mockResolvedValue(expectedResult);

      const result = await command.execute(input);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        cpf: input.cpf,
        description: input.description,
        amount: input.amount,
        payment_method: 'PIX',
        status: 'PENDING',
      });
      expect(mockCreatePaymentService.execute).toHaveBeenCalledWith(input);
    });

    it('should throw validation error for invalid cpf', async () => {
      const input = {
        cpf: '123',
        description: 'Test payment',
        amount: 100.5,
        paymentMethod: 'PIX',
      };

      await expect(command.execute(input)).rejects.toThrow(
        'Validation failed:',
      );
      expect(mockCreatePaymentService.execute).not.toHaveBeenCalled();
    });

    it('should throw validation error for missing required fields', async () => {
      const input = {};

      await expect(command.execute(input)).rejects.toThrow(
        'Validation failed:',
      );
      expect(mockCreatePaymentService.execute).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid amount', async () => {
      const input = {
        cpf: '12345678901',
        description: 'Test payment',
        amount: -100,
        paymentMethod: 'PIX',
      };

      await expect(command.execute(input)).rejects.toThrow(
        'Validation failed:',
      );
      expect(mockCreatePaymentService.execute).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid payment method', async () => {
      const input = {
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.5,
        paymentMethod: 'INVALID',
      };

      await expect(command.execute(input)).rejects.toThrow(
        'Validation failed:',
      );
      expect(mockCreatePaymentService.execute).not.toHaveBeenCalled();
    });

    it('should propagate service errors', async () => {
      const input = {
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.5,
        paymentMethod: 'PIX',
      };

      const error = new Error('Service error');
      mockCreatePaymentService.execute.mockRejectedValue(error);

      await expect(command.execute(input)).rejects.toThrow('Service error');
    });
  });
});
