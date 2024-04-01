import { Document } from 'bson';

export type PageResult = {
    total: number;
    pages: number;
    data: any[];
};

export enum manualPointType {
    award = 'award',
}

export type CursorResult = {
    next: any;
    previous: any;
    data: any[];
    total: number;
};

export interface IBaseService {
    table: string;
    filed_for_create_time: string | undefined;
    filed_for_update_time: string | undefined;

    createIndex(): Promise<Document>;

    indexInformation(): Promise<Document>;

    findOne(where: {}): Promise<any>;

    save(data: any, where?: {}): Promise<any>;

    insertOne(data: any): Promise<any>;

    insertMany(data: any[]): Promise<any>;

    modifyOne(data: any, where?: {}): Promise<any>;

    updateOne(where: any, data: any): Promise<any>;

    delete(where: {}): Promise<any>;

    page(where?: {}, size?: number, page?: number): Promise<PageResult>;

    cursor(where?: {}, limit?: number, cursor?: any, sort?: any): Promise<CursorResult>;
}

export type CreateGearRequest = {
    owner: string; // Wallet address
    name: string; // Name
    description: string; // Description
    requestURL: string; // Request URL
    requestType: string; // Type GET/POST
    requestHeaders?: any; // option { "Content-Type": "application/json", "Accept-Encoding": "gzip, deflate, br" }
    requestParams?: any; // { "paramA": "", "paramB": "", "paramC": "" }
    price: string; // 0.175 USDT => 0.175 * 10**18 USDT
    denom: string; // Token address [SOL_address, USDT_address]
    logoFile: any; // https://gnfd-testnet-sp3.bnbchain.org/view/bucket-name/object-fold-name/object-name
};

export type CreateGearResponse = {
    gearId: string;
    name: string;
    symbol: string;
    tokenURL: string;
    encryptURL: string;
    denom: string;
    price: string;
};

export type UpdateGearRequest = {
    gearId: string;
    tokenId: string;
    gearAddress: string;
    txhash: string;
};

export type UpdateGearResponse = {
    gearId: string;
};

export type CallGearRequest = {
    user: string; // Wallet address
    gearId: string;
    txhash: string;
    params: any;
    onlineStatus: number;
    encryptURL: string;
};

export type CallGearResponse = {
    callId: string;
    output: string;
};
