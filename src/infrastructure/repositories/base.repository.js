import Logger from '../logger/logger.js';

/**
 * Base repository class providing transaction management
 * @class BaseRepository
 */
export default class BaseRepository {
  /**
   * Creates an instance of BaseRepository
   * @param {*} db - Database connection instance
   */
  constructor(db) {
    this.db = db;
    this.logger = new Logger(this.constructor.name);
    this.trx = null;
    this.isTransactionOwner = false;
  }

  /**
   * Starts a new database transaction
   * @returns {Promise<*>} Transaction object
   */
  async startTransaction() {
    if (this.trx) {
      return this.trx;
    }

    this.trx = await this.db.transaction();
    this.isTransactionOwner = true;

    return this.trx;
  }

  /**
   * Commits the current transaction
   * @returns {Promise<void>}
   */
  async commitTransaction() {
    if (!this.trx) {
      this.logger.warn('No transaction to commit');

      return;
    }

    if (!this.isTransactionOwner) {
      return;
    }

    await this.trx.commit();
    this.trx = null;
    this.isTransactionOwner = false;
  }

  /**
   * Rolls back the current transaction
   * @returns {Promise<void>}
   */
  async rollbackTransaction() {
    if (!this.trx) {
      this.logger.warn('No transaction to rollback');

      return;
    }

    if (!this.isTransactionOwner) {
      return;
    }

    await this.trx.rollback();
    this.trx = null;
    this.isTransactionOwner = false;
  }

  /**
   * Sets an external transaction for this repository
   * @param {*} trx - Transaction object from another repository
   * @returns {void}
   */
  setTransaction(trx) {
    this.trx = trx;
    this.isTransactionOwner = false;
  }
}
