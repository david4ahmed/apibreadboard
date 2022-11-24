import React, { Component } from 'react';
import './MainUIContainer.scss';
import '../../app.scss';
import GraphArea from './GraphArea/GraphArea';
import SidePanel from './SidePanel/SidePanel';
import { ipcRenderer, remote } from 'electron';
import ImportPopUp from './popups/ImportPopUp';
import ChainingPopUp from './popups/ChainingPopUp';
import { RequestsState } from '@/app/store/requests/types';
import CollectionsContainer from './CollectionsContainer';
import { VariablesMap, VariablesState } from '../../store/variables/types';
import { Tab, Tabs } from 'react-bootstrap';
import GlobalVariableContainer from './GlobalVariableContainer';
import GlobalVarPopUp from './popups/GlobalVarPopUp';
import { GraphState } from '@/app/store/graph/types';
import {GraphAreaStoreState} from '../../store/graphArea/types';
import CodeGenerationModal from './CodeGenerationModal/CodeGenerationModal';
import { TranslationState } from '@/app/store/translation/types';
import Debug from '@/Debug';
import HelpPopUp from './popups/HelpPopUp';
import ResponseHandler from './ResponseHandler';

/* 

    Will have to define a state for this component as a type

*/

interface MainUIContainerProps {
	collections: any[];
	requests: RequestsState;
	variables: VariablesState;
	graph: GraphState;

	translation: TranslationState;
	graphA: GraphAreaStoreState;
	importAllCollections: (collections: any) => any;
	addCollection: (collection: any) => any;
	selectRequest: (request: any) => any;
	setRequestQueries: (nid: string, queries: any) => any;
	setRequestPath: (nid: string, paths: any) => any;
	setRequestBodies: (nid: string, bodies: any) => any;
	setRequestHeaders: (nid: string, headers: any) => any;
	setRequestOutput: (nid: string, output:string) => any;
	addNodeCreatedVariable: (variable: string,
		output: string, nodeID: string) => any;
	addEstrangedVariable: (variable: string,
			output: string) => any;
	addStoreEstrangedVariable: (ID: string,
		variable: string, output: string) => any;
	addStoreNodeVariable: (ID: string,
		variable: string, output: string) => any;
	deleteVariable: (id:string) => any;
	renameVariable: (variable:string, newVariable:string, id:string) => any;
	deleteCollection: (CID: number) => any;
	selectNode: (node?: string) => any;
	addNodeID: (node:string, request:any) => any;
	setParentNode: (childNode: string, parentNode: string) => any;
	disownParentNode: (childNode: string, parentNode: string) => any;
	setTranslationCode: (node: string, code: string) => any;
	setTranslationInput: (node: string, varID: string[]) => any;
	setTranslationOutput: (node: string, varID: string[]) => any;
	addGraphAreaState: (graphStateStore: any) => any;
	removeNodeID: (node?:string) => any;
	setQueryDisplayValue: (nodeID: string, index: number,requestLength: number, displayValue: string) => any;
	updateCheckboxState: (nodeID: string, checkboxState: boolean[]) => any;
    setRequestStatus: (nodeID: string, status: string) => any;
}

interface MainUIContainerState {
	showImportModal: boolean;
	showGlobalVarModal: boolean;
	showHelpModal: boolean;
	showChainModal: boolean;
	showCodeGenerationModal: boolean; 
	importTextValue: string;
	selectedRequest: any;
	runOutput: any;
	chainSource: string;
	chainTarget: string;
	codeGenerationOptions: []; 
}

class MainUIContainer extends Component<
	MainUIContainerProps,
	MainUIContainerState
