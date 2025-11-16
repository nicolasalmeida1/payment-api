import Logger from '../logger/logger.js';

export default class BaseRepository {
  constructor(db) {
    this.db = db;
    this.logger = new Logger(this.constructor.name);
    this.trx = null;
    this.isTransactionOwner = false;
  }

  async startTransaction() {
    if (this.trx) {
      this.logger.debug('Reusing existing transaction');

      return this.trx;
    }

    this.logger.debug('Starting new transaction');
    this.trx = await this.db.transaction();
    this.isTransactionOwner = true;

    return this.trx;
  }

  async commitTransaction() {
    if (!this.trx) {
      this.logger.warn('No transaction to commit');

      return;
    }

    if (!this.isTransactionOwner) {
      this.logger.debug('Not transaction owner, skipping commit');

      return;
    }

    this.logger.debug('Committing transaction');
    await this.trx.commit();
    this.trx = null;
    this.isTransactionOwner = false;
  }

  async rollbackTransaction() {
    if (!this.trx) {
      this.logger.warn('No transaction to rollback');

      return;
    }

    if (!this.isTransactionOwner) {
      this.logger.debug('Not transaction owner, skipping rollback');

      return;
    }

    this.logger.debug('Rolling back transaction');
    await this.trx.rollback();
    this.trx = null;
    this.isTransactionOwner = false;
  }

  setTransaction(trx) {
    this.trx = trx;
    this.isTransactionOwner = false;
  }
}
