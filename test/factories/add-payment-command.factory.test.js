import { jest } from '@jest/globals';
import CreatePaymentCommandFactory from '../../src/infrastructure/factories/add-payment-command.factory.js';
import CreatePaymentCommand from '../../src/domain/command/create-payment.command.js';

jest.mock('../../src/db/connection.js', () => ({
  default: {},
}));

describe('CreatePaymentCommandFactory', () => {
  describe('create', () => {
    it('should create and return a CreatePaymentCommand instance', () => {
      const command = CreatePaymentCommandFactory.create();

      expect(command).toBeInstanceOf(CreatePaymentCommand);
    });

    it('should create command with initialized dependencies', () => {
      const command = CreatePaymentCommandFactory.create();

      expect(command.createPaymentService).toBeDefined();
      expect(command.createPaymentService.paymentRepository).toBeDefined();
      expect(
        command.createPaymentService.paymentHistoryRepository,
      ).toBeDefined();
    });

    it('should create new instances on each call', () => {
      const command1 = CreatePaymentCommandFactory.create();
      const command2 = CreatePaymentCommandFactory.create();

      expect(command1).not.toBe(command2);
      expect(command1.createPaymentService).not.toBe(
        command2.createPaymentService,
      );
    });
  });
});
