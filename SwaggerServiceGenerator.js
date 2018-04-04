let fs = require("fs");
let Handlebars = require("Handlebars");
let OpenAPIGenerator = require("./OpenAPIGenerator");


/**
 * @class
 * @classdesc Parser class that actually parses and generates OpenAPI config
 * */
class SwaggerServiceGenerator {

    /**
     * @constructor
     * @description
     * Read's the contract schema which is built using truffle migrate and stores the schema.
     * */
    constructor(config_file) {
        "use strict";
        this.openAPIGenerator = new OpenAPIGenerator(config_file);
        this.config = JSON.parse(fs.readFileSync(config_file));
    }

    /**
     * @function
     * @instance
     * @description Initializes the service generator by initializing the OpenApiGenerator
     * */
    init() {
        this.openAPIGenerator.init();
    }

    /**
     * @function
     * @instance
     * @param {String} relative_path_to_eth_connector -
     *                  relative path to eth connector from output folder to folder in which Connector.js is present
     * @description process generation by processing openAPI generation
     * */
    process(relative_path_to_eth_connector) {
        this.openAPIGenerator.process();

        let controller_template = String(fs.readFileSync("./SwaggerService_template.hbs"));
        Handlebars.registerHelper({
            ifEquals(param1, param2, options){
                return param1 === param2 ? options.fn(this) : options.inverse(this);
            },
            logconsole(){
                let args = Array.prototype.slice.call(arguments);
                console.log(args.slice(0, args.length - 1));
            },
            append(){
                let args = Array.prototype.slice.call(arguments);
                return args.slice(0, args.length - 1).join("");
            },
            ifHas(list, item, options){
                return (list.indexOf(item) !== -1) ? options.fn(this) : "";
            }
        });
        let abi = this.openAPIGenerator.cs.abi;
        this.service_files_code = {};
        for(let tag of this.openAPIGenerator.openAPI.tags){
            let methods = this.openAPIGenerator.openAPI.getMethodsForTag(tag);
            let allowed_methods = methods.map(method => {
                return `${method.method}_${method.path.path}`;
            });
            this.service_files_code[tag.name] = Handlebars.compile(controller_template)({
                path_to_eth_connector: relative_path_to_eth_connector,
                methods: abi,
                allowed_methods: allowed_methods
            });
            console.log(`Generated ${methods.length} method(s) in "${tag.name}" scope`);
        }
    }

    /**
     * @function
     * @instance
     * @param {String} swagger_service_folder - path to swagger service folder
     * @description Writes the serialized json data to provided file path. Else writes the output to console...
     * */
    build(swagger_service_folder) {
        console.log(`Writing to file...`);
        for(let service_file_tag in this.service_files_code){
            if(this.service_files_code.hasOwnProperty(service_file_tag)){
                let service_file_name = service_file_tag.replace(service_file_tag[0], service_file_tag[0].toUpperCase());
                fs.writeFileSync(swagger_service_folder+"/"+service_file_name+"Service.js", this.service_files_code[service_file_tag]);
            }
        }
        console.log(`Written! please check ${swagger_service_folder} for generated service files.`);
    }

}

if (require.main === module) {
    let parser = new SwaggerServiceGenerator(process.argv[2]);
    parser.init();
    parser.process(process.argv[3]);
    parser.build(process.argv[4]);
}else{
    module.exports = SwaggerServiceGenerator;
}