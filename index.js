#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const package = JSON.parse(fs.readFileSync(path.resolve(__dirname, './package.json')));

const program = require('commander');
const shell = require('shelljs');
const dotProp = require('dot-prop');

const abi2oas = require('abi2oas');
const abi2lib = require('abi2lib');

const SwaggerServiceGenerator = require('./SwaggerServiceGenerator');
const util = require('./util');

program
    .version(package.version)
    .name(package.name)
    .description(package.description)
    .usage('<contract_path> <output_dir> [options]')
    .option('-C, --config <config_path>', 'Specify path to config.json from current working directory.  If other options are also specified, they will override values in file.')
    .option('-v, --apiVersion <version>', 'Specify a version for your new API; defaults to 1.0.0.')
    .option('-h, --host <host>', 'Specify a hostname for your new OpenAPI; defaults to "localhost:8080"')
    .option('-b, --base <base>', 'Specify a base path for your new OpenAPI; defaults to "/" .')
    .option('-P, --provider <provider>', 'Specify the Web3 provider for your OpenAPI; defaults to "localhost:8545".')
    .option('-p, --price <price>', "Set default gas price, must be int; defaults to 40.", parseInt)
    .option('-g, --gas <gas>', 'Specify default gas, must be int; defaults to 0.', parseInt)
    .option('-s, --schemas <schemas...>', 'Specify default schemas as a comma-separated list, no spaces; defaults to "https".', (str)=>str.split(','))
    .action((contract_path, output_dir, options) => {
        buildServer(contract_path, output_dir, buildOptionConfig(options));
    })

program.on('--help', () => {
    util.paddedLog([
        '  - Call with the path to your contract file and a directory to output your server files.',
        '  - All config options currently hard-coded to defaults.',
        '  - For more information about configuration and generation, view the abi2api homepage on GitHub.'
    ]);
});  

const buildOptionConfig = (options) => {
    let config = {};
    if (options.config) config = JSON.parse(fs.readFileSync(options.config));
    if (options.apiVersion) config.version = options.apiVersion;
    if (options.host) config.host = options.host;
    if (options.base) config.basePath = options.base;
    if (options.schemes) config.schemes = options.schemes;

    if ((options.provider || options.price || options.gas) && !config.eth) config.eth = {};
    if (options.provider) config.eth.provider = options.provider;
    if (options.price) config.eth.default_gasPrice = options.price;
    if (options.gas) config.eth.default_gas = options.gas;
    return config;
}

const ensureDefaults = (config) => {
    let setIfNot = (prop, val) => {if (!dotProp.has(config, prop)) dotProp.set(config, prop, val) }
    setIfNot('version', '1.0.0');
    setIfNot('schemes', ['https']);
    setIfNot('host', 'localhost:8080');
    setIfNot('basePath', '/');
    setIfNot('eth.provider', 'http://localhost:8545');
    setIfNot('eth.default_gas', 0);
    setIfNot('eth.default_gasPrice', 40);
    return config;
}

/**
 * @function
 * @description Main command: consumes a config object, outputs Swagger server files in specified directory.
 * @param {Object} config Object corresponding to config spec.
 * @param {String} output_path Path to output directory for server files.
 */
const buildServer = (contract_path, output_path, config={}) => {
    config = ensureDefaults(config);
    let swaggerOutputPath = path.resolve(output_path, './openAPI.json');    
    let res = abi2oas.convert(contract_path, swaggerOutputPath, config);
    shell.exec(
        `java -jar swagger-codegen-cli.jar generate -o ${output_path} -l nodejs-server -i ${swaggerOutputPath}`,
        { async : true },
        (code, stdout, stderr) => {
            if (code !== 0){
                shell.echo(`Error: Swagger codegen failed. STDERR:`);
                shell.echo(stderr);
                shell.exit(1);
            } else {
                let libPath = path.resolve(output_path, './controllers')
                abi2lib.generate(contract_path, libPath, config);
                let parser = new SwaggerServiceGenerator(contract_path, config);
                parser.init();
                parser.process('./contract_lib');
                parser.build(libPath);
                console.log('Successfully built Swagger-ETH connector code!');
            }
        }
    );
}


if (require.main === module) {
    if (process.argv.length === 2) program.help();
    program.parse(process.argv);
} else {
    module.exports = buildServer;
}