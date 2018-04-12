#!/usr/bin/env node

const SwaggerServiceGenerator = require('SwaggerServiceGenerator');
const abi2oas = require('abi2oas');
const abi2lib = require('abi2lib');
const program = require('commander');
const shell = require('shelljs');

program
    .version('0.0.2')
    .arguments('<config_path> <server_path>')
    .action((config_path, server_path) => {
        buildServer(config_path, output_path);
    })

/**
 * @function
 * @description Main command; acc
 * @param {String} config_path Path to a 
 * @param {String} output_path 
 */
const buildServer = (config_path, output_path) => {
    // Use abi2oas to build a Swagger file

    // Use swagger-codegen-cli.jar to build nodejs server

    // Use abi2lib to create eth connector code

    // Use SwaggerServiceGenerator to glue code together
    let configPath = process.argv[2];
    let swaggerToEthPath = process.argv[3];
    let controllersPath = process.argv[4];

    let parser = new SwaggerServiceGenerator(configPath);
    parser.init();
    parser.process(swaggerToEthPath);
    parser.build(controllersPath);
}


if (require.main === module) {
    program.parse(argv);
    
} else {
    module.exports = buildServer;
}