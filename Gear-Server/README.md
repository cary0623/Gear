# Gear-Server

This repository is the server code for the Gear project. The server-side operates as a crucial hub for gear management, facilitating both the creation and invocation phases. It also plays a critical role in third-party call handling, parsing user inputs and returned data effectively. With Arweave integration, operational excellency is ensured, as an on-chain evidence system oversees all procedures. This storeroom of functionalities streams together the comprehensive landscape of our project's server component.

## Getting Started

### Prerequisites

- [NodeJs](https://nodejs.org/en/download) (v18.17.0 is better)

- [MongoDB Docker](https://www.mongodb.com/compatibility/docker)

- yarn

### Installation

```sh
git clone https://github.com/cary0623/Gear-Server.git

cd Gear-Server

yarn

cp ./env.example .env # Please set up the environment configuration before running.
```

## Usage

Dev
```sh
yarn devwww # Run the server in dev mode.
```

Run
```sh
yarn build

node dist/src/www.js
```

## Running the tests

```sh
yarn test tests/gear.test.ts
```

