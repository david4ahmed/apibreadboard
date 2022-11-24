// Take in a nodeID -> make request -> return response
import { RequestsState } from "@/app/store/requests/types";
import { VariablesState, VariablesMap } from "@/app/store/variables/types";
import Debug from "@/Debug";
import { ipcRenderer } from "electron";
import { cloneDeep } from "lodash";

/**
 * Obtain the request form state for a given nodeID and the selectedRequest and send a request to the backend using said state
 * 
 * @param nodeID nodeID of request you want to send
 * @param requestState Global program request state
 * @param variables Global variable state (redux)
 * @param selectedRequest (optional) Override the selectedRequest with a given request
 */
export const sendRequestWithState = (nodeID : string, requestState : RequestsState, variables: VariablesState, selectedRequest? : any, syncronous?: boolean) => {
    Debug.log('misc', 'inside requestwithstate');
    let sr = requestState.selectedRequest;
    if(selectedRequest) {
        sr = selectedRequest;
    }
    const queryState = requestState.requestQueries[nodeID];
    const pathState = requestState.requestPath[nodeID];
    const bodyState = requestState.requestBodies[nodeID];
    const headerState = requestState.requestHeaders[nodeID];
    return sendRequestToBackend(sr, queryState, pathState, bodyState, headerState, variables, syncronous);
}

export const updateRequestInformation = (selectedRequest : any, queryState : any, pathState : any, bodyState : any, headerState : any, variables : any) => {
    let updatedObject = cloneDeep(selectedRequest);

    const variablesValues: VariablesMap = {...variables.nodeCreatedVariables, ...variables.estrangedVariables};


    updatedObject.query?.forEach((query: any, index: number) => {
        const queryObject = queryState[query.key]
    
        console.log(queryObject)
        if(queryObject.isVariable) {
            
            updatedObject.query[index].value = variablesValues[queryObject.data].output

        } else {
            updatedObject.query[index].value = queryState[query.key].data
        }
    }); 

    //////
    updatedObject.path?.forEach((path: any, index: number) => {
        if(typeof path != 'string'){

            let pathObject = pathState[path.key]

            if (pathObject.isVariable) {
                updatedObject.path[index].value = variablesValues[pathObject.data].output
            }
            else 
            {
                updatedObject.path[index].value = pathState[path.key].data
            }
        }
    }); 

    selectedRequest.body?.forEach((body: any, index: number) => {

        let bodyObject = bodyState[body.key]

        if (bodyObject.isVariable) {
            updatedObject.body[index].value = variablesValues[bodyObject.data].output
        } else {
            updatedObject.body[index].value = bodyState[body.key].data
        }
    }) 

    selectedRequest.header?.forEach((header: any, index: number) => {

        let headerObject = headerState[header.key] 


        if (headerObject.isVariable) {
            updatedObject.header[index].value = variablesValues[headerObject.data].output
        }
        else 
        {
            updatedObject.header[index].value = headerState[header.key].data
        }

    }) 

    return updatedObject;
}


export const sendRequestToBackend =  (selectedRequest : any, queryState : any, pathState : any, bodyState : any, headerState : any, variables : any, syncronous?: boolean) => {
    let updatedObject = updateRequestInformation(selectedRequest, queryState, pathState, bodyState, headerState, variables); 
    console.log("request being sent", updatedObject);
    console.log(syncronous, 'sync');
    if(syncronous === true){
        return ipcRenderer.sendSync('send-request', {syncronous: true, baseURL: selectedRequest.baseURL, cid: 0, reqString: JSON.stringify(updatedObject)});
    } else {
        ipcRenderer.send('send-request', {syncronous: false, baseURL: selectedRequest.baseURL, cid: 0, reqString: JSON.stringify(updatedObject)});
    }
}