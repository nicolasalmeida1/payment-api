/**
 * Logger class for structured JSON logging
 * @class Logger
 */
class Logger {
  /**
   * Creates an instance of Logger
   * @param {string} [context=''] - Logger context (e.g., class name)
   */
  constructor(context = '') {
    this.context = context;
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
  }

  /**
   * Checks if a log level should be logged based on current log level
   * @param {LogLevel} level - Log level to check
   * @returns {boolean} True if should log
   */
  shouldLog(level) {
    return this.levels[level] >= this.levels[this.logLevel];
  }

  /**
   * Formats a log message as JSON
   * @param {LogLevel} level - Log level
   * @param {string} message - Log message
   * @param {LogMetadata} [meta={}] - Additional metadata
   * @returns {string} Formatted JSON log string
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logObject = {
      timestamp,
      level: level.toUpperCase(),
      context: this.context,
      message,
      ...meta,
    };

    return JSON.stringify(logObject);
  }

  /**
   * Logs a debug message
   * @param {string} message - Log message
   * @param {LogMetadata} [meta={}] - Additional metadata
   * @returns {void}
   */
  debug(message, meta = {}) {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, meta));
    }
  }

  /**
   * Logs an info message
   * @param {string} message - Log message
   * @param {LogMetadata} [meta={}] - Additional metadata
   * @returns {void}
   */
  info(message, meta = {}) {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, meta));
    }
  }

  /**
   * Logs a warning message
   * @param {string} message - Log message
   * @param {LogMetadata} [meta={}] - Additional metadata
   * @returns {void}
   */
  warn(message, meta = {}) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  /**
   * Logs an error message
   * @param {string} message - Log message
   * @param {LogMetadata} [meta={}] - Additional metadata
   * @returns {void}
   */
  error(message, meta = {}) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, meta));
    }
  }

  /**
   * Sets a new context for the logger
   * @param {string} context - New context value
   * @returns {void}
   */
  setContext(context) {
    this.context = context;
  }
}

export default Logger;
