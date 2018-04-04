const SwaggerServiceGenerator = require('SwaggerServiceGenerator');
const abi2oas = require('abi2oas');
const abi2lib = require('abi2lib');

if (require.main === module) {
	// argv[2] corresponds to config filepath
	// argv[3] corresponds to rel.path from swagger output to eth connector output
	// argv[4] corresponds to <swaggeroutputpath>/controllers
    let parser = new SwaggerServiceGenerator(process.argv[2]);
    parser.init();
    parser.process(process.argv[3]);
    parser.build(process.argv[4]);
} else {
    module.exports = SwaggerServiceGenerator;
}