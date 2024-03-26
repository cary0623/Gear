import { Router } from 'express';
import Result from '../utils/result';
import { CreateGearRequest, CallGearRequest, CallGearResponse, CreateGearResponse } from '../typing';
import axios, { AxiosRequestConfig, Method } from 'axios';
import { arweave, ARWEAVE_CONTENT_TYPE } from '../storage/arweave'
import aes from '../encryption/aes';
import { gearsService } from '../services/gears';
import { callHistoryService } from '../services/call_history';

const router: Router = Router();

// Handle the request
async function makeRequest(metadata: { requestUrl: string; requestType: string; requestHeaders?: { [key: string]: string }; requestParams?: { [key: string]: string | number } }): Promise<any> {
    try {
        // Build the Axios request configuration
        const config: AxiosRequestConfig = {
            method: metadata.requestType as Method,
            url: metadata.requestUrl,
        };

        // If requestHeaders exist, add them to the configuration
        if (metadata.requestHeaders) {
            config.headers = metadata.requestHeaders;
        }

        // If requestParams exist, add them to the configuration
        if (metadata.requestParams) {
            config.params = metadata.requestParams;
            if (metadata.requestType.toUpperCase() === 'GET' || metadata.requestType.toUpperCase() === 'DELETE') {
                // For GET and DELETE, parameters are typically sent as query strings
                config.params = metadata.requestParams;
            } else if (metadata.requestType.toUpperCase() === 'POST' || metadata.requestType.toUpperCase() === 'PUT' || metadata.requestType.toUpperCase() === 'PATCH') {
                // For POST, PUT, and PATCH, parameters are typically sent in the request body
                config.data = metadata.requestParams;
            }
        }

        // Send the request
        const response = await axios(config);

        // Output the response data
        if (response.request.res.statusCode == 200) {
            if (response.data.data) {
                return response.data.data;
            } else {
                return response.data;
            }
        } else {
            return {
                satatusCode: response.request.res.statusCode,
                statusMessage: response.request.res.statusMessage,
            };
        }
    } catch (error: any) {
        if (error.code) {
            // console.log('=============debug: parse error')
            return {
                satatusCode: error.request.res.statusCode,
                statusMessage: error.request.res.statusMessage,
            };
        }
        throw error;
    }
}

router.post('/gear-list', async (req: any, res) => {
    try {
        const { text, owner, tokenIds } = req.body;

        const filter: Record<string, any> = { $and: [{ txhash: { $exists: true } }] };
        if (text) {
            filter.$and.push({
                $or: [
                    {
                        name: {
                            $regex: new RegExp(text, 'i'),
                        },
                    },
                    {
                        owner: {
                            $regex: new RegExp(text),
                        },
                    },
                ],
            });
        } else if (tokenIds) {
            filter.$and.push({
                tokenId: {
                    $in: tokenIds,
                },
            });
        } else if (owner) {
            filter.$and.push({
                owner: owner.toLowerCase(),
            });
        }
        // console.log('filter', filter, JSON.stringify(filter));
        const list = await gearsService.findAll(filter);
        res.send(Result.success(list));
    } catch (e: any) {
        res.send(Result.err(500, e.message || String(e)));
    }
});

router.get('/call-history', async (req: any, res) => {
    try {
        const { owner } = req.query;
        if (!owner) throw new Error('Invalid parameter');
        const filter = { owner };
        const sort = { created_at: -1 };
        const history = await callHistoryService.findAll(filter, sort);

        const ids = history.map(ele => ele.gearId);
        const gears = await gearsService.populateGearId(ids);
        const gearsMap = new Map(gears.map(item => [item.gearId, item]));

        const _list = history.map(ele => {
            const gear = gearsMap.get(ele.gearId);
            return Object.assign(ele, { info: gear });
        });

        res.send(Result.success(_list));
    } catch (e: any) {
        res.send(Result.err(500, e.message || String(e)));
    }
});

