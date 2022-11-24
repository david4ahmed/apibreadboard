import React, { Component } from 'react';
import './SidePanel.scss';
import SelectedRequestForm2 from './SelectedRequestForm/SelectedRequestForm2';
import { Button } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { VariablesState } from 'src/app/store/variables/types';
import { QueryDisplayValue, RequestData, RequestOutput } from '@/app/store/requests/types';
import TranslationNodeForm from './TranslationNodeForm/TranslationNodeForm';
import { ParentNodes } from '@/app/store/graph/types';
import { TranslationCode, TranslationInputs, TranslationOutput } from '@/app/store/translation/types';


enum SidePanelVersion {
	MAIN,
	TRANSFORM,
	NODE,
}

type SidePanelProps = {
	selectedRequest?: any;
	selectedNode?: string;
	queryDisplayValue: QueryDisplayValue;
	requestOutput: RequestOutput;
    requestStatus: RequestData;
	selectRequest: (request: any) => any;
	selectNode: (node: any) => any; 
	requestQueries: any;
	requestPath: any;
	requestBodies: any;
	extractedHeaders: any;
	setQueryDisplayValue: (nodeID: string, index: number,requestLength: number, displayValue: string) => any;
	setRequestQueries: (nid: string, queries: any) => any;
	setRequestPath: (nid: string, paths: any) => any;
	setRequestBodies: (nid: string, bodies: any) => any;
	setRequestHeaders: (nid: string, headers: any) => any;
	setRequestOutput: (nid: string, output:string) => any;
	toggleCodeGenerationModal: () => void; 
	addNodeCreatedVariable: (variable: string,
		output: string, nodeID: string) => any;
	addStoreNodeVariable: (ID: string,
		variable: string, output: string) => any;
	deleteVariable: (id:string) => any;
	variables: VariablesState;
	setParentNode: (childNode: string, parentNode: string) => any;
	parentNodes: ParentNodes;
	disownParentNode: (childNode: string, parentNode: string) => any;
	setTranslationCode: (node: string, code: string) => any;
	setTranslationInput: (node: string, varID: string[]) => any;
	setTranslationOutput: (node: string, varID: string[]) => any;
	translationCode: TranslationCode;
	translationInput: TranslationInputs;
	translationOutput: TranslationOutput;
	runOutput: any;
};

/*
	type SidePanelState = {
	currentState: SidePanelVersion;
	};
*/


/* 
    Think about how to detect the click 
    Think about how to detect the transform 
    Think about when to show main 
*/

class SidePanel extends Component<SidePanelProps> {

	/*
	constructor(props: any) {
		super(props);

		this.state = {
			currentState:
				this.props.selectedRequest !== undefined
					? SidePanelVersion.NODE
					: SidePanelVersion.MAIN,
		};
	}

	*/

	/*
	componentDidUpdate = () => {
		console.log("The component is updating I hate this so much")
		console.log(this.props);
		if (this.state.currentState !== SidePanelVersion.TRANSFORM && this.props.selectedNode?.includes("TR") && this.props.selectedRequest === undefined) {
			alert("Transformation Node Clicked")
			this.setState({
				currentState: SidePanelVersion.TRANSFORM
			})
		}
		else if (
			this.state.currentState !== SidePanelVersion.NODE &&
			this.props.selectedRequest && this.props.selectedNode
		) {
			// fix this later to implement the transformation node better
			alert("Regular Node Clicked")

			this.setState({
				currentState: SidePanelVersion.NODE,
			});
		}
	};

	*/

	
	flattenJSON(responseJSON: any[]) {
        let arr : any[] = [];
        
        //let a_aux = (responseJSON: any, arr) => {
            for(let key in responseJSON){
                if((typeof responseJSON[key]) === 'object') {
                    arr = arr.concat(this.flattenJSON(responseJSON[key]));
                } else{
                    arr.push([key, responseJSON[key]]);
                }
            }
        //}
        
        return arr;
    }

