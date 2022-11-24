import './SelectedRequestForm.scss';
import React, { Component } from 'react';
import { Button, FormControl, Input, MenuItem, Select, TextField, Typography } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import AddIcon from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/IconButton';
import { cloneDeep } from "lodash" // Alternatively: Import just the clone methods from lodash
import { ipcRenderer } from 'electron';
import ResponseDisplay from '../../ResponseDisplay';
import { VariablesState } from 'src/app/store/variables/types';
import GlobalVariableSelect from '../GlobalVariableSelect/GlobalVariableSelect';
import Debug from '@/Debug';
import { ParentNodes } from '@/app/store/graph/types';
import { sendRequestToBackend } from '../../NodeRequestSender';
import { QueryDisplayValue } from '@/app/store/requests/types';



type SidePanelProps = {
	selectedRequest: any;
    selectedNode: string;
	requestQueries: any;
	requestBodies: any;
	requestHeaders: any;
    requestPath: any;
    requestOutput: string;
    queryDisplayValue: QueryDisplayValue;
	setRequestQueries: (nid: string, queries: any) => any;
    setRequestPath: (nid: string, queries: any) => any;
	setRequestBodies: (nid: string, bodies: any) => any;
	setRequestHeaders: (nid: string, headers: any) => any;
    setRequestOutput: (nid: string, output:string) => any;
    toggleCodeGenerationModal: () => void; 
    addNodeCreatedVariable: (variable: string,
		output: string, nodeID: string) => any;
	deleteVariable: (id:string) => any;
    variables: VariablesState;
    setParentNode: (childNode: string, parentNode: string) => any;
	parentNodes: ParentNodes;
    disownParentNode: (childNode: string, parentNode: string) => any;
    setQueryDisplayValue: (nodeID: string, index: number,requestLength: number, displayValue: string) => any;
};

type SidePanelState = {
	query: any;
    // queryValue: QueryValue;
	header: any;
	body: any;
    path: any;
    requestOutput: string;
    wasPrevTargetNull: boolean;
};

// interface QueryValue {
// //     [nodeID: string]: {
// //         queryValues: string[];
// //     }
// }
/*
    Everything everywhere is still a string, have to look at the type it is excepting and allow users to provide that type 

    Types seen so far: string, long, object test test 



    Split up the divs into sections Body, URL, Query

    Will also have to look how to provide objects 
    future idea: split string on the comma, split those on the colon (break down those into properties and objects and allow users to input those)
*/

