import { jest } from '@jest/globals';
import GetPaymentByIdCommandFactory from '../../src/infrastructure/factories/get-payment-by-id-command.factory.js';
import GetPaymentByIdCommand from '../../src/domain/command/get-payment-by-id.command.js';

jest.mock('../../src/db/connection.js', () => ({
  default: {},
}));

describe('GetPaymentByIdCommandFactory', () => {
  describe('create', () => {
    it('should create and return a GetPaymentByIdCommand instance', () => {
      const command = GetPaymentByIdCommandFactory.create();

      expect(command).toBeInstanceOf(GetPaymentByIdCommand);
    });

    it('should create command with initialized dependencies', () => {
      const command = GetPaymentByIdCommandFactory.create();

      expect(command.getPaymentByIdService).toBeDefined();
      expect(command.getPaymentByIdService.paymentRepository).toBeDefined();
    });

    it('should create new instances on each call', () => {
      const command1 = GetPaymentByIdCommandFactory.create();
      const command2 = GetPaymentByIdCommandFactory.create();

      expect(command1).not.toBe(command2);
      expect(command1.getPaymentByIdService).not.toBe(
        command2.getPaymentByIdService,
      );
    });
  });
});
