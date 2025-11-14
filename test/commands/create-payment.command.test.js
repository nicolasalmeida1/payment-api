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
  });

  describe('execute', () => {
    it('should execute command with valid data', async () => {
      const input = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.5,
        paymentMethod: 'PIX',
      };

      const expectedResult = {
        success: true,
        data: {
          id: input.id,
          cpf: input.cpf,
          description: input.description,
          amount: input.amount,
          payment_method: 'PIX',
          status: 'PENDING',
        },
      };

      mockCreatePaymentService.execute.mockResolvedValue(expectedResult);

      const result = await command.execute(input);

      expect(result).toEqual(expectedResult);
      expect(mockCreatePaymentService.execute).toHaveBeenCalledWith(input);
    });

    it('should throw validation error for invalid id', async () => {
      const input = {
        id: 'invalid-uuid',
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.5,
        paymentMethod: 'PIX',
      };

      await expect(command.execute(input)).rejects.toThrow(
        'Validation failed:',
      );
      expect(mockCreatePaymentService.execute).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid cpf', async () => {
      const input = {
        id: '550e8400-e29b-41d4-a716-446655440000',
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
      const input = {
        id: '550e8400-e29b-41d4-a716-446655440000',
      };

      await expect(command.execute(input)).rejects.toThrow(
        'Validation failed:',
      );
      expect(mockCreatePaymentService.execute).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid amount', async () => {
      const input = {
        id: '550e8400-e29b-41d4-a716-446655440000',
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
        id: '550e8400-e29b-41d4-a716-446655440000',
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
        id: '550e8400-e29b-41d4-a716-446655440000',
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
