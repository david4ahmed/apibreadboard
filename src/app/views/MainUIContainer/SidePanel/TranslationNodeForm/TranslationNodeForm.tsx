import './TranslationNodeForm.scss';
import React, { Component } from 'react';
import { VariablesState } from 'src/app/store/variables/types';
import { Button, Typography } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import GlobalVariableSelect from '../GlobalVariableSelect/GlobalVariableSelect';
import { evaluateScript } from '../../TranslateRequestSender';
import AceEditor from "react-ace";
import Debug from '@/Debug';

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools.js";

type TranslationNodeFormProps = {
    translationCode: string;
    translationInput: string[];
    translationOutput: string[];
    selectedNode: string;
    variables: VariablesState;
	parentNode: Set<string>;
    addNodeCreatedVariable: (variable: string,
		output: string, nodeID: string) => any;
    setTranslationCode: (node: string, code: string) => any;
    setTranslationInput: (node: string, varID: string[]) => any;
	setTranslationOutput: (node: string, varID: string[]) => any;
}

type TranslationNodeFormState = {
    selectedVariableNames: string[]; 
    selectedVariableValues: any[]; 
    selectedVariableIds: string[];
    newVariableName: string; 
    translationScript: string;
}

class TranslationNodeForm extends Component<TranslationNodeFormProps, TranslationNodeFormState> {
    
    constructor (props: any) {
        super(props);
        
        this.state = {
            selectedVariableNames: [], 
            selectedVariableValues: [], 
            selectedVariableIds: [],
            newVariableName: "", 
            translationScript: ""
        }
    }

    reloadState() {
        const inputVarIds = this.props.translationInput;
        const outputVarId = this.props.translationOutput;
        const names : string[] = [];
        const values : any[] = [];

        inputVarIds?.forEach(key => {
            if(this.props.variables.allVariables[key]){
                names.push(this.props.variables.allVariables[key].variable);
                values.push(this.props.variables.allVariables[key].output);
            }
           
        })

        this.setState({
            translationScript: this.props.translationCode || "",
            selectedVariableIds: inputVarIds || [],
            selectedVariableNames: names || [],
            selectedVariableValues: values || [],
        });
    }

    componentDidUpdate(prevProps: TranslationNodeFormProps) {
        if(prevProps.selectedNode !== this.props.selectedNode) {
            this.reloadState();
        }
    }

    componentDidMount() {
        this.reloadState();
    }

    onGlobalVariableSelect = (event: any) => {
        const keys : string[] = event.target.value;
        const values : any[] = [];
        const names : string[] = [];

        keys?.forEach(key => {
            values.push(this.props.variables.allVariables[key].output);
            names.push(this.props.variables.allVariables[key].variable);
        });

        let variableList = "";
        let variableObject = "";
        
        for(let i = 0; i < names.length; i++){
            
            variableList += "let " + names[i] + "_temp" + i + " = " + names[i] + " \n /* " + names[i] + "_temp"  + i + " = " + values[i] + "  */"  +"\n"
            if(variableObject == ""){
                variableObject += names[i] + ' : ' + names[i] + "_temp" + i;
            } else{
                variableObject += ', ' + names[i] + ' : ' +  names[i] + "_temp" + i;
            }
            
        }
        

        let evalString = `/*\nTo specify outputs for translation nodes, return an object with key:value pairs of the new name and value of the output like so return {output1: 'test1', output2: 'test2'}\n*/
                            \n${variableList} \nreturn { ${variableObject}};`
        
        this.props.setTranslationCode(this.props.selectedNode, evalString);
        this.props.setTranslationInput(this.props.selectedNode, keys);

        /*
            for each key in keys{
                selectedVariableName.add(variableValues[key].variable)
                selectedVariableValues.add(variableValues[key].putput)
            }
        */
        // selectedVariableIds = ["124", "456"];
        // selectedVariableName = ["city", "sunset"]
        // selectedVariableValue = ["Wheaton", "111111"]
        // "124" - 

        this.setState({
            selectedVariableValues: values,
            selectedVariableNames: names,
            selectedVariableIds: keys,
            translationScript: evalString,
        })
    }

    generateVariableSelect = () => {
        const regex = /^(?<id>(TR-)?\d+)-\w+$/;
        const variablesValues = Object.values(this.props.variables.estrangedVariables).concat(Object.values(this.props.variables.nodeCreatedVariables).filter((variable : any) => {
            const varNodeID : string = variable.id.match(regex)?.groups?.id;
            return this.props.parentNode.has(varNodeID);
        }));

        return (
            <GlobalVariableSelect 
                variables={variablesValues}
                id={"demo-simple-select-label"}
                name={"Translation Form"}
                inputLabel={"Input Variable"}
                onChange={this.onGlobalVariableSelect}
                multiple
                select={this.state.selectedVariableIds}
             />
        )
    }

    onTranslationScriptChange = (event: any) => {
        this.props.setTranslationCode(this.props.selectedNode, event);
        this.setState({
            translationScript: event
        })
    }

    evaluateNewVariableValue = () => {
        evaluateScript(this.props.selectedNode, this.props.addNodeCreatedVariable,
            this.state.translationScript, this.state.selectedVariableNames, this.state.selectedVariableValues);
        // try {
        //     //let newValue = eval(this.state.translationScript)
        //     let script = new Function(this.state.selectedVariableNames.join(), this.state.translationScript);
        //     let newValue = script.apply(null, this.state.selectedVariableValues);

        //     if(typeof newValue == "object") {
        //         Object.keys(newValue).forEach(key => {
        //             this.props.addNodeCreatedVariable(key, newValue[key].toString(), this.props.selectedNode)
        //         });
        //     } else {
        //         alert("Need to return object of key-value pairs!");
        //     }
        // }
        // catch (err) {
        //     alert("There was an error with the translation script provided. Please check the console for more information");
        //     console.log(err); 
        // }
    }

    onNewVariableNameChange = (event: any) => {
        this.setState({
            newVariableName: event.target.value
        })
    }

    render () {
        //console.log("RENDER WITH CODE", this.props.translationCode);
        //console.log("STATE CODE", this.state.translationScript);
        return (
            <div className="TranslationNodeFormContainer">
                <div>
                    <Typography variant='subtitle1' gutterBottom align='center'>
                        Translation Node
                    </Typography>     
                </div>

                <div>
                    {this.generateVariableSelect()}  
                </div>

                <div>
                <AceEditor
                    mode="javascript"
                    width="100%"
                    value={this.state.translationScript}
                    placeholder="In this field you are able to write in JavaScript"
                    theme="chrome"
                    onChange={this.onTranslationScriptChange}
                    name="UNIQUE_ID_OF_DIV"
                    editorProps={{ $blockScrolling: true }}
                    showGutter={false}
                    wrapEnabled={false}
                    highlightActiveLine={true}
                    enableBasicAutocompletion={true}
                    enableLiveAutocompletion={true}
                    setOptions={{
                        spellcheck: true,
                        showLineNumbers: true,
                        enableSnippets: true,
                        fontSize: "10pt"
                    }}
                />
                </div>
                
                {/* <div>
                    <TextField fullWidth id="standard-basic" label="New Variable Name" onChange={this.onNewVariableNameChange}/>
                </div> */}

                <div>
                    <Button fullWidth color='primary' onClick={this.evaluateNewVariableValue}>
                        Translate Variable
                    </Button>
                </div>
            </div>
        )
    }
}

export default TranslationNodeForm;
