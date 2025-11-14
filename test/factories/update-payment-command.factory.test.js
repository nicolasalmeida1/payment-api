import { jest } from '@jest/globals';
import UpdatePaymentCommandFactory from '../../src/infrastructure/factories/update-payment-command.factory.js';
import UpdatePaymentCommand from '../../src/domain/command/update-payment.command.js';

jest.mock('../../src/db/connection.js', () => ({
  default: {},
}));

describe('UpdatePaymentCommandFactory', () => {
  describe('create', () => {
    it('should create and return a UpdatePaymentCommand instance', () => {
      const command = UpdatePaymentCommandFactory.create();

      expect(command).toBeInstanceOf(UpdatePaymentCommand);
    });

    it('should create command with initialized dependencies', () => {
      const command = UpdatePaymentCommandFactory.create();

      expect(command.updatePaymentService).toBeDefined();
      expect(command.updatePaymentService.paymentRepository).toBeDefined();
      expect(
        command.updatePaymentService.paymentHistoryRepository,
      ).toBeDefined();
    });

    it('should create new instances on each call', () => {
      const command1 = UpdatePaymentCommandFactory.create();
      const command2 = UpdatePaymentCommandFactory.create();

      expect(command1).not.toBe(command2);
      expect(command1.updatePaymentService).not.toBe(
        command2.updatePaymentService,
      );
    });
  });
});
