import { Repository } from '@/core/types/database';
import { ReadiwiDatabase } from './database-simple';

export abstract class BaseRepository<T extends { id?: number }> implements Repository<T> {
  constructor(
    protected db: ReadiwiDatabase,
    protected tableName: string
  ) {}

  protected get table() {
    return (this.db as any)[this.tableName];
  }

  async create(entity: Omit<T, 'id'>): Promise<number> {
    try {
      const id = await this.table.add(entity);
      return id;
    } catch (error) {
      throw new Error(`Failed to create ${this.tableName}: ${error}`);
    }
  }

  async findById(id: number): Promise<T | undefined> {
    try {
      return await this.table.get(id);
    } catch (error) {
      throw new Error(`Failed to find ${this.tableName} by id ${id}: ${error}`);
    }
  }

  async findAll(): Promise<T[]> {
    try {
      return await this.table.toArray();
    } catch (error) {
      throw new Error(`Failed to find all ${this.tableName}: ${error}`);
    }
  }

  async update(id: number, updates: Partial<T>): Promise<void> {
    try {
      await this.table.update(id, updates);
    } catch (error) {
      throw new Error(`Failed to update ${this.tableName} ${id}: ${error}`);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.table.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete ${this.tableName} ${id}: ${error}`);
    }
  }

  async count(): Promise<number> {
    try {
      return await this.table.count();
    } catch (error) {
      throw new Error(`Failed to count ${this.tableName}: ${error}`);
    }
  }

  async exists(id: number): Promise<boolean> {
    try {
      const item = await this.table.get(id);
      return item !== undefined;
    } catch (error) {
      throw new Error(`Failed to check if ${this.tableName} ${id} exists: ${error}`);
    }
  }

  async bulkCreate(entities: Omit<T, 'id'>[]): Promise<number[]> {
    try {
      return await this.table.bulkAdd(entities, { allKeys: true });
    } catch (error) {
      throw new Error(`Failed to bulk create ${this.tableName}: ${error}`);
    }
  }

  async bulkUpdate(updates: Array<{ id: number; updates: Partial<T> }>): Promise<void> {
    try {
      // @ts-ignore - Progressive development, Dexie transaction method
      await this.db.transaction('rw', this.table, async () => {
        for (const { id, updates: updateData } of updates) {
          await this.table.update(id, updateData);
        }
      });
    } catch (error) {
      throw new Error(`Failed to bulk update ${this.tableName}: ${error}`);
    }
  }

  async bulkDelete(ids: number[]): Promise<void> {
    try {
      await this.table.bulkDelete(ids);
    } catch (error) {
      throw new Error(`Failed to bulk delete ${this.tableName}: ${error}`);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.table.clear();
    } catch (error) {
      throw new Error(`Failed to clear ${this.tableName}: ${error}`);
    }
  }

  protected async executeTransaction<R>(
    operation: () => Promise<R>
  ): Promise<R> {
    try {
      // @ts-ignore - Progressive development, Dexie transaction method
      return await this.db.transaction('rw', this.table, operation);
    } catch (error) {
      throw new Error(`Transaction failed for ${this.tableName}: ${error}`);
    }
  }
}