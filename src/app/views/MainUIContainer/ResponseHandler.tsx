import React, { Component } from 'react';
import { ipcRenderer } from "electron";
import Debug from '@/Debug';
import { VariablesState } from '@/app/store/variables/types';

interface ResponseHandlerProps {
    selectedNode: string;
    variables: VariablesState;
    setRequestOutput: (nid: string, output:string) => any;
    addStoreNodeVariable: (ID: string,
		variable: string, output: string) => any;
    setRequestStatus: (nodeID: string, status: string) => any;
}

interface ResponseHandlerState {
	
}

class ResponseHandler extends Component<ResponseHandlerProps, ResponseHandlerState> {
    /**
     * After a response has been recieved, update variable values if they have been added to redux
     * @param responseJSON JSON response after successful request
     * @param nid node who's variables to update
     * @param path optional parameter used for recursion. Don't supply if calling normally
     */
    static updateVars = (responseJSON : any, nid : string, variables : VariablesState,
            addStoreNodeVariable: (ID: string, variable: string, output: string) => any, path? : string) => {
        if(!path) {
            path = "";
        } else {
            path = path + "_";
        }
        
        for(let key in responseJSON){
            if((typeof responseJSON[key]) === 'object') {
                ResponseHandler.updateVars(responseJSON[key], nid, variables, addStoreNodeVariable, path + key);
            } else{
                // Variable shouldn't start with numbers
                if(!isNaN(Number(path[0]))) {
                    path = "_" + path;
                }

                const varID = nid + '-' + path + key;
                if(variables.nodeCreatedVariables[varID]) {
                    addStoreNodeVariable(varID, path + key, responseJSON[key]);
                }
            }
        }
    }

    onSuccessfulRequestResponse = (event: any, arg: any) => {
        //alert("Send request sent a response: check console for info :)")
        if(this.props.selectedNode) {
            ResponseHandler.updateVars(arg[0], this.props.selectedNode, this.props.variables, this.props.addStoreNodeVariable);
            this.props.setRequestOutput(this.props.selectedNode, JSON.stringify(arg[0]))
            this.props.setRequestStatus(this.props.selectedNode, arg[1]);
        }
    };

    onRequestResponseError = (event: any, arg: any) => {
        console.log("error message",arg[0]);
        if(this.props.selectedNode) {
            this.props.setRequestOutput(this.props.selectedNode, JSON.stringify(arg[0]));
            this.props.setRequestStatus(this.props.selectedNode, arg[1]);
        }
    }

    componentDidMount() {
        ipcRenderer.on('send-request-response', this.onSuccessfulRequestResponse);
        ipcRenderer.on('send-request-error', this.onRequestResponseError);
    }

    componentWillUnmount() {
        ipcRenderer.removeListener('send-request-response', this.onSuccessfulRequestResponse);
        ipcRenderer.removeListener('send-request-error', this.onRequestResponseError);
    }

    componentDidUpdate() {

    }
    
    render() {
        return (<></>)
    }
}

export default ResponseHandler;