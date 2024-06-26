import { mongodb } from '../src/db/mongo';
import { gearCallHistoryService } from '../src/services/call_history';

describe('CallHistory', async () => {
    describe('base', async () => {
        let res: any;

        before(async () => {
            console.log('before');
            await mongodb.connect();
        });

        after(async () => {
            mongodb.close();
        });

        it('creat index', async () => {
            res = await gearCallHistoryService.createIndex();
        });
    });
});
