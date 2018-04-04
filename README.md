# abi2api (under construction)

Autogenerate a `nodejs` server with a RESTful [OpenAPI](https://swagger.io/specification/) so you can communicate with your smart contract of choice via [web3](https://github.com/ethereum/web3.js/).  Encapsulate your smart contract so you can leverage the power of blockchain with the convenience of HTTP.

## Usage
`abi2api` is a simple CLI, it has one command which takes two arguments:

```
abi2api <path_to_config_json> <server_output_path>
```

The paths should be relative to wherever you are calling the command.  `abi2api` will then convert your smart contract (specified in the config) on a function-by-function basis.  Your chosen output path will now contain a file structure like:

- `/api`
  - `swagger.yaml` : YAML version of output OpenAPI spec
- `/controllers`
  - `contractFxnAScope.js` : File connecting /contractFxnA to a dedicated resolver
  - `contractFxnAScopeService.js` : File which uses our generic ethereum connector to make actual web3 calls to FxnA on our contract
  - ... more files for other contract fxns...
- `/utils`
  - `writer.js` : Swagger util for writing to HTTP requests
- `index.js` : Boilerplate code for running a `connect` server with all Swagger features set up.
- `package.json` : Boilerplate values from Swagger
- `README.md` : Boilerplate text from Swagger

You can find a more thorough explanation of how abi2api maps smart contracts to an OpenAPI spec over at the [`abi2oas`](https://github.com/Eximchain/abi2oas#method-mapping) repository.

## Installation
Install the package globally from npm using your favorite package manager:

```
npm install -g abi2api

// OR

yarn global add abi2api
```

You will also need to Java (v7 or higher) installed, as this tool depends on [Swagger Codegen v2.2.1](https://swagger.io/docs/swagger-tools/).

## Config
The configuration JSON is the key to using `abi2api`.  It would look something like this (comments just added for explanation):

```
sample configuration...
{
  "version": "1.0.0",           // Required: API Version for Swagger
  "schemes": ["https"],         // Optional: Allowed Access Schemes for Swagger
  "host": "localhost:8080",     // Optional: Host for Swagger
  "basePath": "/",              // Optional: Base Path for Swagger
  "contract": "<path_to_contract_metadata.json>", // Required: Relative to directory of config file
  "tags": [... Optional: custom Swagger tags, see below ...],
  "api": {... Optional: custom Swagger tag config, see below ...},
  "eth": {                      // Required: Ethereum Configuration
    "provider": "http://localhost:8545", // Required: Web3 provider
    "default_gas": 0,                    // Required: Default Gas for transactions
    "default_gasPrice": 40               // Required: Default Gas Price for transactions
  }
}
```

If `schemes`, `host`, or `basePath` are left blank, then `abi2api` will use the values shown above.  The `tags` and `api` keys let you create additional Swagger tags and connect them to contract methods, you can find more information in the relevant section of [`abi2oas`](https://github.com/Eximchain/abi2oas#custom-tags).

## How It Works
`abi2api` builds a server for your web contract by leveraging the [OpenAPI Spec](https://swagger.io/specification/) and [Swagger Codegen](https://swagger.io/swagger-codegen/), along with some custom sauce cooked up in-house at [Eximchain](https://eximchain.com/):
1. Your smart contract's metadata gets passed through [`abi2oas`](https://github.com/Eximchain/abi2oas), an Eximchain library which generates a JSON according to the OpenAPI spec.
2. The resulting JSON is passed through `swagger-codegen-cli@2.2.1` to generate the `nodejs` server stub code.  These methods do not yet communicate with web3.
3. Your smart contract's metadata then passes through [`abi2lib`](https://github.com/Eximchain/abi2lib), an Eximchain library which generates boilerplate `web3` calls matching the contract spec.
4. Finally, `abi2api` does some cleanup work to join the `nodejs` server stubs from Swagger with the boilerplate web3 calls from `abi2lib`.

## Licensing
`abi2api` is developed & maintained by [Eximchain](https://eximchain.com/), released for public use under the Apache-2.0 License.  

Output from `abi2api` uses the same license.