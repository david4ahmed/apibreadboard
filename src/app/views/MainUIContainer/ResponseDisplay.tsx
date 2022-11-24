import React, { Component } from 'react';
import { Button, Checkbox, List, ListItem, ListItemText, TextField } from '@material-ui/core';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { VariablesMap } from '../../store/variables/types';
import { Tab, Tabs } from 'react-bootstrap';
import Debug from '@/Debug';

interface ResponseDisplayProps {
	responseJSON: string;
    sampleResponseJSON: string;
    selectedNode: string;
    useTabs?: boolean;
    checkboxState?: boolean[];
    updateCheckboxState?: (nodeID: string, checkboxState: boolean[]) => any;
    addNodeCreatedVariable: (variable: string,
		output: string, nodeID: string) => any;
	deleteVariable: (id:string) => any;
}

interface ResponseDisplayState {
	checkState: boolean[];
    flattenedJSON: any[];
    rawResponseVariableName: string; 
}

class ResponseDisplay extends Component<ResponseDisplayProps, ResponseDisplayState> {
    
    constructor(props: any) {
		super(props);
		this.state = {
			checkState: [],
            flattenedJSON: [],
            rawResponseVariableName: "",
		}
	}

    componentDidUpdate = (prevProps: ResponseDisplayProps) => {

        if((!prevProps.responseJSON && this.props.responseJSON)
                || (this.props.responseJSON && this.props.responseJSON !== prevProps.responseJSON)){
            
            const flattenedJSON = this.flattenJSON(JSON.parse(this.props.responseJSON));
            const checkState: boolean[] = [];

            flattenedJSON.forEach(_ => checkState.push(false));

            this.setState({checkState, flattenedJSON});
        } else if (!this.props.responseJSON && prevProps.responseJSON) {
            this.setState({checkState: [], flattenedJSON: []})
            //console.log("in here", this.state.checkState)
        } else if (!this.props.responseJSON && !prevProps.responseJSON && this.state.flattenedJSON.length == 0 && this.props.sampleResponseJSON) {

            const flattenedJSON = this.flattenJSON(JSON.parse(this.props.sampleResponseJSON));
            this.setState({flattenedJSON: flattenedJSON})
        }
    }

    componentDidMount() {
        let flattenedJSON = undefined;

        if(this.props.responseJSON) {
            flattenedJSON = this.flattenJSON(JSON.parse(this.props.responseJSON)); 
        } else if(this.props.sampleResponseJSON) {
            flattenedJSON = this.flattenJSON(JSON.parse(this.props.sampleResponseJSON));
        }


        if(flattenedJSON) {
            let checkState : boolean[] = []
            if(this.props.checkboxState && this.props.checkboxState.length != 0) {
                flattenedJSON.forEach((_, i) => checkState.push(this.props.checkboxState![i]));
            } else {
                flattenedJSON.forEach(_ => checkState.push(false));
            }

            this.setState({checkState, flattenedJSON});
        }
    }

    componentWillUnmount() {
        if(this.props.updateCheckboxState) {
            this.props.updateCheckboxState(this.props.selectedNode, this.state.checkState);
        }
    }

    flattenJSON(responseJSON: any[], path?: string) {
        let arr : any[] = [];
        if(!path) {
            path = "";
        } else {
            path = path + "_";
        }
        
        for(let key in responseJSON){
            if((typeof responseJSON[key]) === 'object') {
                arr = arr.concat(this.flattenJSON(responseJSON[key], path + key));
            } else{
                // Variable shouldn't start with numbers
                if(!isNaN(Number(path[0]))) {
                    path = "_" + path;
                }
                arr.push([path + key, responseJSON[key]]);
            }
        }
        
        return arr;
    }

    onCheckToggle = (idx: number, varName: string, value: any) => () => {
        const newState = [...this.state.checkState];
        newState[idx] = !newState[idx];
        
        this.setState({checkState: newState}, () => {
            const {checkState} = this.state
            const id = `${this.props.selectedNode}-${varName}`;
            //Setting variable in redux
            if(checkState[idx]) {
                const idxString = idx.toString();
                Debug.log('misc', typeof(value), value)
                this.props.addNodeCreatedVariable(varName, value.toString(), this.props.selectedNode || '')
            }else{
                //delete variable from redux store
                this.props.deleteVariable(id);
            } 
        })
    };

    onSetRawResponseVariableName = (event: any) => {
        let value = event.target.value; 

        this.setState({
            rawResponseVariableName: value
        })
    }

    onSetRawResponseVariableClick = () => {
        this.props.addNodeCreatedVariable(this.state.rawResponseVariableName, this.props.responseJSON, this.props.selectedNode || '')
    }


    generateVariableList() {
        return (
            <List style={{maxHeight: '100%', overflow: 'auto'}}>
                {this.state.flattenedJSON.map((entry : any, idx : number) => {
                    Debug.log('misc', "entry", entry);
                    return (
                        <ListItem key={idx} style={{padding: '1px'}} dense button onClick={this.onCheckToggle(idx, entry[0], entry[1])}>
                            <ListItemIcon><Checkbox edge="start" checked={this.state.checkState[idx]} /></ListItemIcon>
                            <ListItemText primary={entry[0] + ": " + entry[1]}/>
                        </ListItem>
                    );
                })}
            </List>
        );
    }

    render() {
        if(!this.props.responseJSON && !this.props.sampleResponseJSON) {
            return null;
        }
        
        
        //Debug.log('misc', "this is the response", responseJSON);
    //Debug.log('misc', "pringintttgtttgtg", flattenedJSON);
        return (
            <>
            {this.props.useTabs? (
                <div className='TabContainer'>
                    <Tabs>
                        {/* <Tab eventKey="variables" title="Variables">
                            {this.generateVariableList()}
                        </Tab> */}
                        <Tab eventKey="rawResponse" title="Raw Response">
                        <div style={{overflowX: "auto"}}><pre>{JSON.stringify(JSON.parse(this.props.responseJSON || this.props.sampleResponseJSON), null, 2) }</pre></div>
                        </Tab>
                        <Tab eventKey="createRawResponseVariable" title="Create Raw Response Variable">
                            <div>
                                <TextField fullWidth id="standard-basic" label="Raw Response Variable Name" onChange={this.onSetRawResponseVariableName}/>
                                <Button fullWidth color='primary' className='MakeRequestBtn' onClick={this.onSetRawResponseVariableClick}>
                                    Create JSON Variable
                                </Button>
                            </div>
                        </Tab> 
                    </Tabs>
                </div>
            ) : (
                <>
                    {this.generateVariableList()}
                </>
            )}
            </>
        );
    }
}

export default ResponseDisplay;


