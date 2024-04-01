import { mongodb } from '../db/mongo';
import { Document } from 'bson';
import { BaseService } from './base';

class GearCallHistoryService extends BaseService {
    async createIndex(): Promise<Document> {
        try {
            await mongodb.dba.createIndex(this.table, { user: 1 }, { unique: false, name: 'idx_user' });
            await mongodb.dba.createIndex(this.table, { gearId: 1 }, { unique: false, name: 'idx_gear_id' });
            await mongodb.dba.createIndex(this.table, { created_at: -1 }, { unique: false, name: 'idx_created_at' });
            await mongodb.dba.createIndex(this.table, { txhash: 1 }, { unique: true, name: 'idx_txhash' });
        } catch (e) {
        } finally {
            return await this.indexInformation();
        }
    }
}

export const gearCallHistoryService = new GearCallHistoryService('gear_call_history', 'created_at', 'updated_at');
