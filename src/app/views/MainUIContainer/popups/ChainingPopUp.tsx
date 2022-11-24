import React, { Component } from 'react';
import { Button, TextField, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { ipcRenderer, remote } from 'electron';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Debug from '@/Debug';
import ResponseDisplay from '../ResponseDisplay';
import { RequestOutput } from '@/app/store/requests/types';
import { Requests } from '@/app/store/graph/types'
import { VariablesMap, VariablesState } from '@/app/store/variables/types';
import GlobalVariableSelect from '../SidePanel/GlobalVariableSelect/GlobalVariableSelect';
import {RequestsState} from '@/app/store/requests/types';
import "./ChainingPopUp.scss"

type ChainingPopUpProps = {
    onCloseClick: () => void;
    variables: VariablesState;
    requestState: RequestsState;
    showPopup: boolean;
    nodeIDSource: string;
    nodeIDTarget: string;
    requestOutputState: RequestOutput;
    deleteVariable: (id:string) => any;
    addNodeCreatedVariable: (variable: string,
        output: string, nodeID: string) => any;
    allNodeRequests: Requests;

    setRequestQueries: (nid: string, queries: any) => any;
    setRequestPath: (nid: string, queries: any) => any;
	setRequestBodies: (nid: string, bodies: any) => any;
	setRequestHeaders: (nid: string, headers: any) => any;
    updateCheckboxState: (nodeID: string, checkboxState: boolean[]) => any;
}

class ChainingPopUp extends Component<ChainingPopUpProps, any> {
    constructor(props: any) {
        super(props);

        this.state = {

        }
    }

    onVarChange = (event: any, key: string, requestData : any,
        setRequestData: (nid: string, data: any) => any) => {

        const varID = event.target.value;

        setRequestData(this.props.nodeIDTarget,
            {...requestData, [key]: { data: varID, isVariable: true }});
    }

    /**
     * Generate the JSX for the form input fields
     *
     * @param requestFieldKey the type of field to generate. Should match simpleRequest keys (e.g
     * query)
     * @param requestData redux prop for a request field associated with the key (e.g
     * this.props.requestQueries)
     * @param setRequestData redux setter function associated with the key (e.g
     * this.props.setRequestQueries)
     * @param conditional some field types may want to skip properties if they meet a certain
     * condition. This function will be called on each element of the simpleRequest field that is
     * being generated. If it returns true, no input field will be generated for that property.
     * @returns JSX list of all input fields for the given type in the selectedRequest
     */
    generateVariableInputs(requestFieldKey: string, requestData: any, setRequestData: (nid: string, data: any) => any, targetRequest : any,
        conditional?: (property: any) => boolean) {
        const regex = /^(?<id>(TR-)?\d+)-\w+$/
       // Debug.log("WPT","variables list before" ,variablesValues);
        const variablesValues = Object.values(this.props.variables.estrangedVariables);
        //     ...Object.values(this.props.variables.nodeCreatedVariables).filter((variable) => {
        //         Debug.log("WPT", "VAR", variable);
        //         Debug.log("WPT", "REGEX", variable.id.match(regex));
        //         variable?.id.match(regex)?.groups?.id == this.props.nodeIDSource;
        // })];
        const variablestemp = Object.values(this.props.variables.nodeCreatedVariables);
        
        variablestemp.forEach(variable =>{
            if(variable?.id.match(regex)?.groups?.id == this.props.nodeIDSource){
                variablesValues.push(variable);
            }
        });
        //variablesValues
        // Used to format the input type that is displayed to the user
        const upperCaseKey = requestFieldKey.toUpperCase().charAt(0).toUpperCase() + requestFieldKey.slice(1);

        return targetRequest[requestFieldKey].map((property: any, index: number) => {
            if(conditional && conditional(property)) {
                return;
            }

            return (
                <div key={index} className="SelectedRequestFormInputContainer">
                    <GlobalVariableSelect
                        variables={variablesValues}
                        id={`${index}`}
                        name={`${index}`}
                        inputLabel={`${property.key} ${requestData[property.key]?.data || ""}`}
                        onChange={(e) => this.onVarChange(e, property.key, requestData, setRequestData)}
                        select={requestData[property.key]?.isVariable? requestData[property.key].data : ""}
                    />
                </div>
            )
        });
    }

    render () {

        const nodeIDSource = this.props.nodeIDSource;
        const nodeIDTarget = this.props.nodeIDTarget;
        const targetRequest = this.props.allNodeRequests[nodeIDTarget];
        
        if(targetRequest === undefined && nodeIDTarget[0] != 'T') {
            return null;
        }

        const targetQueries = this.props.requestState.requestQueries[nodeIDTarget] || {};
        const targetPath = this.props.requestState.requestPath[nodeIDTarget] || {};
        const targetHeaders = this.props.requestState.requestHeaders[nodeIDTarget] || {};
        const targetBodies = this.props.requestState.requestBodies[nodeIDTarget] || {};

        return (
            <Dialog
                fullWidth
                open={this.props.showPopup}
                onClose={this.props.onCloseClick}
                aria-labelledby='form-dialog-title'>
                
                <DialogTitle id='form-dialog-title'>Chaining</DialogTitle>
                <DialogContent>
                    <div className={"ChainingPopUpContainer"}>
                        <div className={"ChainingPopUpSectionContainer"}>
                            <Typography variant='subtitle2' gutterBottom align='center'>
                                    {"Output:"}
                            </Typography>
                            <ResponseDisplay
                                    responseJSON={this.props.requestOutputState[nodeIDSource] || ""}
                                    sampleResponseJSON={this.props.allNodeRequests[nodeIDSource]?.response ? JSON.stringify(this.props.allNodeRequests[nodeIDSource]?.response) : ""} 
                                    selectedNode={nodeIDSource}
                                    addNodeCreatedVariable={this.props.addNodeCreatedVariable}
                                    deleteVariable={this.props.deleteVariable}
                                    useTabs = {false}
                                    checkboxState={this.props.variables.checkboxState[nodeIDSource] || []}
                                    updateCheckboxState={this.props.updateCheckboxState}
                                />
                        </div>
                        <div className={"ChainingPopUpSectionContainer"}>
                        {(nodeIDTarget[0] != 'T')? (
                            <>
                            <div className={"SelectedRequestFormSubContainer"}>
                            <Typography variant='subtitle2' gutterBottom align='center'>
                                {"Path Parameters:"}
                            </Typography>
                            {this.generateVariableInputs("path", targetPath, this.props.setRequestPath, targetRequest,
                                (path : any) => typeof path == "string")} 
                            </div>
                            <div className={"SelectedRequestFormSubContainer"}>
                                <Typography variant='subtitle2' gutterBottom align='center'>
                                    {"Query Parameters:"}
                                </Typography>
                                {this.generateVariableInputs("query", targetQueries, this.props.setRequestQueries, targetRequest)}
                            </div>
                            <div className={"SelectedRequestFormSubContainer"}>
                                <Typography variant='subtitle2' gutterBottom align='center'>
                                    {"Header Parameters:"}
                                </Typography>
                                {this.generateVariableInputs("header", targetHeaders, this.props.setRequestHeaders, targetRequest)}  
                            </div>
                            <div className={"SelectedRequestFormSubContainer"}>
                                <Typography variant='subtitle2' gutterBottom align='center'>
                                    {"Body Parameters:"}
                                </Typography>
                                {this.generateVariableInputs("body", targetBodies, this.props.setRequestBodies, targetRequest,
                                    (body: any) => !(body.mode === 'urlencoded' || body.mode === 'raw'))}
                            </div>
                            </>
                        ) : (
                            <></>
                        )}
                        </div>
                    </div>
                    
                    

                    
                   
                    {/* <DialogContentText>
                        {this.props.nodeIDSource}
                        {this.props.nodeIDTarget}
                    </DialogContentText> */}
                </DialogContent>

            </Dialog>
        )
    }
}

export default ChainingPopUp;