> {
	constructor(props: any) {
		super(props);

		this.state = {
			showImportModal: false,
			showGlobalVarModal: false,
			showHelpModal: false,
			showChainModal: false,
			importTextValue: '',
			selectedRequest: null,
			showCodeGenerationModal: false,
			runOutput: null,
			chainSource: "",
			chainTarget: "",
			codeGenerationOptions: []
		};

		window.addEventListener('beforeunload', () => {
			ipcRenderer.send('save-variables', this.props.variables);
			//ipcRenderer.send('save-graph', this.props.graphA.graphStateStore)
			//ipcRenderer.send('save-requests', this.props.requests)
			//alert("hey")
			//Debug.log('YM', "graph props", this.props.graphA);
			//Debug.log('YM', "graph redux state", this.props.graph);
			//ipcRenderer.send('save-graph', this.props.graphA);
			//ipcRenderer.send('save-requests', this.props.requests);
		})
	}

	onCloseImportModal = () => {
		this.setState({
			showImportModal: false,
		});
	};

	onCloseGlobalVarModal = () => {
		this.setState({
			showGlobalVarModal: false,
		});
	};

	onCloseChainingVarModal = () => {
		this.setState({
			showChainModal: false,
		});
		
	};

	onNodesConnected = (source: string, target: string) => {
		console.log("inside", source, target)
		this.setState({
			showChainModal: true,
			chainSource: source,
			chainTarget: target
		});
	}

	onCloseHelpModal = () => {
		this.setState({
			showHelpModal: false,
		});
	}

	onImportButtonClick = () => {
		this.setState({
			showImportModal: true,
		});
	};

	onAddButtonClick = () => {
		this.setState({
			showGlobalVarModal: true,
		});
	};

	onHelpButtonClick = () => {
		//console.log("help");
		this.setState({
			showHelpModal: true,
		});
		//console.log(this.state.showHelpModal);
	}

	onTextInputChange = (event: any) => {
		Debug.log('misc', event.target.value);

		this.setState({
			importTextValue: event.target.value,
		});
	};

	importCollectionViaURL = (url: string) => {
		Debug.log('misc', 'import collection url');
		ipcRenderer.send('import-collection-url', url);
	};

	onImportUrlClick = () => {
		Debug.log('misc', 'Hey we clicked the import button');
		Debug.log('misc', this.state.importTextValue);

		this.importCollectionViaURL(this.state.importTextValue);

		this.setState({
			showImportModal: false,
		});
	};

	onRequestClick = (request: any) => {
		Debug.log('misc', request);
		this.props.selectRequest(request);
		this.setState({
			selectedRequest: request,
		});
	};
	
	toggleCodeGenerationModal = () => {
		this.setState({
			showCodeGenerationModal: true
		})
	}

	onCloseCodeGenerationModal = () => {
		this.setState({
			showCodeGenerationModal: false
		})
	}

	setRunOutput = (nodeID:string) => {
		const output = this.props.requests.requestOutput[nodeID];

		this.setState({
			runOutput: output
		})
	}

	// componentWillUnmount(){
	// 	ipcRenderer.send('test', "hellllllllllooooo");
	// }
	componentDidMount() {
		ipcRenderer.on('get-collections-response', (event: any, arg: any) => {
			const importedCollections = JSON.parse(arg);
			Debug.log('YM',"simple Collections" ,importedCollections);

			this.props.importAllCollections(importedCollections);
		});

		ipcRenderer.on('import-collection-response', (event: any, arg: any) => {
			// alert('Hey we got a url response');
			const newlyImportedCollection = JSON.parse(arg[1]);

			Debug.log('WPT', "DEBUG Collection", arg[0]);
			Debug.log('WPT', newlyImportedCollection);
			this.props.addCollection(newlyImportedCollection);
			this.setState({
				importTextValue: '',
			});
		});

		ipcRenderer.on('import-collection-error', (event: any, arg: any) => {
			alert('Hey you got an error');
		});

		ipcRenderer.on('get-variables-response', (event: any, globalVariables: VariablesMap) => {
			const variablesEntries = [...Object.entries(globalVariables)];
			variablesEntries.forEach(([id, variableObj]) => {
				
				//console.log("comes hereeeeeee", variablesEntries);
				if(id[0] == '-'){
					this.props.addStoreEstrangedVariable(id, variableObj.variable, variableObj.output)
				} else {
					this.props.addStoreNodeVariable(id, variableObj.variable, variableObj.output)
				}
				//console.log("obj", variableObj);
				//this.storeVariables.set(id, variableObj);
	 
			});
			Debug.log('misc', "got emmmm", globalVariables);
		})

		ipcRenderer.on('get-code-gen-languages-response', (event: any, arg: any) => {
			// set state to be equal to the response 
			this.setState({
				codeGenerationOptions: arg
			})
		})

		ipcRenderer.on('get-code-gen-languages-error', (event: any, arg: any) => {
			alert("There was an error getting the language options for Code Generation. Because of this, we will be defaulted to JavaScript. Check the console for more information");
		})


		ipcRenderer.send('get-collections');
		ipcRenderer.send('get-code-gen-languages')
		ipcRenderer.send('get-variables');
		//ipcRenderer.send('send-variables', "hello there");
	}

	/* 
        TODO save the collections on ComponentWillRemove() 

        Future TODO - handle errors - hey your import is fucked 
    */
	render() {
		if (this.props.collections.length > 0) {
			// alert('hey we won:');
			// alert(this.state.collections.length);
		}
		
		//console.log("printing redux variables", this.props.variables);
		return (
			<>
				<div className='MainUIContainer'>

					{this.state.showCodeGenerationModal ? <CodeGenerationModal 
						onCloseClick={this.onCloseCodeGenerationModal}
						show={this.state.showCodeGenerationModal}
						codeGenerationObject={this.props.requests.selectedRequest} 
						variables={this.props.variables}
						requestBodies={this.props.requests.requestBodies}
						requestQueries={this.props.requests.requestQueries}
						requestPath={this.props.requests.requestPath}
						requestHeaders={this.props.requests.requestHeaders}
						selectedNode={this.props.graph.selectedNode || ""}
						translation={this.props.translation}
						graphA= {this.props.graphA}
						codeGeneratationOptions={this.state.codeGenerationOptions}
					/> : null}

					<ImportPopUp
						onCloseClick={this.onCloseImportModal}
						importClicked={this.state.showImportModal}
					/>
		
					<HelpPopUp
						onCloseClick={this.onCloseHelpModal}
						helpClicked={this.state.showHelpModal}
					/>

					<GlobalVarPopUp
						onCloseClick={this.onCloseGlobalVarModal}
						addClicked={this.state.showGlobalVarModal}
						addEstrangedVariable={this.props.addEstrangedVariable}
					/>
					<ChainingPopUp
						requestOutputState={this.props.requests.requestOutput}
						onCloseClick={this.onCloseChainingVarModal}
						showPopup={this.state.showChainModal}
						nodeIDSource={this.state.chainSource}
						nodeIDTarget={this.state.chainTarget}
						deleteVariable={this.props.deleteVariable}
						addNodeCreatedVariable={this.props.addNodeCreatedVariable}
						allNodeRequests={this.props.graph.allNodeRequests}
						variables={this.props.variables}
						requestState={this.props.requests}

						setRequestQueries={this.props.setRequestQueries}
						setRequestPath={this.props.setRequestPath}
						setRequestBodies={this.props.setRequestBodies}
						setRequestHeaders={this.props.setRequestHeaders}
						updateCheckboxState={this.props.updateCheckboxState}
					/>
					<ResponseHandler
						selectedNode={this.props.graph.selectedNode || ""}
						variables={this.props.variables}
						setRequestOutput={this.props.setRequestOutput}
						addStoreNodeVariable={this.props.addStoreNodeVariable}
                        setRequestStatus={this.props.setRequestStatus}
					/>
					<div className='TabContainer' style={{width: '17%'}}>
					<Tabs>
						<Tab eventKey="collections" title="Collections">
							<CollectionsContainer
								onImportButtonClick={this.onImportButtonClick}
								onHelpButtonClick={this.onHelpButtonClick}
								collections={this.props.collections}
								selectRequest={this.props.selectRequest}
								deleteCollection={this.props.deleteCollection}
							/>
						</Tab>
						<Tab eventKey="globals" title="Global Variables">
							<div className='GlobalVariableContainer'>
								{/* <div className='Title'>
									<Typography variant='subtitle1' gutterBottom align='center'>
										Global Variables
									</Typography>
								</div> */}
								<GlobalVariableContainer
									onAddButtonClick={this.onAddButtonClick}
									variables={this.props.variables}
									deleteVariable={this.props.deleteVariable}
									renameVariable={this.props.renameVariable}
								/>
							</div>
						</Tab>
					</Tabs>
					</div>
					<div className='GraphContainer'>
						<div className='InnerContainer'>
							<div className='InnerGraphContainer'>
								<GraphArea
									setRequestBodies={this.props.setRequestBodies}
									setRequestQueries={this.props.setRequestQueries}
									setRequestPath={this.props.setRequestPath}
									setRequestHeaders={this.props.setRequestHeaders}
									collections={this.props.collections}
									parentNodes={this.props.graph.parentNodes}
									nodeCreatedVariables={this.props.variables.nodeCreatedVariables}
									selectNode={this.props.selectNode}
									selectRequest={this.props.selectRequest}
									nodeIDs = {this.props.graph.nodeIDs}
									selectedRequest={this.props.requests.selectedRequest}
									addEstrangedVariable={this.props.addEstrangedVariable}
									deleteVariable={this.props.deleteVariable}
									addNodeID={this.props.addNodeID}
									addGraphAreaState={this.props.addGraphAreaState}
									graphA= {this.props.graphA}
									requestsState={this.props.requests}
									removeNodeID={this.props.removeNodeID}
									variables={this.props.variables}
									translations={this.props.translation}
									setRunOutput={this.setRunOutput}
									onNodesConnected={this.onNodesConnected}
									setRequestOutput={this.props.setRequestOutput}
									addNodeCreatedVariable={this.props.addNodeCreatedVariable}
									setParentNode={this.props.setParentNode}
									disownParentNode={this.props.disownParentNode}
									addStoreNodeVariable={this.props.addStoreNodeVariable}
                                    setRequestStatus={this.props.setRequestStatus}
								/>
							</div> 
							<div className='SidePanelContainer'>
								{/* {!this.props.requests.selectedRequest ? (
									<SidePanel
										extractedBodies={this.props.requests.extractedBodies}
										extractedQueries={this.props.requests.extractedQueries}
										extractedHeaders={this.props.requests.extractedHeaders}
										setExtractedBodies={this.props.setExtractedBodies}
										setExtractedQueries={this.props.setExtractedQueries}
										setExtractedHeaders={this.props.setExtractedHeaders}
										selectRequest={this.props.selectRequest}
										setVariableOutput={this.props.setVariableOutput}
										deleteVariable={this.props.deleteVariable}
										setRequestOutput={this.props.setRequestOutput}
										requestOutput={this.props.requests.requestOutput}
										
									/>
								) : ( */}
									<SidePanel
										selectedRequest={this.props.requests.selectedRequest}
										selectedNode={this.props.graph.selectedNode}
										requestBodies={this.props.requests.requestBodies}
										requestQueries={this.props.requests.requestQueries}
										requestPath={this.props.requests.requestPath}
                                        requestStatus={this.props.requests.requestStatus}
										extractedHeaders={this.props.requests.requestHeaders}
										setQueryDisplayValue={this.props.setQueryDisplayValue}
										queryDisplayValue={this.props.requests.queryDisplayValue}
										setRequestBodies={this.props.setRequestBodies}
										setRequestQueries={this.props.setRequestQueries}
										setRequestPath={this.props.setRequestPath}
										setRequestHeaders={this.props.setRequestHeaders}
										selectRequest={this.props.selectRequest}
										selectNode={this.props.selectNode}
										addNodeCreatedVariable={this.props.addNodeCreatedVariable}
										deleteVariable={this.props.deleteVariable}
										setRequestOutput={this.props.setRequestOutput}
										requestOutput={this.props.requests.requestOutput}
										variables={this.props.variables}
										parentNodes={this.props.graph.parentNodes}
										setParentNode={this.props.setParentNode}
										disownParentNode={this.props.disownParentNode}
										toggleCodeGenerationModal={this.toggleCodeGenerationModal}
										setTranslationCode={this.props.setTranslationCode}
										setTranslationInput={this.props.setTranslationInput}
										setTranslationOutput={this.props.setTranslationOutput}
										translationCode={this.props.translation.translationCode}
										translationInput={this.props.translation.inputVars}
										translationOutput={this.props.translation.outputVar}
										runOutput={this.state.runOutput}
										addStoreNodeVariable={this.props.addStoreNodeVariable}
									/>
							</div>
						</div>
					</div>
				</div>
			</>
		);
	}
}

export default MainUIContainer;
