import { jest } from '@jest/globals';
import Logger from '../../src/infrastructure/logger/logger.js';

describe('Logger', () => {
  let consoleLogSpy;
  let consoleWarnSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    process.env.LOG_LEVEL = 'debug';
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    delete process.env.LOG_LEVEL;
  });

  describe('constructor', () => {
    it('should create logger with default context', () => {
      const logger = new Logger();

      expect(logger.context).toBe('');
      expect(logger.logLevel).toBe('debug');
    });

    it('should create logger with custom context', () => {
      const logger = new Logger('PaymentService');

      expect(logger.context).toBe('PaymentService');
    });

    it('should use default log level when LOG_LEVEL is not set', () => {
      delete process.env.LOG_LEVEL;
      const logger = new Logger();

      expect(logger.logLevel).toBe('info');
    });
  });

  describe('debug', () => {
    it('should log debug message', () => {
      const logger = new Logger('TestContext');
      logger.debug('Test debug message');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedMessage.level).toBe('DEBUG');
      expect(loggedMessage.message).toBe('Test debug message');
      expect(loggedMessage.context).toBe('TestContext');
      expect(loggedMessage.timestamp).toBeDefined();
    });

    it('should log debug message with metadata', () => {
      const logger = new Logger('TestContext');
      logger.debug('Test debug message', { userId: '123', action: 'create' });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedMessage.userId).toBe('123');
      expect(loggedMessage.action).toBe('create');
    });

    it('should not log debug when log level is info', () => {
      process.env.LOG_LEVEL = 'info';
      const logger = new Logger();
      logger.debug('Test debug message');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('info', () => {
    it('should log info message', () => {
      const logger = new Logger('TestContext');
      logger.info('Test info message');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedMessage.level).toBe('INFO');
      expect(loggedMessage.message).toBe('Test info message');
    });

    it('should log info message with metadata', () => {
      const logger = new Logger('TestContext');
      logger.info('Payment created', { paymentId: 'abc-123' });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedMessage.paymentId).toBe('abc-123');
    });

    it('should not log info when log level is warn', () => {
      process.env.LOG_LEVEL = 'warn';
      const logger = new Logger();
      logger.info('Test info message');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('should log warn message', () => {
      const logger = new Logger('TestContext');
      logger.warn('Test warning message');

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
      expect(loggedMessage.level).toBe('WARN');
      expect(loggedMessage.message).toBe('Test warning message');
    });

    it('should log warn message with metadata', () => {
      const logger = new Logger('TestContext');
      logger.warn('Invalid payment method', { method: 'invalid' });

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
      expect(loggedMessage.method).toBe('invalid');
    });

    it('should not log warn when log level is error', () => {
      process.env.LOG_LEVEL = 'error';
      const logger = new Logger();
      logger.warn('Test warning message');

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should log error message', () => {
      const logger = new Logger('TestContext');
      logger.error('Test error message');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(loggedMessage.level).toBe('ERROR');
      expect(loggedMessage.message).toBe('Test error message');
    });

    it('should log error message with metadata', () => {
      const logger = new Logger('TestContext');
      const error = new Error('Database error');
      logger.error('Failed to create payment', {
        error: error.message,
        stack: error.stack,
      });

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(loggedMessage.error).toBe('Database error');
      expect(loggedMessage.stack).toBeDefined();
    });

    it('should always log error regardless of log level', () => {
      process.env.LOG_LEVEL = 'error';
      const logger = new Logger();
      logger.error('Test error message');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('setContext', () => {
    it('should update context', () => {
      const logger = new Logger('InitialContext');
      expect(logger.context).toBe('InitialContext');

      logger.setContext('NewContext');
      expect(logger.context).toBe('NewContext');

      logger.info('Test message');
      const loggedMessage = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedMessage.context).toBe('NewContext');
    });
  });

  describe('shouldLog', () => {
    it('should return true for debug when level is debug', () => {
      process.env.LOG_LEVEL = 'debug';
      const logger = new Logger();

      expect(logger.shouldLog('debug')).toBe(true);
      expect(logger.shouldLog('info')).toBe(true);
      expect(logger.shouldLog('warn')).toBe(true);
      expect(logger.shouldLog('error')).toBe(true);
    });

    it('should return false for debug when level is info', () => {
      process.env.LOG_LEVEL = 'info';
      const logger = new Logger();

      expect(logger.shouldLog('debug')).toBe(false);
      expect(logger.shouldLog('info')).toBe(true);
      expect(logger.shouldLog('warn')).toBe(true);
      expect(logger.shouldLog('error')).toBe(true);
    });

    it('should only log errors when level is error', () => {
      process.env.LOG_LEVEL = 'error';
      const logger = new Logger();

      expect(logger.shouldLog('debug')).toBe(false);
      expect(logger.shouldLog('info')).toBe(false);
      expect(logger.shouldLog('warn')).toBe(false);
      expect(logger.shouldLog('error')).toBe(true);
    });
  });

  describe('formatMessage', () => {
    it('should format message with all fields', () => {
      const logger = new Logger('TestContext');
      const formatted = logger.formatMessage('info', 'Test message', {
        userId: '123',
      });
      const parsed = JSON.parse(formatted);

      expect(parsed.timestamp).toBeDefined();
      expect(parsed.level).toBe('INFO');
      expect(parsed.context).toBe('TestContext');
      expect(parsed.message).toBe('Test message');
      expect(parsed.userId).toBe('123');
    });

    it('should format message without metadata', () => {
      const logger = new Logger('TestContext');
      const formatted = logger.formatMessage('error', 'Error occurred');
      const parsed = JSON.parse(formatted);

      expect(parsed.timestamp).toBeDefined();
      expect(parsed.level).toBe('ERROR');
      expect(parsed.message).toBe('Error occurred');
    });
  });
});
