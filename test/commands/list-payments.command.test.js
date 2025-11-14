import { jest } from '@jest/globals';
import ListPaymentsCommand from '../../src/domain/command/list-payments.command.js';

describe('ListPaymentsCommand', () => {
  let command;
  let mockListPaymentsService;

  beforeEach(() => {
    mockListPaymentsService = {
      execute: jest.fn(),
    };

    command = new ListPaymentsCommand({
      listPaymentsService: mockListPaymentsService,
    });
  });

  describe('execute', () => {
    it('should execute command with valid filters', async () => {
      const filters = {
        cpf: '12345678901',
        paymentMethod: 'PIX',
        status: 'PAID',
      };

      const expectedResult = {
        success: true,
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            cpf: '12345678901',
            description: 'Test payment',
            amount: 100.5,
            payment_method: 'PIX',
            status: 'PAID',
          },
        ],
        count: 1,
      };

      mockListPaymentsService.execute.mockResolvedValue(expectedResult);

      const result = await command.execute(filters);

      expect(result).toEqual(expectedResult);
      expect(mockListPaymentsService.execute).toHaveBeenCalledWith(filters);
    });

    it('should execute command without filters', async () => {
      const filters = {};

      const expectedResult = {
        success: true,
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            cpf: '12345678901',
            description: 'Test payment',
            amount: 100.5,
            payment_method: 'PIX',
            status: 'PAID',
          },
        ],
        count: 1,
      };

      mockListPaymentsService.execute.mockResolvedValue(expectedResult);

      const result = await command.execute(filters);

      expect(result).toEqual(expectedResult);
      expect(mockListPaymentsService.execute).toHaveBeenCalledWith(filters);
    });

    it('should throw validation error for invalid cpf', async () => {
      const filters = {
        cpf: '123',
      };

      await expect(command.execute(filters)).rejects.toThrow(
        'Validation failed:',
      );
      expect(mockListPaymentsService.execute).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid paymentMethod', async () => {
      const filters = {
        paymentMethod: 'INVALID',
      };

      await expect(command.execute(filters)).rejects.toThrow(
        'Validation failed:',
      );
      expect(mockListPaymentsService.execute).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid status', async () => {
      const filters = {
        status: 'INVALID_STATUS',
      };

      await expect(command.execute(filters)).rejects.toThrow(
        'Validation failed:',
      );
      expect(mockListPaymentsService.execute).not.toHaveBeenCalled();
    });

    it('should propagate service errors', async () => {
      const filters = {
        cpf: '12345678901',
      };

      const error = new Error('Service error');
      mockListPaymentsService.execute.mockRejectedValue(error);

      await expect(command.execute(filters)).rejects.toThrow('Service error');
    });
  });
});
