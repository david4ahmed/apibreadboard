import { ipcMain } from 'electron';
import { collectionHelpers } from '@/electron/Collections';
import { collectionManager } from './CollectionManager';
import { sendRequest } from './RequestHandler';
import Graph from 'graph-data-structure';
import {reduxSave} from './reduxSave';
import { requestGenerator } from './RequestGenerator';
import Debug from '@/Debug';

ipcMain.on('import-collection-url', (event, url) => {
	collectionHelpers.openApiToPostmanURL(url, event.sender);
});

ipcMain.on('import-collection-raw', (event, rawInput) => {
	collectionHelpers.openApiToPostmanString(rawInput, event.sender);
});

ipcMain.on('send-request', (event, {syncronous, baseURL, cid, reqString }) => {
	//console.log(reqString); 
	
	//console.log(JSON.parse(reqString)); 

	const simpleReq = JSON.parse(reqString);

	sendRequest(syncronous, baseURL, simpleReq, event);

	//sendRequest(req, simpleReq);
	/*axios
		.get(url)
		.then((resp) =>
			event.sender.send('get-request-response', { id, resp: resp.data })
		)
		.catch((e) => event.sender.send('get-request-error', e.toString()));
		*/
});

ipcMain.on('import-collection-file', (event, path) => {
	collectionHelpers.openApiToPostmanFile(path, event.sender);	
});

ipcMain.on('get-collections', (event) => {
	const simpleCollectionList = collectionManager.getCollections();
	event.sender.send('get-collections-response', JSON.stringify(simpleCollectionList));
});

ipcMain.on('get-variables', (event) => {
	//get variables from the saved store
	//console.log("get variables was called");
	reduxSave.readVariables(event.sender);
});
ipcMain.on('save-variables', (event, globalVariables) => {
	//this.saveToFile(nodeCreatedVar, estrangedVar);
	
	reduxSave.saveVariables(globalVariables);
});
ipcMain.on('save-requests', (event, requests) => {
	reduxSave.saveRequests(requests);
});
ipcMain.on('get-requests', event => {
	reduxSave.readRequests(event.sender);
})
// ipcMain.on('test', (event, args) => 
// 	console.log(args)
// );
ipcMain.on('save-graph', (event, graphState) => {
	//console.log("graphhhhhhhhhhhhhhhhhh");
	//console.log(graphState);
	reduxSave.saveGraph(graphState)
});
ipcMain.on('read-graph', event => {
	reduxSave.readGraph(event.sender)
})

ipcMain.on('delete-collection', (event, CID) => {
	//console.log("delete is calledddddddd");
	//console.log("CID", CID);
	collectionManager.deleteCollection(event.sender, CID);
});
ipcMain.on('delete-variable', (event, id) => {
	//console.log("delete-variable is calledddddddd");
	//console.log("id", id);
	reduxSave.deleteVariable(id);
});

ipcMain.on('get-code-gen-languages', (event) => {
	var codegen = require('postman-code-generators')
	const supportedCodegens = codegen.getLanguageList();

	if (supportedCodegens.length) {
		event.sender.send("get-code-gen-languages-response", supportedCodegens);
	}
	else 
	{
		event.sender.send("get-code-gen-languages-error", "Unable to get the current code gens, check console for more info");
	}
});

ipcMain.on('generate-request-code', (event, {baseURL, CID, simpleReq, key, variant}) => {

	const postmanReq = collectionManager.getRequestByID(CID, simpleReq.RID);

	if(postmanReq) {
		const mergedReq = requestGenerator.mergeRequest(baseURL, simpleReq, postmanReq);
		requestGenerator.generateRequest(key, variant, mergedReq, (_, snippet) => {
			console.log(snippet);
			event.sender.send("generate-request-code-response", snippet);
		});
	} else {
		event.sender.send("generate-request-code-error", "Invalid CID or RID");
	}
}); 

ipcMain.on('generate-request-code', (event, {baseURL, CID, simpleReq, key, variant}) => {

	const postmanReq = collectionManager.getRequestByID(CID, simpleReq.RID);

	if(postmanReq) {
		const mergedReq = requestGenerator.mergeRequest(baseURL, simpleReq, postmanReq);
		requestGenerator.generateRequest(key, variant, mergedReq, (_, snippet) => {
			console.log(snippet);
			event.sender.send("generate-request-code-response", snippet);
		});
	} else {
		event.sender.send("generate-request-code-error", "Invalid CID or RID");
	}
}); 

ipcMain.on('generate-request-code-chain', (event, {simpleRequestList, key, variant}) => {

	let codeString = ""; 

	if (simpleRequestList.length === 0) {
		event.sender.send("generate-request-code-chain-error", "Simple Request List is empty");
	}

	let count = 0; 

	simpleRequestList.forEach((simpleReq: any) => {

		const postmanReq = collectionManager.getRequestByID(simpleReq.CID, simpleReq.RID);
	
		if(postmanReq) {

			///////////*****this may break stuff later on */
			// if(simpleReq.baseURL.includes("undefined")){
			// 	simpleReq.baseURL = simpleReq.baseURL.replace("undefined", "https")
			// }
			const mergedReq = requestGenerator.mergeRequest(simpleReq.baseURL + "/", simpleReq, postmanReq);
			requestGenerator.generateRequest(key, variant, mergedReq, (_, snippet) => {

				if (count !== 0) {
					const optionsName = `options${count}` 

					snippet = snippet.replace("var request = require('request');", "")
					snippet = snippet.replace(/options/g, optionsName)
				}

				codeString = codeString + "\n" + snippet; 
				count++; 
			});
		} else {
			event.sender.send("generate-request-code-chain-error", "Invalid CID or RID");
		}
		
	})

	event.sender.send("generate-request-code-chain-response", codeString);

	
}); 



// ipcMain.on('identify-starting-nodes', (event, arg) => {
// 	console.log('misc', arg);
// 	const graph = Graph().deserialize(arg)
// 	event.returnValue = graph.nodes().filter((node: any) => graph.indegree(node) === 0)
// });