router.post('/create-gear', async (req: any, res) => {
    try {
        const { owner, name, description, requestType, requestHeaders, requestParams, requestURL, price, denom, tokeninfo }: CreateGearRequest = req.body;

        if (!owner || !name || !description || !requestType || !requestParams || !requestURL || !price || !denom || !tokeninfo) throw new Error('Invalid parameter');
        if (!req.files?.['logoFile']) throw new Error('Invalid logoFile');

        try {
            JSON.parse(requestParams);
        } catch (e: any) {
            throw new Error('Invalid requestParams');
        }

        let params: { [key: string]: string } = {};
        Object.keys(JSON.parse(requestParams)).forEach(ele => {
            params[ele] = '';
        });

        // console.log('params:::', params)

        let date = new Date().getTime().toString();

        // Upload logoFile to arweave
        const logoFile = req.files['logoFile'];
        let uploadLogoRes = await arweave.uploadData(logoFile.data, ARWEAVE_CONTENT_TYPE.PNG)

        // Encrypt request path
        const encryptURL = aes.encrypt(requestURL);

        // Upload metaData to bnb-greenfield
        let metadata: { [key: string]: any } = {
            owner: owner.toLowerCase(),
            name,
            description,
            requestType,
            requestHeaders,
            requestParams: params,
            price,
            denom,
            encryptURL,
            tokeninfo: JSON.parse(tokeninfo),
            logoFile: uploadLogoRes.url,
            image: "" // TODO
        };
        let uploadMetaRes = await arweave.uploadData(Buffer.from(JSON.stringify(metadata), 'utf-8'), ARWEAVE_CONTENT_TYPE.JSON);

        // Save into db
        metadata['metadataTxhash'] = uploadMetaRes.txhash;
        metadata['metadataObjectId'] = uploadMetaRes.url;
        let saved = await gearsService.insertOne(metadata);

        // Return
        const result: CreateGearResponse = {
            gearId: saved.gearId,
            tokenURL: uploadMetaRes.url,
            encryptURL: encryptURL,
            denom: saved.denom,
            price: saved.price,
        };
        res.send(Result.success(result));
    } catch (e: any) {
        res.send(Result.err(500, e.message || String(e)));
    }
});

router.post('/update-gear', async (req: any, res) => {
    try {
        const { tokenId, gearAddress, txhash, gearId } = req.body;

        if (!tokenId || !gearAddress || !txhash || !gearId) throw new Error('Invalid parameter');

        const update = {
            tokenId,
            gearAddress,
            txhash,
        };

        await gearsService.findOneAndUpdate({ gearId }, { $set: update });
        res.send(Result.success('success'));
    } catch (e: any) {
        res.send(Result.err(500, e.message || String(e)));
    }
});

router.post('/call-gear', async (req: any, res) => {
    try {
        const { user, gearId, txhash, params, onlineStatus }: CallGearRequest = req.body;

        if (!gearId || !txhash || !params || ![0, 1].includes(onlineStatus)) throw new Error('Invalid parameter');

        // Find the raw from db
        let gearRaw = await gearsService.findOne({ gearId });
        if (!gearRaw) throw new Error('Not Found');

        // Decrypt request URL
        const requestUrl = aes.decrypt(gearRaw.encryptURL);

        // Handle the request
        let response = await makeRequest({
            requestUrl,
            requestType: gearRaw.requestType,
            requestParams: params,
        });

        const log = {
            user: user.toLowerCase(),
            gearAddress: gearRaw.gearAddress,
            txhash: txhash,
        };
        const logFileName = txhash + '.json';
        let uploadLogRes: any, errorMsg: any;

        // Upload log into bnb-greenfield
        try {
            uploadLogRes = await arweave.uploadData(Buffer.from(JSON.stringify(log), 'utf-8'), ARWEAVE_CONTENT_TYPE.JSON);
        } catch (e: any) {
            errorMsg = e.message || 'createObject error';
            throw new Error(errorMsg);
        }

        // Save into db
        let callRaw = {
            gearId,
            params: params,
            txhash: txhash,
            result: response,
            logTxhash: uploadLogRes ? uploadLogRes.txhash : '',
            owner: user,
            onlineStatus,
        };
        let saved = await callHistoryService.insertOne(callRaw);

        // Return
        const result: CallGearResponse = {
            callId: saved.txhash,
            output: response,
        };
        res.send(Result.success(result));
    } catch (e: any) {
        res.send(Result.err(500, e.message || String(e)));
    }
});

export default router;
