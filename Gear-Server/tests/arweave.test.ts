import { arweave, ARWEAVE_CONTENT_TYPE } from "../src/storage/arweave";
import fs from "fs";

describe("arweave", async () => {
  it("static_data", async () => {
    console.log(arweave.url);
    console.log(arweave.token);
  });

  it("uploadData_json", async () => {
    const data = {
      "name": "AITest #6",
      "symbol": "AIT",
      "description": "Here is a test metadata.",
      "external_url": "https://twitter.com/test-user",
      "seller_fee_basis_points": 0,
      "image": "https://arweave.net/YIGAaXStnCfJyqIqXSJfcapgLliXQhCBOAk2Yvt2DAs?ext=png",
      "attributes": [],
      "properties": {
        "files": [],
        "category": "image"
      }
    };
    let res = await arweave.uploadData(JSON.stringify(data), ARWEAVE_CONTENT_TYPE.JSON);
    console.log(`Data uploaded ==> https://arweave.net/${res}`);
  });

  it("uploadData_png", async () => {
    let fileBuffer = await fs.readFileSync(
      __dirname + "/../src/images/nft.png"
    );
    let res = await arweave.uploadData(fileBuffer, ARWEAVE_CONTENT_TYPE.PNG);
    console.log(`Data uploaded ==> https://arweave.net/${res}`);
  });

  it('getLoadedBalance', async () => {
    let res = await arweave.getLoadedBalance();
    console.log(res)
  })
});
