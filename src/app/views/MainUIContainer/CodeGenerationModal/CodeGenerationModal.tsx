import './CodeGeneration.scss'
import React, { Component } from 'react';
import { Button, FormControl, MenuItem, InputLabel, Select, TextField, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { ipcRenderer, remote } from 'electron';
import { CopyBlock, paraisoLight } from "react-code-blocks";
import Debug from '@/Debug';
import { updateRequestInformation } from '../NodeRequestSender';
import { VariablesState } from '@/app/store/variables/types';
import { TranslationState } from '@/app/store/translation/types';
import { GraphAreaStoreState } from '@/app/store/graphArea/types';

type CodeGenerationModalProps = {
    onCloseClick: () => void,
    show: boolean; 
    codeGenerationObject: any;
    requestQueries: any;
    requestBodies: any;
    requestHeaders: any;
    requestPath: any;
    variables: VariablesState;
    selectedNode: string;
    translation: TranslationState;
    graphA: GraphAreaStoreState;
    codeGeneratationOptions: []
}

type CodeGenerationModalState = {
    generatedCodeSnippet: string; 
    selectedKey: string; 
    selectedVariant: string; 
}

class CodeGenerationModal extends Component <CodeGenerationModalProps, CodeGenerationModalState> {
    constructor (props: any) {
        super(props); 
        this.state = {generatedCodeSnippet: "", selectedKey: "", selectedVariant: ""}
    }

    onSuccessfulCodeGenerationResponse = (event: any, arg: any) => {
        console.log("coddeeee snipppp", arg); 
        this.setState({generatedCodeSnippet: arg}); 
    }

    onCodeGenerationError = (event: any, arg: any) => {
        alert("Code Generation was unsuccessful, please check the console for more information")
    }

    onSelectChange = (event: any) => {
        const value = event.target.value; 

        let languageOptions = value.split("-"); 

        console.log("language options <3")
        console.log(languageOptions);

        this.setState({
            selectedKey: languageOptions[0], 
            selectedVariant: languageOptions[1]
        })

    }

    onGenerateCodeClick = () => {
        let codeChainList = this.generateCodeGenerationRequestList(); 

        ipcRenderer.send('generate-request-code-chain', {simpleRequestList: codeChainList, key: this.state.selectedKey, variant: this.state.selectedVariant})
    }
    
    generateCodeGenerationRequestList = () => {
        const bfsArray: { queue: string[]; visitedSet: Set<string>; }[] = 
        [{
            queue: [this.props.selectedNode], 
            visitedSet: new Set<string>().add(this.props.selectedNode)
        }];

        let codeGenerationRequestList = []; 

        for (const {queue, visitedSet} of bfsArray) {
            while (queue.length) {
                const nodeID = queue.shift(); 

                if (nodeID) {
                    /* 
                    Iterate through all of the edges , if the target matches the nodeID then we grab the destination 

                    */

                    let neighbors = this.props.graphA.graphStateStore.graph.edges.map((edge: any) => {

                        if (edge.source.toString() === nodeID.toString()) {
                            return edge.target; 
                        } 

                        return null;
                    })
                    
                    console.log(neighbors); 

                    neighbors.forEach((neighbor: any) => {
                        if (!visitedSet.has(neighbor)) {
                            visitedSet.add(neighbor); 
                            queue.push(neighbor); 
                        }
                    }) 

                    //skipping translation nodes
                    if (!nodeID.toString().includes("TR")) {
                       let requestObject = this.props.graphA.graphStateStore.requests[nodeID]

                       let updatedObject = updateRequestInformation(requestObject, this.props.requestQueries[nodeID], 
                        this.props.requestPath[nodeID], this.props.requestBodies[nodeID], this.props.requestHeaders[nodeID], this.props.variables
                       ); 

                       codeGenerationRequestList.push(updatedObject)
                    }

                } 

                // yield; 
            }
        }

        return codeGenerationRequestList; 

    }


    componentDidMount() {
        console.log(this.props.codeGeneratationOptions)

        let codeChainList = this.generateCodeGenerationRequestList(); 


        ipcRenderer.on('generate-request-code-chain-response', this.onSuccessfulCodeGenerationResponse);
        ipcRenderer.on('generate-request-code-chain-error', this.onCodeGenerationError);

        ipcRenderer.send('generate-request-code-chain', {simpleRequestList: codeChainList, key: "nodejs", variant: "request"})


        Debug.log('justin', codeChainList)

        /* Single Request Functionality 
        Debug.log('misc', this.props.codeGenerationObject)

        console.log(this.props)

        let updatedObject = updateRequestInformation(this.props.codeGenerationObject, this.props.requestQueries[this.props.selectedNode], 
                this.props.requestPath[this.props.selectedNode], this.props.requestBodies[this.props.selectedNode], this.props.requestHeaders[this.props.selectedNode], this.props.variables
            );


        ipcRenderer.on('generate-request-code-response', this.onSuccessfulCodeGenerationResponse);
        ipcRenderer.on('generate-request-code-error', this.onCodeGenerationError);

        ipcRenderer.send('generate-request-code', {baseURL: this.props.codeGenerationObject?.baseURL, CID: this.props.codeGenerationObject?.CID, simpleReq: updatedObject})
    
        */
    }
    
    componentWillUnmount() {
        ipcRenderer.removeListener('generate-request-code-chain-response', this.onSuccessfulCodeGenerationResponse)
        ipcRenderer.removeListener('generate-request-code-chain-error', this.onCodeGenerationError)
    }

    generateLanguageSelect = () => {
        return (<div className={"LanguageSelectContainer"}>
                    <FormControl fullWidth >
                            <InputLabel id="demo-simple-select-label">{"Language Options"}</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                fullWidth
                                onChange={this.onSelectChange}
                            >
                                {this.props.codeGeneratationOptions.map((option: any) => {
                                    return option.variants.map((variant: any) => {
                                        return (<MenuItem value={`${option.key}-${variant.key}`} >
                                            {`${option.label} - ${variant.key}`}
                                        </MenuItem>);
                                    }) // flatten? 


                                })}
                            </Select>
                    </FormControl>
                </div>
        ); 
       
       
    }


    generateDialogContent = () => {
        if (this.state.generatedCodeSnippet === "") {
            return (<Typography variant='subtitle1' gutterBottom align='center'>
            { "Unable to generate code snippet, please try again later." }
            </Typography> ) 
        }


        let codeChain = this.generateCodeGenerationRequestList(); 


        return (
            <div className={"GeneratedCodeContainer"}>
                {codeChain.length === 1 ? this.generateLanguageSelect() : null }
                <CopyBlock
                text={this.state.generatedCodeSnippet}
                //showLineNumbers
                wrapLines
                theme={paraisoLight}
                />
            </div>
            
        )
    }

    render () {
        return (
            <Dialog
            open={this.props.show}
            onClose={this.props.onCloseClick}
            >
                <DialogTitle id='form-dialog-title'>Generate Code Snippets</DialogTitle>
                {this.generateDialogContent()}
                <DialogActions>
                    <Button onClick={this.onGenerateCodeClick} color='primary' disabled={this.generateCodeGenerationRequestList().length > 1}>
                        Generate Code
                    </Button>
                    <Button onClick={this.props.onCloseClick} color='primary'>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }
}

export default CodeGenerationModal; 