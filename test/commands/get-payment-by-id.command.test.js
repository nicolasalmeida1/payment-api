import { jest } from '@jest/globals';
import GetPaymentByIdCommand from '../../src/domain/command/get-payment-by-id.command.js';

describe('GetPaymentByIdCommand', () => {
  let command;
  let mockGetPaymentByIdService;

  beforeEach(() => {
    mockGetPaymentByIdService = {
      execute: jest.fn(),
    };

    command = new GetPaymentByIdCommand({
      getPaymentByIdService: mockGetPaymentByIdService,
    });
  });

  describe('execute', () => {
    it('should execute command successfully', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const expectedResult = {
        success: true,
        data: {
          id,
          cpf: '12345678901',
          description: 'Test payment',
          amount: 100.5,
          payment_method: 'PIX',
          status: 'PENDING',
        },
      };

      mockGetPaymentByIdService.execute.mockResolvedValue(expectedResult);

      const result = await command.execute(id);

      expect(result).toEqual(expectedResult);
      expect(mockGetPaymentByIdService.execute).toHaveBeenCalledWith(id);
    });

    it('should propagate service errors', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const error = new Error('Payment not found');

      mockGetPaymentByIdService.execute.mockRejectedValue(error);

      await expect(command.execute(id)).rejects.toThrow('Payment not found');
    });
  });
});
