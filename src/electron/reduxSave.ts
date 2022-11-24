import { VariablesMap, VariablesState } from '../app/store/variables/types';
import { RequestsState, RequestOutput, RequestData } from '../app/store/requests/types';
import _ from 'lodash';

const Store = require('electron-store');

class ReduxSave{
    
    storeVariables = new Store({'name': 'variableData'});
    storeRequests = new Store({'name': 'requestData'});
    storeGraph = new Store({'name': 'graphData'});
    
    readVariables(sender: Electron.WebContents) {
        
        let variablesObject : VariablesMap = {};

        const storeObject : Object = this.storeVariables.store;
        for(let key of Object.keys(storeObject)) {
            //console.log("printing storeObject", key);
            //console.log(CID);
            ///this.collections.set(CID, new Collection(this.store.get(key)));
            variablesObject[key] = this.storeVariables.get(key);
        }
        sender.send('get-variables-response', variablesObject);
        console.log(variablesObject);
    }

    /* saves collections array in JSON file */
    saveVariables(globalVariables: VariablesState) {

    //    console.log("no", globalVariables.nodeCreatedVariables);
    //    console.log("yess", globalVariables.estrangedVariables);

        const variablesEntries = [...Object.entries(globalVariables.nodeCreatedVariables), ...Object.entries(globalVariables.estrangedVariables)];
        console.log("printing entries", variablesEntries);
       
       variablesEntries.forEach(([id, variableObj]) => {

            if(!this.storeVariables.get(id)){
                this.storeVariables.set(id, variableObj);
            }
       });
    }

    deleteVariable(ID: number) {
            this.storeVariables.delete(ID.toString());
    }
    saveGraph = (graphState: any) => {
        const {graph, requests, internalGraph, totalNodes} = graphState;

        console.log(graphState)

        if(!_.isEmpty(graph))
            this.storeGraph.set("graph", graph || {});
        else this.storeRequests.delete("graph")

        if(!_.isEmpty(requests))
            this.storeGraph.set("requests", requests || {});
        else this.storeRequests.delete("requests")

        if(!_.isEmpty(internalGraph))
            this.storeGraph.set("internalGraph", internalGraph || {});
        else this.storeRequests.delete("internalGraph")

        this.storeGraph.set("totalNodes", totalNodes || 0);


        
    }

    readGraph = (sender: Electron.WebContents) => {
        const graphObj: any = {};
        graphObj["graph"] = this.storeGraph.get("graph");
        graphObj["requests"] = this.storeGraph.get("requests");
        graphObj["internalGraph"] = this.storeGraph.get("internalGraph");
        graphObj["totalNodes"] = this.storeGraph.get("totalNodes");

        sender.send('read-graph-response', graphObj);
    }

    readRequests(sender: Electron.WebContents) {
        
        let requestsObject : RequestData = {};

        const storeObject : Object = this.storeRequests.store;
        for(let key of Object.keys(storeObject)) {
            //console.log("printing storeObject", key);
            //console.log(CID);
            ///this.collections.set(CID, new Collection(this.store.get(key)));
            requestsObject[key] = this.storeRequests.get(key);
        }
        sender.send('get-requests-response', requestsObject);
        console.log(requestsObject);
    }

    /* saves collections array in JSON file */
    saveRequests(globalRequests: RequestsState) {

    //    console.log("no", globalVariables.nodeCreatedVariables);
    //    console.log("yess", globalVariables.estrangedVariables);
    
        if(!_.isEmpty(globalRequests.requestQueries))
            this.storeRequests.set("queries", globalRequests.requestQueries || {})
        else this.storeRequests.delete("queries")

        if(!_.isEmpty(globalRequests.requestBodies))
            this.storeRequests.set("bodies", globalRequests.requestBodies || {})
        else this.storeRequests.delete("bodies")

        if(!_.isEmpty(globalRequests.requestHeaders))
            this.storeRequests.set("headers", globalRequests.requestHeaders || {})
        else this.storeRequests.delete("headers")

        if(!_.isEmpty(globalRequests.requestPath))
            this.storeRequests.set("path", globalRequests.requestPath || {})
        else this.storeRequests.delete("path")

    }
    

       

       
       
        


    
}
export const reduxSave = new ReduxSave();