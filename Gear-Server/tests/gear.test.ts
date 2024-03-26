import { mongodb } from '../src/db/mongo';
import assert from 'assert';
import { gearsService } from '../src/services/gears';
import aes from '../src/encryption/aes';

describe('Gear', async () => {
    describe('base', async () => {
        let res: any;

        before(async () => {
            console.log('before');
            await mongodb.connect();
        });

        after(async () => {
            mongodb.close();
        });

        it.only('creat index', async () => {
            res = await gearsService.createIndex();
        });

        it('save', async () => {
            const params = {
                owner: '0xef6191a5c8e983da45dac2a787d49fe3f2b6d54e',
                name: 'translate local',
                description: 'translate',
                requestType: 'POST',
                requestHeaders: undefined,
                requestParams: { text: '' },
                price: '10000000000000000',
                denom: '0x0000000000000000000000000000000000000000',
                logoFile: '',
            };
            const result = await gearsService.insertOne(params);
            console.log('result', result.uid);
        });
        it('aes', async () => {
            const encryptURL = aes.encrypt('https://api.gear.world/v1/ai/text-to-en');
            console.log('aes', encryptURL);
        });
    });
});
