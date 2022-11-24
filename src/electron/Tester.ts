import { collectionManager } from './CollectionManager';
import { requestGenerator } from './RequestGenerator';
import { sendRequest } from './RequestHandler';
import { Request } from 'postman-collection'

class Tester {
	testSimplePetstore() {
		console.log('RUNNING TEST');
		// const simpleReq = {
		//     RID: 4,
		//     method: "GET",
		//     path: "/pet/0",
		// };

		const collectionsList = collectionManager.getCollections();
		//console.log("<<<<<printing collectionList", collectionsList);
		const collection = collectionsList[collectionsList.length - 1];
		const CID = collection.CID;
		// Assume that this is a petstore collection
		//const simpleCollection = collectionManager.collectionToSimple(CID);

		//console.log("<<<<<printing last collection", collection);
		//console.log("<<<<<printing requests in Tester", collection.requests);

		const simpleReq = collection.requests[0]!;

		//console.log('This should return:\n{"id":0,"category":{"id":1,"name":"fuzzstring"},"name":"fuzzstring","photoUrls":["fuzzstring"],"tags":[{"id":1,"name":"fuzzstring"}],"status":"sold"}');
		console.log("We're actually getting:");
		console.log('simple Request', simpleReq);
		//console.log(sendRequest(collection.baseURL, pmReq, simpleReq));
	}

	testGenerator() {
		const collectionsList = collectionManager.getCollections();
		const collection = collectionsList[collectionsList.length - 1];
		const CID = collection.CID;
		const simpleCollection = collectionManager.collectionToSimple(CID);
		// assuming openweathermap for this to work
		const simpleReq = simpleCollection.tags.requests[0];

		const newReq = requestGenerator.mergeRequest(simpleCollection.baseURL, simpleReq, collectionManager.getRequestByID(CID, simpleReq.RID)!);
		requestGenerator.generateRequest("nodejs", "request", newReq, (error, snippet) => {
			console.log(snippet);
		});
	}
}

export const tester = new Tester();
