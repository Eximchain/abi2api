# abi2api (under construction)

Autogenerate a `nodejs` server with a RESTful [OpenAPI](https://swagger.io/specification/) so you can communicate with your smart contract of choice via [web3](https://github.com/ethereum/web3.js/).  Encapsulate your smart contract so you can leverage the power of blockchain with the convenience of HTTP.

## Usage
`abi2api` is a simple CLI, it has one command which takes two arguments:

```
abi2api <path_to_contract_json> <server_output_folder> [options]
```

The paths should be relative to wherever you are calling the command.  Options let you specify config values right from the command line, or provide the path to a config JSON.  You can learn more by running `abi2api --help` after installation.

After running the command, your chosen output path will then contain a file structure like:

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

`abi2api` converts ABIs on a function-by-function bases using [`abi2oas`](https://github.com/Eximchain/abi2oas#method-mapping).  You can learn more there about the details of how each function is converted.

## Installation
Install the package globally from npm using your favorite package manager:

```
npm install -g abi2api

// OR

yarn global add abi2api
```

You will also need to Java (v7 or higher) installed, as this tool depends on [Swagger Codegen v2.2.1](https://swagger.io/docs/swagger-tools/).

## Config
The config JSON is generally optional, you only have to use it if you want to create custom OpenAPI tags.  The config would look something like this:

```
sample configuration...
{
  "version": "1.0.0",           // Optional: API Version for Swagger
  "schemes": ["https"],         // Optional: Allowed Access Schemes for Swagger
  "host": "localhost:8080",     // Optional: Host for Swagger
  "basePath": "/",              // Optional: Base Path for Swagger
  "eth": {                      // Optional: Ethereum Configuration
    "provider": "http://localhost:8545", // Optional: Web3 provider
    "default_gas": 0,                    // Optional: Default Gas for transactions
    "default_gasPrice": 40               // Optional: Default Gas Price for transactions
  },
  "tags": [... Optional: custom Swagger tags, see below ...],
  "api": {... Optional: custom Swagger tag config, see below ...}
}
```

`abi2api` will use the above values as defaults for the `version`, `schemes`, `host`, `basePath`, and `eth` keys.  The `tags` and `api` keys let you create additional Swagger tags and connect them to contract methods, you can find more information in the relevant section of [`abi2oas`](https://github.com/Eximchain/abi2oas#custom-tags).

## How It Works
`abi2api` builds a server for your web contract by leveraging the [OpenAPI Spec](https://swagger.io/specification/) and [Swagger Codegen](https://swagger.io/swagger-codegen/), along with some custom sauce cooked up in-house at [Eximchain](https://eximchain.com/):
1. Your smart contract's metadata gets passed through [`abi2oas`](https://github.com/Eximchain/abi2oas), an Eximchain library which generates a JSON according to the OpenAPI spec.
2. The resulting JSON is passed through `swagger-codegen-cli@2.2.1` to generate the `nodejs` server stub code.  These methods do not yet communicate with web3.
3. Your smart contract's metadata then passes through [`abi2lib`](https://github.com/Eximchain/abi2lib), an Eximchain library which generates boilerplate `web3` calls matching the contract spec.
4. Finally, `abi2api` does some cleanup work to join the `nodejs` server stubs from Swagger with the boilerplate web3 calls from `abi2lib`.

## Roadmap
### Short-Term
- [x] Refactor base code into separate module
- [x] Clean up docs
- [x] User-friendly command parsing via `commander`
- [x] End-to-end build in one command
- [] Write test cases

### Long-Term
- [] Building automatic web3 bridges for a broader set of Swagger server languages
- [] Allow output to use either web3 or quorum

### Low-Priority Tech Debt
- [] Add option to autogenerate output directory if it doesn't exist

## Licensing
`abi2api` is developed & maintained by [Eximchain](https://eximchain.com/), released for public use under the Apache-2.0 License.  

Output from `abi2api` uses the same license.