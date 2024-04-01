import { arweave } from "../src/storage/arweave";
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
    let res = await arweave.uploadData(JSON.stringify(data));
    console.log(`Data uploaded ==> https://arweave.net/${res}`);
  });

  it("uploadData_png", async () => {
    let fileBuffer = await fs.readFileSync(
      __dirname + "/../src/images/nft.png"
    );
    let res = await arweave.uploadData(fileBuffer, "image/png");
    console.log(`Data uploaded ==> https://arweave.net/${res.url}`); // https://arweave.net/t3LLszbFIYvzDa8llqnZ53SmQ_7l_7MJGroFUu9QCNg
    console.log(`Data uploaded ==> ${res.txhashl}`);
  });

  it('getLoadedBalance', async () => {
    let res = await arweave.getLoadedBalance();
    console.log(res)
  })
});
