import React, { Component } from "react";
import { Button, IconButton, TextField, Tooltip, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { sendRequestToBackend } from '../../NodeRequestSender';
import ResponseDisplay from '../../ResponseDisplay';
import { VariablesState } from 'src/app/store/variables/types';
import GlobalVariableSelect from '../GlobalVariableSelect/GlobalVariableSelect';
import { cloneDeep } from "lodash"
import Debug from "@/Debug";
import './SelectedRequestForm.scss';


type SelectedRequestFormProps = {
    selectedRequest: any;
    selectedNode: string;
    requestQueries: any;
    requestBodies: any;
    requestHeaders: any;
    requestPath: any;
    requestOutput: string;
    variables: VariablesState;
    parentNode: Set<string>;
    status: string;

    setRequestQueries: (nid: string, queries: any) => any;
    setRequestPath: (nid: string, queries: any) => any;
	setRequestBodies: (nid: string, bodies: any) => any;
	setRequestHeaders: (nid: string, headers: any) => any;
    setRequestOutput: (nid: string, output:string) => any;

    deleteVariable: (id: string) => any;
    addNodeCreatedVariable: (variable: string,
        output: string, nodeID: string) => any;
    toggleCodeGenerationModal: () => void;
};

type SelectRequestFormState = {

};

class SelectedRequestForm2 extends Component<SelectedRequestFormProps, SelectRequestFormState> {
    constructor(props: SelectedRequestFormProps) {
        super(props);
    }

    /**
     * Called when a request node is selected AND there was previously no selected request node. In
     * other words, it's called when the form popup appears. This is NOT called after switching the
     * selectedNode. For that, see componentDidUpdate().
     */
    componentDidMount() {

        // Check if all the form props are empty. If so, we need to set the defaults.
        if(Object.keys({
                ...this.props.requestQueries,
                ...this.props.requestPath,
                ...this.props.requestHeaders,
                ...this.props.requestBodies}).length == 0) {
            this.loadDefaultState();
        }
    }

    /**
     * Called whenever the props for this class change. We use it to detect when the selectedNode
     * changes. That is, when the user clicks from one requestNode to another.
     * 
     * @param prevProps the previous props prior to some prop state change.
     */
    componentDidUpdate(prevProps: SelectedRequestFormProps) {
        if (this.props.selectedNode !== prevProps.selectedNode) {
            // Check if all the form props are empty. If so, we need to set the defaults.
            if(Object.keys({
                ...this.props.requestQueries,
                ...this.props.requestPath,
                ...this.props.requestHeaders,
                ...this.props.requestBodies}).length == 0) {
                
                this.loadDefaultState();
            }
        }
    }

    /**
     * Called when deselecting a request node either by clicking a translation node, selecting no
     * node, or by closing the request form. This function is NOT called when after switching
     * selectedNode. For that see componentDidUpdate().
     */
    componentWillUnmount() {

    }

    /**
     * Sets the request form state for the currently selected node to their default value. When the
     * selectedRequestForm is opened for the first time, the default values need to be set.
     */
    loadDefaultState() {
        // >>>>>>>IMPORTANT<<<<<<<< 
        // One major bug in the code right now is that you have to click a node in order for it load
        // the defaults. This will break chaining if the user doesnt selects all of the added nodes.
        let queryState: any = cloneDeep(this.props.requestQueries);
        let headerState: any = cloneDeep(this.props.requestHeaders); 
        let bodyState: any = cloneDeep(this.props.requestBodies); 
        let pathState: any = cloneDeep(this.props.requestPath);

        // Lambda function to obtain the default value of an input
        let getDefaultValue = (value : string) : any => {
            if (value === "<long>" || value === "<integer>") {
                return 0;
            } else if (value === "<string>" || value === "<dateTime>") {
                return "";
            } else if (value === "<boolean>") { 
                return false;
            } else {
                return value;
            }
        };

        this.props.selectedRequest?.query?.forEach((query: any) => {
            queryState[query.key] = { data: getDefaultValue(query.value), isVariable: false };
        })

        this.props.selectedRequest?.path?.forEach((path: any) => {
            if(typeof path != 'string') {
                pathState[path.key] = { data: getDefaultValue(path.value), isVariable: false };
            }
        });

        this.props.selectedRequest.body?.forEach((body: any) => {
            bodyState[body.key] = { data: getDefaultValue(body.value), isVariable: false };
        })
    
        this.props.selectedRequest.header?.forEach ((header: any) => {
            headerState[header.key] = { data: getDefaultValue(header.value), isVariable: false }
        })
        
        this.props.setRequestPath(this.props.selectedNode, pathState)
        this.props.setRequestQueries(this.props.selectedNode, queryState)
        this.props.setRequestBodies(this.props.selectedNode, bodyState)
        this.props.setRequestHeaders(this.props.selectedNode, headerState)
    }

    onSubmitButtonClick = () => {
        sendRequestToBackend(
            this.props.selectedRequest,
            this.props.requestQueries,
            this.props.requestPath,
            this.props.requestBodies,
            this.props.requestHeaders,
            this.props.variables);
    }

    onCodeGenerationButtonClick = () => {
        this.props.toggleCodeGenerationModal()
    }

    onTextInputChange = (event: any, key: string, requestData : any,
            setRequestData: (nid: string, data: any) => any) => {

        setRequestData(this.props.selectedNode,
            {...requestData, [key]: {...requestData[key], data: event.target.value}});
    }

    onVarChange = (event: any, key: string, requestData : any,
        setRequestData: (nid: string, data: any) => any) => {

        const varID = event.target.value;

        setRequestData(this.props.selectedNode,
            {...requestData, [key]: {...requestData[key], data: varID}});
    }

    handleVariableButtonOnClick = (event: any, key : string, requestData : any,
            setRequestData: (nid: string, data: any) => any) => {

        const isVariable = !requestData[key].isVariable;
        // Currently, we need to set the data to "" when transitioning between variable and text
        // input. This causes data to be lost when swapping. If we don't want this to happen, one
        // solution is to store variable data separately from text data.
        setRequestData(this.props.selectedNode,
            {...requestData, [key]: {...requestData[key], data: "", isVariable: isVariable}});
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
    generateInputs(requestFieldKey: string, requestData: any, setRequestData: (nid: string, data: any) => any,
                conditional?: (property: any) => boolean) {
        const regex = /^(?<id>(TR-)?\d+)-\w+$/;
        const variablesValues = Object.values(this.props.variables.estrangedVariables).concat(Object.values(this.props.variables.nodeCreatedVariables).filter((variable : any) => {
            const varNodeID : string = variable.id.match(regex)?.groups?.id;
            return this.props.parentNode.has(varNodeID);
        }));
        variablesValues.sort((a: any, b: any) => a.variable.localeCompare(b.variable));

        // Used to format the input type that is displayed to the user
        const upperCaseKey = requestFieldKey.toUpperCase().charAt(0).toUpperCase() + requestFieldKey.slice(1);

        return this.props.selectedRequest[requestFieldKey].map((property: any, index: number) => {
            if(conditional && conditional(property)) {
                return;
            }

            const globalVariablesSelect = (
                <GlobalVariableSelect
                    variables={variablesValues}
                    id={`${index}`}
                    name={`${index}`}
                    inputLabel={`${upperCaseKey} Parameter ${index + 1}: ${property.key}`}
                    onChange={(e) => this.onVarChange(e, property.key, requestData, setRequestData)}
                    select={requestData[property.key]?.data || ""}
                />
            )

            let correctTextField = <></>;

            // It is possible that react tries to render the textfields before requestData has been
            // handled. This if statement prevents the textField from loading if that is the case
            if (Object.keys(requestData).length != 0) {
                correctTextField = 
                <Tooltip title={property.description ? property.description : "" } placement="top" disableHoverListener={!property.description}>
                    <TextField 
                                        fullWidth
                                        multiline 
                                        onChange={(e) => this.onTextInputChange(e, property.key, requestData, setRequestData)}
                                        type='text'
                                        label={`${upperCaseKey} Parameter ${index + 1}: ${property.key}`}
                                        value={requestData[property.key]?.data}
                                    />
                </Tooltip>
                
            }

            return (
                <div key={index} className="SelectedRequestFormInputContainer">
                    {!requestData[property.key]?.isVariable ? correctTextField
                        : globalVariablesSelect}

                    <IconButton onClick={(e) => this.handleVariableButtonOnClick(e, property.key, requestData, setRequestData)} aria-label="delete" size="small">
                        <AddIcon fontSize="inherit" />
                    </IconButton>
                </div>
            )
        });
    }

    render() {
        return (
            <div className={"SelectedRequestFormContainer"}>
                <div>
                    <Typography variant='subtitle1' gutterBottom align='center'>
                        {`${this.props.selectedRequest.method} - ${this.props.selectedRequest.requestName}`}
                    </Typography>
                </div>

                <div>
                    <Typography variant='subtitle2' gutterBottom align='center'>
                        {this.props.selectedRequest?.description?.content}
                    </Typography>
                </div>
                <div className={"SelectedRequestFormSubContainer"}>
                    <Typography variant='subtitle2' gutterBottom align='center'>
                        {"Path Parameters:"}
                    </Typography>
                    {this.generateInputs("path", this.props.requestPath, this.props.setRequestPath,
                        (path : any) => typeof path == "string")} 
                </div>
                <div className={"SelectedRequestFormSubContainer"}>
                    <Typography variant='subtitle2' gutterBottom align='center'>
                        {"Query Parameters:"}
                    </Typography>
                    {this.generateInputs("query", this.props.requestQueries, this.props.setRequestQueries)}
                </div>
                <div className={"SelectedRequestFormSubContainer"}>
                    <Typography variant='subtitle2' gutterBottom align='center'>
                        {"Header Parameters:"}
                    </Typography>
                    {this.generateInputs("header", this.props.requestHeaders, this.props.setRequestHeaders)}  
                </div>
                <div className={"SelectedRequestFormSubContainer"}>
                    <Typography variant='subtitle2' gutterBottom align='center'>
                        {"Body Parameters:"}
                    </Typography>
                    {this.generateInputs("body", this.props.requestBodies, this.props.setRequestBodies,
                        (body: any) => !(body.mode === 'urlencoded' || body.mode === 'raw'))}
                </div>
                <div className={"SelectedRequestFormSubContainer"}>
                    <Typography variant='subtitle2' gutterBottom align='center'>
                        {"Output"}
                        {this.props.status == ""? "" : " (Status Code: " + this.props.status + ")"}
                    </Typography>
                    <ResponseDisplay
                        responseJSON={this.props.requestOutput}
                        sampleResponseJSON={this.props.selectedRequest.response ? JSON.stringify(this.props.selectedRequest.response) : ""} // "\"\""
                        selectedNode={this.props.selectedNode}
                        addNodeCreatedVariable={this.props.addNodeCreatedVariable}
                        deleteVariable={this.props.deleteVariable}
                        useTabs = {true}
                    />
                </div>
                <Button color='primary' className='MakeRequestBtn' onClick={this.onCodeGenerationButtonClick}>
                    Generate Code
                </Button>
                <Button color='primary' className='MakeRequestBtn' onClick={this.onSubmitButtonClick}>
                    Make Request
                </Button>
            </div>
        )
    }
}

export default SelectedRequestForm2;