# Gear-Contract
This repository is the contract code for the Gear project. The contract hanlde the instructions from both user and creators. The contract ensure the transactions execution invoke successed.
# Geting Started
## Prerequisites
- anchor-cli 0.29.0
- solana-cli 1.17.18
- cargo 1.76.0
- npm
## Installation

```sh
git clone https://github.com/cary0623/Gear.git

cd Gear-Contract

npm install
```
## Change to your key pair
```sh
cd Gear-Contract
```
In the Anchor.toml

change the YOUR_SOLANA_KEY_PAIR_PATH to your own path
```
[provider]
wallet = "/{YOUR_SOLANA_KEY_PAIR_PATH}/id.json"
```

## Deploy on Devnet and test

```sh
cd Gear-Contract

// regenerate the program id
solana-keygen new -o ./target/deploy/gear_protocol-keypair.json --force

// sync the program id
anchor keys sync

anchor build

anchor test
```