	render() {

		let currentState = SidePanelVersion.MAIN; 

		if (this.props.selectedNode?.includes("TR") && this.props.selectedRequest === undefined) {
			currentState = SidePanelVersion.TRANSFORM
		}
		else if (this.props.selectedRequest && this.props.selectedNode) {
			currentState = SidePanelVersion.NODE
		}

		switch (currentState) {
			case SidePanelVersion.MAIN: {
				if(this.props.runOutput){
				return (
					<div className='SidePanelContainer-Main'>
						<div className='ResultingCodeContainer'>
							<div className='title'>User Controls</div>
							<div className='body'>
								{JSON.stringify(JSON.parse(this.props.runOutput), null, 2)}
							</div>
						</div>
					</div>
				);
				} else {
					return (
						<div className='SidePanelContainer-Main'>
							<div className='ResultingCodeContainer'>
								<div className='title'>User Controls</div>
								<div className='body'>
										<p>To add node/request to the graph:</p>
										<p style = {{marginLeft : 20}}>Simply click on the request from the collections sidebar</p>
										<p>To create an edge between two nodes:</p>
										<p style = {{marginLeft : 20}}>Shift+click+drag from the starting node to the destination node.</p> 
										<p>To delete a node:</p>
										<p style = {{marginLeft : 20}}>Click on the node then press the delete key.</p>	
								</div>
							</div>
						</div>
					);
				}
			}

			case SidePanelVersion.NODE: {
				const key = `${this.props.selectedNode}`
				return (
					<div className='SidePanelContainer-Main'>
						<SelectedRequestForm2
							selectedRequest={this.props.selectedRequest}
							selectedNode={key}
                            status={this.props.requestStatus[key] || ""}
							requestBodies={this.props.requestBodies[key] || {}}
							requestPath={this.props.requestPath[key] || {}}
							requestQueries={this.props.requestQueries[key] || {}}
							requestHeaders={this.props.extractedHeaders[key] || {}}
							requestOutput={this.props.requestOutput[key] || ""}
							setRequestBodies={this.props.setRequestBodies}
							setRequestQueries={this.props.setRequestQueries}
							setRequestPath={this.props.setRequestPath}
							setRequestHeaders={this.props.setRequestHeaders}
							addNodeCreatedVariable={this.props.addNodeCreatedVariable}
							deleteVariable={this.props.deleteVariable}
							setRequestOutput={this.props.setRequestOutput}
							variables={this.props.variables}
							parentNode={this.props.parentNodes[key] || new Set<string>()}
							toggleCodeGenerationModal={this.props.toggleCodeGenerationModal}
						/>
						<Button 
							variant='contained'
							startIcon={<CloseIcon />}
							className='SidePanelContainer-Main-Btn'
							onClick={() => {
								this.props.selectRequest(null);
								//selectedNode = {node: this.props.default};
							}}></Button>
					</div>
				);
			}

			case SidePanelVersion.TRANSFORM: {
				return (
					<div className='SidePanelContainer-Main'>
						<TranslationNodeForm 
							selectedNode={this.props.selectedNode!}
							translationCode={this.props.translationCode[this.props.selectedNode!]}
							translationInput={this.props.translationInput[this.props.selectedNode!]}
							translationOutput={this.props.translationOutput[this.props.selectedNode!]}
							variables={this.props.variables}
							parentNode={this.props.parentNodes[this.props.selectedNode!] || new Set<string>()}
							addNodeCreatedVariable={this.props.addNodeCreatedVariable}
							setTranslationCode={this.props.setTranslationCode}
							setTranslationInput={this.props.setTranslationInput}
							setTranslationOutput={this.props.setTranslationOutput}
						/>
						<Button 
							variant='contained'
							startIcon={<CloseIcon />}
							className='SidePanelContainer-Main-Btn'
							onClick={() => {
								this.props.selectNode(undefined);
						}}></Button>
					</div>
				);
			}

			default: {
				return null;
			}
		}
	}
}

export default SidePanel;
