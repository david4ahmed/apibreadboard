import request from 'request';
import { Collection } from 'postman-collection';
import { collectionManager } from './CollectionManager';
let ConverterOpenAPI = require('openapi-to-postmanv2');
let ConverterSwagger = require('swagger2-to-postmanv2');
import { readFileSync } from 'fs';
import YAML from 'yaml';

const postmanConverter = (jsonString: string, sender: Electron.WebContents) => {
	let Converter = undefined;
	let spec = "";
	try {
		spec = JSON.parse(jsonString);
	} catch {
		spec = YAML.parse(jsonString);
	}
	
	
	const addAndRespond = (debugJSON: any, collectionJSON: any) => {
		const simpleCollection = collectionManager.addCollection(new Collection(collectionJSON));
		// Send both result and simpleCollection
		sender.send("import-collection-response", [debugJSON, JSON.stringify(simpleCollection)]);
	}

	if(spec.hasOwnProperty('openapi')) {
		Converter = ConverterOpenAPI;
	} else if(spec.hasOwnProperty('swagger')) {
		Converter = ConverterSwagger;
	// There is no easy way to check if postman collection, so we're checking for the two required properties in the schema.
	} else if(spec.hasOwnProperty('info') && spec.hasOwnProperty('item')) {
		const obj = JSON.parse(jsonString);
		addAndRespond(jsonString, obj);
		return;
	} else {
		// Unrecognized format
		console.log("Unrecognized API spec (OpenAPI, Swagger, and Postman Collection supported)");
		sender.send('import-collection-error', "Unrecognized API spec (OpenAPI, Swagger, and Postman Collection supported)");
		return;
	}

	Converter.convert(
		{ type: 'string', data: jsonString },
		{ folderStrategy: 'Tags' },
		(err: any, result: any) => {
			//console.log(ConverterO.validate(body));
			if (!result.result){
				sender.send("import-collection-error", result.reason);
				console.log("error message", "import-collection-error", result);
			}
			else
			{	
				//console.log(typeof result);
				addAndRespond(result.output, result.output[0].data);
			}
		}
	);
}
const openApiToPostmanURL = (url: string, sender: Electron.WebContents) => {
	request.get(url, (err, resp, body) => {
		console.log("type of body", typeof body);
		if (!err && resp.statusCode == 200) {
			postmanConverter(body, sender);
	
		} else {
			console.log("The error is being called clown ")
			sender.send('import-collection-error', err);
		}
	});
};

const openApiToPostmanString = (rawInput: string, sender: Electron.WebContents) => {
	postmanConverter(rawInput, sender);
};

const openApiToPostmanFile = (path: string, sender: Electron.WebContents) => {

	const text = readFileSync(path, 'utf-8');
	postmanConverter(text, sender);
}

export const collectionHelpers = {
	openApiToPostmanURL: openApiToPostmanURL,
	openApiToPostmanString: openApiToPostmanString,
	openApiToPostmanFile : openApiToPostmanFile,
};
