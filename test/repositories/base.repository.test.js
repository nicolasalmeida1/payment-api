import { jest } from '@jest/globals';
import BaseRepository from '../../src/infrastructure/repositories/base.repository.js';

describe('BaseRepository', () => {
  let repository;
  let mockDb;
  let mockTrx;

  beforeEach(() => {
    mockTrx = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
    };

    mockDb = {
      transaction: jest.fn().mockResolvedValue(mockTrx),
    };

    repository = new BaseRepository(mockDb);
  });

  describe('constructor', () => {
    it('should initialize with null transaction', () => {
      expect(repository.trx).toBeNull();
      expect(repository.isTransactionOwner).toBe(false);
    });

    it('should initialize with database instance', () => {
      expect(repository.db).toBe(mockDb);
    });

    it('should initialize logger', () => {
      expect(repository.logger).toBeDefined();
    });
  });

  describe('startTransaction', () => {
    it('should start a new transaction', async () => {
      const trx = await repository.startTransaction();

      expect(mockDb.transaction).toHaveBeenCalled();
      expect(trx).toBe(mockTrx);
      expect(repository.trx).toBe(mockTrx);
      expect(repository.isTransactionOwner).toBe(true);
    });

    it('should reuse existing transaction', async () => {
      await repository.startTransaction();
      const trx = await repository.startTransaction();

      expect(mockDb.transaction).toHaveBeenCalledTimes(1);
      expect(trx).toBe(mockTrx);
    });
  });

  describe('commitTransaction', () => {
    it('should commit transaction when owner', async () => {
      await repository.startTransaction();
      await repository.commitTransaction();

      expect(mockTrx.commit).toHaveBeenCalled();
      expect(repository.trx).toBeNull();
      expect(repository.isTransactionOwner).toBe(false);
    });

    it('should not commit when no transaction', async () => {
      await repository.commitTransaction();

      expect(mockTrx.commit).not.toHaveBeenCalled();
    });

    it('should not commit when not owner', async () => {
      repository.setTransaction(mockTrx);
      await repository.commitTransaction();

      expect(mockTrx.commit).not.toHaveBeenCalled();
    });
  });

  describe('rollbackTransaction', () => {
    it('should rollback transaction when owner', async () => {
      await repository.startTransaction();
      await repository.rollbackTransaction();

      expect(mockTrx.rollback).toHaveBeenCalled();
      expect(repository.trx).toBeNull();
      expect(repository.isTransactionOwner).toBe(false);
    });

    it('should not rollback when no transaction', async () => {
      await repository.rollbackTransaction();

      expect(mockTrx.rollback).not.toHaveBeenCalled();
    });

    it('should not rollback when not owner', async () => {
      repository.setTransaction(mockTrx);
      await repository.rollbackTransaction();

      expect(mockTrx.rollback).not.toHaveBeenCalled();
    });
  });

  describe('setTransaction', () => {
    it('should set transaction without being owner', () => {
      repository.setTransaction(mockTrx);

      expect(repository.trx).toBe(mockTrx);
      expect(repository.isTransactionOwner).toBe(false);
    });
  });
});
