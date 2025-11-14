import { jest } from '@jest/globals';
import UpdatePaymentCommand from '../../src/domain/command/update-payment.command.js';

describe('UpdatePaymentCommand', () => {
  let command;
  let mockUpdatePaymentService;

  beforeEach(() => {
    mockUpdatePaymentService = {
      execute: jest.fn(),
    };

    command = new UpdatePaymentCommand({
      updatePaymentService: mockUpdatePaymentService,
    });
  });

  describe('execute', () => {
    it('should execute command with valid status update', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const input = {
        status: 'PAID',
      };

      const expectedResult = {
        success: true,
        data: {
          id,
          cpf: '12345678901',
          description: 'Test payment',
          amount: 100.5,
          payment_method: 'PIX',
          status: 'PAID',
        },
      };

      mockUpdatePaymentService.execute.mockResolvedValue(expectedResult);

      const result = await command.execute(id, input);

      expect(result).toEqual(expectedResult);
      expect(mockUpdatePaymentService.execute).toHaveBeenCalledWith(id, input);
    });

    it('should throw validation error for invalid status', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const input = {
        status: 'INVALID_STATUS',
      };

      await expect(command.execute(id, input)).rejects.toThrow(
        'Validation failed:',
      );
      expect(mockUpdatePaymentService.execute).not.toHaveBeenCalled();
    });

    it('should throw validation error for empty update', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const input = {};

      await expect(command.execute(id, input)).rejects.toThrow(
        'Validation failed:',
      );
      expect(mockUpdatePaymentService.execute).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid amount', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const input = {
        amount: -100,
      };

      await expect(command.execute(id, input)).rejects.toThrow(
        'Validation failed:',
      );
      expect(mockUpdatePaymentService.execute).not.toHaveBeenCalled();
    });

    it('should throw validation error for empty description', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const input = {
        description: '',
      };

      await expect(command.execute(id, input)).rejects.toThrow(
        'Validation failed:',
      );
      expect(mockUpdatePaymentService.execute).not.toHaveBeenCalled();
    });

    it('should execute with multiple valid fields', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const input = {
        status: 'PAID',
        description: 'Updated description',
        amount: 200.5,
      };

      const expectedResult = {
        success: true,
        data: {
          id,
          cpf: '12345678901',
          description: 'Updated description',
          amount: 200.5,
          payment_method: 'PIX',
          status: 'PAID',
        },
      };

      mockUpdatePaymentService.execute.mockResolvedValue(expectedResult);

      const result = await command.execute(id, input);

      expect(result).toEqual(expectedResult);
      expect(mockUpdatePaymentService.execute).toHaveBeenCalledWith(id, input);
    });

    it('should propagate service errors', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const input = {
        status: 'PAID',
      };

      const error = new Error('Service error');
      mockUpdatePaymentService.execute.mockRejectedValue(error);

      await expect(command.execute(id, input)).rejects.toThrow('Service error');
    });
  });
});