class SelectedRequestForm extends Component <SidePanelProps, SidePanelState> {
    constructor (props: any) {
        super(props); 
        this.state = {query: this.props.requestQueries, header: {}, body: {}, path: {}, requestOutput: "", wasPrevTargetNull: true}
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

    onSuccessfulRequestResponse = (event: any, arg: any) => {
        alert("Send request sent a response: check console for info :)")

        Debug.log("WPT", this.props.selectedNode);
        this.props.setRequestOutput(this.props.selectedNode, JSON.stringify(arg))
        this.setState({
            requestOutput: JSON.stringify(arg)
        });
    };

    onRequestResponseError = (event: any, arg: any) => {
        alert("Send request sent an error: check console for info");
    } 

    resetRequestFormState = () => {
        let queryState: any = cloneDeep(this.props.requestQueries);
        let headerState: any = cloneDeep(this.props.requestHeaders); 
        let bodyState: any = cloneDeep(this.props.requestBodies); 
        let pathState: any = cloneDeep(this.props.requestPath); 

        if(Object.keys(queryState).length == 0) { //not sure what this is for, this is my sign to ask someone in the morning at not 5 AM 
            this.props.selectedRequest?.query?.forEach((query: any) => {

                if (query.value === "<long>" || query.value === "<integer>") {
                    queryState[query.key] = { data: 0, showVariable: false} 
                }
                else if (query.value === "<string>") {
                    queryState[query.key] = { data: "", showVariable: false} 
                } 
                else if (query.value === "<boolean>") { 
                    queryState[query.key] = { data: false, showVariable: false}
                }
                else if (query.value === "<dateTime>") { 
                    queryState[query.key] = { data: "", showVariable: false};
                }
                else if (query.value.includes("{"))
                {
                    queryState[query.key] = { data: "{}", showVariable: false}
                } 
                else 
                {
                    queryState[query.key] = { data: query.value, showVariable: false}
                }
            })
        }


        //In case something needs to be done with URL Params in the future
        if(Object.keys(pathState).length == 0) { 
            let regEx = /{(.*?)\s<(.*?)>}/; 


            //while((urlQueries = regEx.exec(this.props.selectedRequest?.path)) !== null) {
            this.props.selectedRequest?.path?.forEach((path: any) => {
                if(typeof path != 'string') {
                    let varName = path.key;
                    let i = 2; 
                    //for (let i = 1; i < urlQueries.length; i+=2) {   //again if this url queries are broken it is because I misintrepreted what I originally wrote
    
                    if (path.value === "<long>" || path.value === "<integer>") {
                        pathState[varName] = {data: 0 , showVariable: false};
                    } 
                    else if (path.value === "<boolean>") 
                    {
                        pathState[varName] = {data: false, showVariable: false};
                    }
                    else if (path.value === "<dateTime>") 
                    {
                        pathState[varName] = {data: "", showVariable: false};
                    }
                    else
                    {
                        if (path.value.includes("{"))  
                        {
                            pathState[varName] = {data: "{}", showVariable: false};
                        }
                        else 
                        {
                            pathState[varName] = {data: "", showVariable: false};
                        }
                    }
                }
                    //index = index + 1; 
                //}
            });
        }

       
    
        
        if(Object.keys(bodyState).length == 0) {
            this.props.selectedRequest.body?.forEach((body: any) => {

                //******* still not supporting the other modes outside of URL ENCODED


                if (body.mode === "urlencoded") { 
                    body.value.forEach((property: any, index: number) => {
                        if (property.value === "<long>" || property.value === "<integer>") {
                            bodyState[`${index}`] = { data: 0, showVariable: false}
                        }
                        else if (property.value === "<string>") 
                        {
                            bodyState[`${index}`] = { data: "", showVariable: false}
                        }
                        else if (property.value === "<boolean>") 
                        {
                            bodyState[`${index}`] = { data: false, showVariable: false}
                        }
                        else if (property.value === "<dateTime>") { 
                            bodyState[`${index}`] = { data: "", showVariable: false}
                        }
                        else if (property.value.includes("{")) 
                        {
                            bodyState[`${index}`] =  { data: property.value, showVariable: false}
                        }
                        else 
                        {   
                            bodyState[`${index}`] = { data: property.value, showVariable: false}
                        }
                        
                    })
                }
            })
        }
        
        if(Object.keys(headerState).length == 0) {
            this.props.selectedRequest.header?.forEach ((header: any) => {

                if (header.value === "<long>" || header.value === "<integer>") {
                    headerState[header.key] = { data: 0, showVariable: false} 
                }
                else if (header.value === "<string>") {
                    headerState[header.key] = { data: "", showVariable: false} 
                } 
                else if (header.value === "<boolean>") { 
                    headerState[header.key] = { data: false, showVariable: false}
                }
                else if (header.value === "<dateTime>") { 
                    headerState[header.key] = { data: "", showVariable: false};
                }
                // else if (header.value.includes("{"))
                // {
                //     headerState[header.key] = { data: "{}", showVariable: false}
                // } 
                else 
                {
                    headerState[header.key] = { data: header.value, showVariable: false}
                }
               // headerState[header.key] =  { data: headerState[header.value], showVariable: false}
            })
        }

        this.setState({
            query: queryState, header: headerState, body: bodyState, path: pathState
        })
        this.props.setRequestPath(this.props.selectedNode, pathState)
        this.props.setRequestQueries(this.props.selectedNode, queryState)
        this.props.setRequestBodies(this.props.selectedNode, bodyState)
        this.props.setRequestHeaders(this.props.selectedNode, headerState)
    }

    componentDidMount() {
        // const queries: string[] = [];
        // this.props.selectedRequest?.query?.forEach((query: any, index: number) => {
        //     queries.push("");
        // });

        // if(!(this.props.selectedNode in this.props.queryDisplayValue)){
        //     this.props.setQueryDisplayValue(this.props.selectedNode, 0, this.props.selectedRequest?.query?.length, "");
        // }

        ipcRenderer.on('send-request-response', this.onSuccessfulRequestResponse);
        ipcRenderer.on('send-request-error', this.onRequestResponseError);
     

        // const queryValue: QueryValue = {
        //     ...this.state.queryValue,
        //     [this.props.selectedNode.toString()]: {
        //         queryValues: queries
        //     }
        // }
        // this.setState({queryValue});
        this.resetRequestFormState(); 
    }
    
    componentWillUnmount() {
        ipcRenderer.removeListener('send-request-response', this.onSuccessfulRequestResponse)
        ipcRenderer.removeListener('send-request-error', this.onRequestResponseError)
    }


    onQueryTextInputChange = (event: any) => {
        
        let id = event.target.name ? event.target.name : event.target.id

        let value = event.target.value; 

        console.log(id, value, 'id and value')


        if (value === "true") {
            let queryState: any = {...this.state.query};

            queryState[id].data = !queryState[id].data; 

            this.props.setRequestQueries(this.props.selectedNode, queryState)
        
            this.setState({
                query: queryState
            })
        }
        else 
        {
            let queryState: any = {...this.state.query};

            queryState[id].data = value; 

            this.props.setRequestQueries(this.props.selectedNode, queryState)
        
            this.setState({
                query: queryState
            })
        }
     
    };


    onPathTextInputChange = (event: any) => {
        let id = event.target.name ? event.target.name : event.target.id

        let value = event.target.value; 


        if (value === "true") {
            let pathState: any = {...this.state.path};

            pathState[id].data = !pathState[id].data; 

            this.props.setRequestPath(this.props.selectedNode, pathState)
        
            this.setState({
                path: pathState
            })
        }
        else 
        {
            let pathState: any = {...this.state.path};

            pathState[id].data = value; 

            this.props.setRequestPath(this.props.selectedNode, pathState)
        
            this.setState({
                path: pathState
            })
        }
     
    };

    onHeaderTextInputChange = (event: any) => {

        let id = event.target.name ? event.target.name : event.target.id

        if (event.target.name) {
            id = event.target.name; 
        } 
        else 
        {
            id = event.target.id; 
        }
        

        let value = event.target.value; 

        let headerState: any = {...this.state.header};

        headerState[id].data = value; 

        this.props.setRequestHeaders(this.props.selectedNode, headerState)

        this.setState({
            header: headerState
        })
         
    }

    onBodyTextInputChange = (event: any) => {

        let id = event.target.name ? event.target.name : event.target.id

        let value = event.target.value; 

        if (value === "true") {
            let bodyState: any = {...this.state.body}


            bodyState[id].data = !bodyState[id].data; 

            this.props.setRequestBodies(this.props.selectedNode, bodyState)

            this.setState({
                body: bodyState
            })
        }
        else 
        {
            let bodyState: any = {...this.state.body}

            bodyState[id].data = value; 
    
            this.props.setRequestBodies(this.props.selectedNode, bodyState)

            this.setState({
                body: bodyState
            })
    
        }
    }

    /*
        This is crucial to making this work 

        If the old props do not equal the new props, we need to create a new state object
    */

    componentDidUpdate(prevProps: SidePanelProps) {

        if (this.props.selectedNode !== prevProps.selectedNode) {
            this.resetRequestFormState(); 

            // if(!(this.props.selectedNode in this.state.queryValue)){
            //     const queries: string[] = [];
            //     this.props.selectedRequest?.query?.forEach((query: any, index: number) => {
            //         queries.push("");
            //     });

            //     const queryValue: QueryValue = {
            //         ...this.state.queryValue,
            //         [this.props.selectedNode.toString()]: {
            //             queryValues: queries
            //         }
            //     }
            //     this.setState({queryValue});
            // }
        }
    }

    handleQueryVariableButtonOnClick = (event: any, index: number, requestLength?: number, queryKey?: string) => {

        console.log(event)

        if(event.target.value && queryKey){
            let vari;
            if(event.target.value.startsWith("-")){
                 vari = this.props.variables.estrangedVariables[event.target.value];
            } else {
                 vari = this.props.variables.nodeCreatedVariables[event.target.value];
            }

            const fakeEvent = {
                target: {
                    name: queryKey,
                    value: vari.id,
                }
            }

            console.log(fakeEvent, "adfsfgfdgbfgdfghbvn")
            if(vari)
                this.onQueryTextInputChange(fakeEvent);
        }

        console.log("Outside")
        console.log(!event.target?.name);
        if(event.target.value && !event.target.value.startsWith("-")){
            // node created variable
            console.log('inside')
            const value: string = event.target.value;
            const nodeID = value.substring(0, value.indexOf("-"));
            console.log(nodeID, 'iddddddddd');
            if(nodeID !== this.props.selectedNode)
                this.props.setParentNode(nodeID, this.props.selectedNode);
                if(requestLength)
                    this.props.setQueryDisplayValue(this.props.selectedNode, index, requestLength, value);
           
                // const {queryValue} = this.state;
                // const queryValues = [...queryValue[this.props.selectedNode.toString()].queryValues]
                // queryValues[index] = event.target.value;
                // this.setState({queryValue: {...this.state.queryValue, [this.props.selectedNode]: {queryValues}}});
            
                
        } else if(!event.target?.name) {
                
                const queryValue = this.props.queryDisplayValue;
                if(queryValue[this.props.selectedNode.toString()]) {
                    const queryValues = [...queryValue[this.props.selectedNode.toString()].queryValues]
                    if(queryValues[index] && !queryValues[index].startsWith("-")){
                        console.log("Remove the node")
                        const nodeID = queryValues[index].substring(0, queryValues[index].indexOf("-"));
                        this.props.disownParentNode(nodeID, this.props.selectedNode);
                        if(requestLength)
                            this.props.setQueryDisplayValue(this.props.selectedNode, index, requestLength, "");
                        // queryValues[index] = "";
                        // this.setState({queryValue: {...this.state.queryValue, [this.props.selectedNode]: {queryValues}}});
                    }
                }
            // if(!this.state.wasPrevTargetNull){
            //     // this.props.disownParentNode(nodeID, this.props.selectedNode)
            // }
        }
        
        let id = event.target.id; 

        console.log('query state:',this.state.query);
        let queryState: any = {...this.state.query};
        
        queryState[id].showVariable = !queryState[id].showVariable; 

        console.log(queryState[id])

        
        this.props.setRequestQueries(this.props.selectedNode, queryState)

        
        this.setState({
            query: queryState
        })
    } 

    setTextInputValue = (id: string | undefined) => {
        if(id !== undefined){
            if(id.startsWith('-')){
                if(this.props.variables.estrangedVariables[id])
                    return this.props.variables.estrangedVariables[id].output;
            } else {
                if(this.props.variables.nodeCreatedVariables[id])
                    return this.props.variables.nodeCreatedVariables[id].output;
            }
        }

        return id;
    }

    generateQueryInputs = () => {

        const variablesValues = [...Object.values(this.props.variables.nodeCreatedVariables), ...Object.values(this.props.variables.estrangedVariables)];
        variablesValues.sort((a,b) => a.variable.localeCompare(b.variable));
        
        return this.props.selectedRequest?.query?.map((query: any, index: number) => {
            console.log(query);

            const globalVariablesSelect = (
                <FormControl fullWidth id={query.key}>
                    <InputLabel id="demo-simple-select-label">{`Query Parameter ${index + 1}: ${query.key}`}</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        name={query.key}
                        fullWidth
                        onChange={(e) => this.handleQueryVariableButtonOnClick(e, index, this.props.selectedRequest?.query?.length, query.key)}
                        value={this.props.queryDisplayValue[this.props.selectedNode]?.queryValues[index]}
                    >
                        {variablesValues.map((variable) => {
                            const length = variable.output?.length;
                            return <MenuItem key={variable.id} value = {variable.id} id={query.key} >{`${variable.variable} : ${variable.output.slice(0, 8)}${length > 8 ? "..." : ""}`}</MenuItem>
                        })}
                    </Select>
                </FormControl>
            );

            // const globalVariablesSelect = (
            //     <GlobalVariableSelect 
            //         variables={variablesValues}
            //         id={query.key}
            //         name={query.key}
            //         inputLabel={`Query Parameter ${index + 1}: ${query.key}`}
            //         onChange={(e) => this.handleQueryVariableButtonOnClick(e, index)}
            //     /> 
            //)

            let correctTextField = <></>; 
            if(Object.keys(this.props.requestQueries).length != 0) { 
                correctTextField = <TextField fullWidth onChange={this.onQueryTextInputChange} id={query.key} type='text' label={`Query Parameter ${index + 1}: ${query.key}`} value={this.setTextInputValue(this.props.requestQueries[query.key]?.data)} />
            } 

            console.log(this.state.query)
            return (
                <div key={index} className="SelectedRequestFormInputContainer">
                    {!this.state.query[query.key]?.showVariable ? correctTextField
                    : globalVariablesSelect}

                    <IconButton id={query.key} onClick = {(e) => this.handleQueryVariableButtonOnClick(e, index, this.props.selectedRequest?.query?.length)} aria-label="delete" size="small">
                            <AddIcon id={query.key} fontSize="inherit" />
                    </IconButton>
                </div>
            )
        }); 
    }

    handleHeaderVariableButtonOnClick = (event: any) => {

        let id = event.target.id; 

        let headerState: any = {...this.state.header};
        
        headerState[id].showVariable = !headerState[id].showVariable; 
        
        this.props.setRequestHeaders(this.props.selectedNode, headerState)

        this.setState({
            header: headerState
        })
    } 

    generateHeaderInputs = () => {
    
        const variablesValues = [...Object.values(this.props.variables.nodeCreatedVariables), ...Object.values(this.props.variables.estrangedVariables)];
        variablesValues.sort((a,b) => a.variable.localeCompare(b.variable));

        return this.props.selectedRequest.header?.map((header: any, index: number) => {

            

            const globalVariablesSelect = (
                <GlobalVariableSelect
                    variables={variablesValues}
                    id={header.key}
                    name={header.key}
                    inputLabel={`Header Parameter ${index + 1}: ${header.key}`}
                    onChange={this.onHeaderTextInputChange}
                />
            )

            let correctTextField = <></>


            if(Object.keys(this.props.requestHeaders).length != 0) { 
                // if (header.value === "<long>" || header.value === "<integer>") {
                //     correctTextField = <TextField fullWidth onChange={this.onHeaderTextInputChange} id={header.key} type='number' label={`Header Parameter ${index + 1}: ${header.key}`} defaultValue={0} />
                // }
                // else if (header.value === "<string>") 
                // {
                //     correctTextField = <TextField fullWidth onChange={this.onHeaderTextInputChange} id={header.key} type='text' label={`Header Parameter ${index + 1}: ${header.key}`} defaultValue={""} />
                // }
                // else if (header.value === "<boolean>") 
                // {
                //     correctTextField = <TextField fullWidth onChange={this.onHeaderTextInputChange} id={header.key} type='checkbox' label={`Header Parameter ${index + 1}: ${header.key}`} defaultValue={true} />
                // }
                // else if (header.value === "<dateTime>")
                // {
                //     correctTextField = <TextField fullWidth onChange={this.onHeaderTextInputChange} id={header.key} type="datetime-local" defaultValue={header.value} />
                // }
                // else 
                // {   
                //     correctTextField = <TextField fullWidth onChange={this.onHeaderTextInputChange} id={header.key} label={`Header Parameter ${index + 1}: ${header.key}`} defaultValue={header.value} />
                // }
                correctTextField = <TextField fullWidth onChange={this.onHeaderTextInputChange} id={header.key} type='text' label={`Header Parameter ${index + 1}: ${header.key}`} value={this.props.requestHeaders[header.key]?.data} />
            }

            return ( 
                <div key={index} className="SelectedRequestFormInputContainer">
                    {!this.state.header[header.key]?.showVariable ? correctTextField
                    : globalVariablesSelect}

                    <IconButton id={header.key} onClick = {this.handleHeaderVariableButtonOnClick} aria-label="delete" size="small">
                            <AddIcon id={header.key} fontSize="inherit" />
                    </IconButton>
                </div>
            )

        })
    }

    handleBodyVariableButtonOnClick = (event: any) => {
       
        let id = event.target.id; 

        let bodyState: any = {...this.state.body};

        bodyState[id].showVariable = !bodyState[id].showVariable; 
        
        this.props.setRequestBodies(this.props.selectedNode, bodyState)

        this.setState({
            body: bodyState
        })
    } 

    handlePathVariableButtonOnClick = (event: any) => {
        let id = event.target.id; 

        let pathState: any = {...this.state.path};
        
        pathState[id].showVariable = !pathState[id].showVariable; 
        
        this.props.setRequestPath(this.props.selectedNode, pathState)

        this.setState({
            path: pathState
        })
    } 


    generatePathInputs = () => {
        const variablesValues = [...Object.values(this.props.variables.nodeCreatedVariables), ...Object.values(this.props.variables.estrangedVariables)];
        variablesValues.sort((a,b) => a.variable.localeCompare(b.variable));
        
        return this.props.selectedRequest?.path?.map((path: any, index: number) => {
            if(typeof path == 'string'){
                return;
            }

            const globalVariablesSelect = (
                <GlobalVariableSelect 
                    variables={variablesValues}
                    id={path.key}
                    name={path.key}
                    inputLabel={`Path Parameter ${index + 1}: ${path.key}`}
                    onChange={this.onPathTextInputChange}
                /> 
            )

            let correctTextField = <></>; 
            if(Object.keys(this.props.requestPath).length != 0) { 
                correctTextField = <TextField fullWidth onChange={this.onPathTextInputChange} id={path.key} type='text' label={`Path Parameter ${index + 1}: ${path.key}`} value={this.props.requestPath[path.key].data} />
            } 

            return (
                <div key={index} className="SelectedRequestFormInputContainer">
                    {!this.state.path[path.key]?.showVariable ? correctTextField
                    : globalVariablesSelect}

                    <IconButton id={path.key} onClick = {this.handlePathVariableButtonOnClick} aria-label="delete" size="small">
                            <AddIcon id={path.key} fontSize="inherit" />
                    </IconButton>
                </div>
            )
        }); 
    }
    generateBodyInputs = () => {
        const variablesValues = [...Object.values(this.props.variables.nodeCreatedVariables), ...Object.values(this.props.variables.estrangedVariables)];
        variablesValues.sort((a,b) => a.variable.localeCompare(b.variable));

        return this.props.selectedRequest.body?.map((body: any) => {
            if (body.mode === "urlencoded") { 
                return body.value.map((property: any, index: number) => {

                    const globalVariablesSelect = (
                        <GlobalVariableSelect 
                            variables={variablesValues}
                            id={`${index}`}
                            name={`${index}`}
                            inputLabel={`Body Parameter ${index + 1}: ${property.key}`}
                            onChange={this.onBodyTextInputChange}
                        /> 
                    )
                    
                    let correctTextField = <></>; 
                    if(Object.keys(this.props.requestBodies).length != 0) { 
                        // if (property.value === "<long>" || property.value === "<integer>") {
                        //     correctTextField = <TextField fullWidth onChange={this.onBodyTextInputChange} id={`${index}`} type='number' label={`Body Parameter ${index + 1}: ${property.key}`} defaultValue={0} />
                        // }
                        // else if (property.value === "<string>") 
                        // {
                        //     correctTextField = <TextField fullWidth onChange={this.onBodyTextInputChange} id={`${index}`} type='text' label={`Body Parameter ${index + 1}: ${property.key}`} defaultValue={""} />
                        // }
                        // else if (property.value === "<boolean>") 
                        // {
                        //     correctTextField = <TextField fullWidth onChange={this.onBodyTextInputChange} id={`${index}`} type='checkbox' label={`Body Parameter ${index + 1}: ${property.key}`} defaultValue={true} />
                        // }
                        // else if (property.value === "<dateTime>")
                        // {
                        //     correctTextField = <TextField fullWidth onChange={this.onBodyTextInputChange} id={`${index}`} type="datetime-local" defaultValue={property.value} />
                        // }
                        // else 
                        // {   
                        //     correctTextField = <TextField fullWidth onChange={this.onBodyTextInputChange} id={`${index}`} type='text' label={`Body Parameter ${index + 1}: ${property.key}`} defaultValue={property.value} />
                        // }
                    
                        correctTextField = <TextField fullWidth onChange={this.onBodyTextInputChange} id={`${index}`} type='text' label={`Body Parameter ${index + 1}: ${property.key}`} value={this.props.requestBodies[property.key]?.data} />
                    }

                    return (
                        <div key={index} className="SelectedRequestFormInputContainer">
                            {!this.state.body[`${index}`]?.showVariable ? correctTextField
                            : globalVariablesSelect}
        
                            <IconButton id={`${index}`} onClick = {this.handleBodyVariableButtonOnClick} aria-label="delete" size="small">
                                    <AddIcon id={`${index}`} fontSize="inherit" />
                            </IconButton>
                        </div>
                    )

                }).flat();
            }
            else 
            {
                return null; 
            }
        });
    }

    onCodeGenerationButtonClick = () => {
        this.props.toggleCodeGenerationModal()
    }

    render () {
        return (
            <div className={"SelectedRequestFormContainer"}>
                <div>
                    <Typography variant='subtitle1' gutterBottom align='center'>
                    { `${this.props.selectedRequest.method} - ${this.props.selectedRequest.requestName}` }
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
                    {this.generatePathInputs()} 
                </div>
                <div className={"SelectedRequestFormSubContainer"}>
                    <Typography variant='subtitle2' gutterBottom align='center'>
                        {"Query Parameters:"}
                    </Typography>
                    {this.generateQueryInputs()} 
                </div>
                <div className={"SelectedRequestFormSubContainer"}>
                    <Typography variant='subtitle2' gutterBottom align='center'>
                        {"Header Parameters:"}
                    </Typography>
                    {this.generateHeaderInputs()}  
                </div>
                <div className={"SelectedRequestFormSubContainer"}>
                    <Typography variant='subtitle2' gutterBottom align='center'>
                        {"Body Parameters:"}
                    </Typography>
                    {this.generateBodyInputs()}
                </div>
                {/* Simple display of output */}
                <div className={"SelectedRequestFormSubContainer"}>
                    <Typography variant='subtitle2' gutterBottom align='center'>
                        {"Output:"}
                    </Typography>
                    <ResponseDisplay
                        responseJSON={this.props.requestOutput}
                        sampleResponseJSON={this.props.selectedRequest.response? JSON.stringify(this.props.selectedRequest.response) : ""} // "\"\""
                        selectedNode={this.props.selectedNode}
                        addNodeCreatedVariable={this.props.addNodeCreatedVariable}
                        deleteVariable={this.props.deleteVariable}
                        useTabs = {true}/>
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

export default SelectedRequestForm;