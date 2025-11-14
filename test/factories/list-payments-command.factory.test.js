import { jest } from '@jest/globals';
import ListPaymentsCommandFactory from '../../src/infrastructure/factories/list-payments-command.factory.js';
import ListPaymentsCommand from '../../src/domain/command/list-payments.command.js';

jest.mock('../../src/db/connection.js', () => ({
  default: {},
}));

describe('ListPaymentsCommandFactory', () => {
  describe('create', () => {
    it('should create and return a ListPaymentsCommand instance', () => {
      const command = ListPaymentsCommandFactory.create();

      expect(command).toBeInstanceOf(ListPaymentsCommand);
    });

    it('should create command with initialized dependencies', () => {
      const command = ListPaymentsCommandFactory.create();

      expect(command.listPaymentsService).toBeDefined();
      expect(command.listPaymentsService.paymentRepository).toBeDefined();
    });

    it('should create new instances on each call', () => {
      const command1 = ListPaymentsCommandFactory.create();
      const command2 = ListPaymentsCommandFactory.create();

      expect(command1).not.toBe(command2);
      expect(command1.listPaymentsService).not.toBe(
        command2.listPaymentsService,
      );
    });
  });
});
