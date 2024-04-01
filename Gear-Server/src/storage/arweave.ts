import Irys from "@irys/sdk";
import { APP_ENV } from "../constants"

class Arweave {
    public url: string;
    public token: string;
    public providerUrl: string;
    private _irys: Irys;

    /**
     * @dev The key is arweave wallet JSON string.
     * you can create the wallet.json by command:
     * node -e "require('arweave').init({}).wallets.generate().then(JSON.stringify).then(console.log.bind(console))" > wallet.json
     */
    constructor(key: string, url: string, token: string, providerUrl: string) {
        this.url = url;
        this.token = token;
        this.providerUrl = providerUrl
        this._irys = new Irys({
            url, // URL of the node you want to connect to
            token, // Token used for payment
            key, // EVM private key
            config: { providerUrl }, // Optional provider URL, only required when using Devnet
        });
    }

    async getBalance(user: string) {
        return await this._irys.getBalance(user)
    }

    async getLoadedBalance() {
        return await this._irys.getLoadedBalance()
    }

    async uploadData(data: string | Buffer, type?: string): Promise<any> {
        try {
            if (!type) {
                type = "application/json";
            }

            // Fund the node
            // The size is less than 100 KiB are free.
            const size = Buffer.byteLength(data, 'utf8');
            if (size / 1024 > 100) {
                const price = await this._irys.getPrice(size);
                console.log(`Uploading ${size} bytes costs ${this._irys.utils.fromAtomic(price)} ${this.token}`);
                await this._irys.fund(price);
            }

            const receipt = await this._irys.upload(data, {
                tags: [{ name: "Content-Type", value: type }]
            });
            return { url: receipt.id, txhash: receipt.signature };
        } catch (e) {
            console.log("Arweave upload data error: ", e);
            throw e
        }
    }

    async uploadFile(filePath: string): Promise<string> {
        try {
            const receipt = await this._irys.uploadFile(filePath)
            // console.log(`Data uploaded ==> https://arweave.net/${receipt.id}`);
            return receipt.id;
        } catch (e) {
            console.log("Arweave upload data error: ", e);
            throw e
        }
    }

    async uploadFolder(foldPath: string): Promise<string | undefined> {
        try {
            const receipt = await this._irys.uploadFolder("./" + foldPath, {
                indexFile: "", // optional index file (file the user will load when accessing the manifest)
                batchSize: 50, //number of items to upload at once
                keepDeleted: false, // whether to keep now deleted items from previous uploads
            });
            // console.log(`Data uploaded ==> https://arweave.net/${receipt.id}`);
            return receipt?.id
        } catch (e) {
            console.log("Arweave upload data error: ", e);
            throw e
        }
    }
}

export const arweave = new Arweave(
    APP_ENV.ARWEAVE.PRIVATE_KEY,
    APP_ENV.ARWEAVE.URL,
    APP_ENV.ARWEAVE.TOKEN,
    APP_ENV.ARWEAVE.PROVIDER_URL
)