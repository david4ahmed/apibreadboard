import React, { Component } from 'react';
import isEqual from 'lodash/isEqual';
import GraphConfig, {
	NODE,
	EDGE,
	TRANSLATION_NODE,
	nodeTypes,
	edgeTypes,
	NODE_KEY,
} from '../../graph-config';

import { GraphView, IEdge, INode } from 'react-digraph';
import Graph from 'graph-data-structure';

import { Button } from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import './GraphArea.scss';
import { 
	selectNode,
	addNodeID,
 } from '@/app/store/graph/action';
import { TranslationState } from '@/app/store/translation/types'
import { VariablesState, VariablesMap } from '@/app/store/variables/types';
import { GraphAreaStoreState } from '@/app/store/graphArea/types';
import { RequestsState } from "@/app/store/requests/types";
import {sendRequestWithState} from '../NodeRequestSender';
import Debug from '@/Debug';
import { FastForward, Loop, SkipNext } from '@material-ui/icons';
import { evaluateScriptFromState } from '../TranslateRequestSender';
import ResponseHandler from '../ResponseHandler';

import {ipcRenderer, remote } from 'electron';
import { app } from 'electron/main';


type IGraph = {
	nodes: INode[];
	edges: IEdge[];
};

const sample: IGraph = {
	nodes: [],
	edges: [],
};

interface GraphAreaProps {
	collections: any[];
	parentNodes: Object;
	selectedRequest: any;
	requestsState: RequestsState;
	nodeIDs: any[];
	graphA: GraphAreaStoreState;
	variables: VariablesState;
	nodeCreatedVariables: VariablesMap;
	translations: TranslationState;
	setRequestQueries: (nid: string, queries: any) => any;
	setRequestPath: (nid: string, paths: any) => any;
	setRequestBodies: (nid: string, bodies: any) => any;
	setRequestHeaders: (nid: string, headers: any) => any;
	selectRequest: (request: any) => any;
	selectNode: (node?: string) => any;
	addEstrangedVariable: (variable: string,
		output: string) => any;
	deleteVariable: (id:string) => any;
	addNodeID: (node: string, requests: any) => any;
	addGraphAreaState: (graphStateStore: any) => any;
	removeNodeID: (node?: string) => any;
	setRunOutput: (nodeID: string) => any;
	onNodesConnected: (source: string, target: string) => any;
	setRequestOutput: (nid: string, output:string) => any;
	addNodeCreatedVariable: (variable: string,
		output: string, nodeID: string) => any;
	setParentNode: (childNode: string, parentNode: string) => any;
	disownParentNode: (childNode: string, parentNode: string) => any;
	addStoreNodeVariable: (ID: string,
		variable: string, output: string) => any;
    setRequestStatus: (nodeID: string, status: string) => any;
}

interface GraphAreaState  {
	graph: IGraph;
	nodes: any;
	requests: any;
	collectionData: any;
	internalGraph: any;
	selected: null | INode | IEdge;
	totalNodes: number;
	selectedNodeId: string;
	runNodes: any;
	enableStep: boolean;
	bfsIterator?: Generator<Promise<void>, void, unknown>;
	bfsArray: string[];
	visitedSet: Set<string>;
	hasNodeRan: Set<string>;
};

// window.addEventListener('beforeunload', () => {
// 	//alert("in save graaaaaappphhhh");
// 	ipcRenderer.send('save-graph', "in the save graphhhhhhh");
// })
class GraphArea extends Component<GraphAreaProps, GraphAreaState> {
	GraphView: any;

	constructor(props: any) {
		super(props);

		this.state = {
			graph: sample,
			selected: null,
			totalNodes: sample.nodes.length,
			internalGraph: Graph(),
			selectedNodeId: '',
			nodes: [],
			requests: {},
			collectionData: {},
			runNodes: [],
			enableStep: false, 
			bfsArray: [],
			visitedSet: new Set(),
			hasNodeRan: new Set(),
		};
		
		this.GraphView = React.createRef();

		
	}

	componentDidMount = () => {
		// Old edge creation code that is no longer used

		// Object.entries(this.props.chainedNodes).forEach(([source, dest]) => {
		// 	const sourceNode = {[NODE_KEY]: source};
		// 	Object.keys(dest).forEach((destination) => {
		// 		const destinationNode = {[NODE_KEY]: destination};
		// 		if(!this.state.internalGraph.adjacent(source.includes(destination)))
		// 			this.onCreateEdge(sourceNode, destinationNode, true);
		// 	});
		// })


		// ipcRenderer.on('read-graph-response', (_, arg) => {
		// 	const {graph, internalGraph, requests, totalNodes} = arg;
		// 	this.setState({
		// 		graph: graph || sample,
		// 		requests: requests || {},
		// 		internalGraph: internalGraph ? Graph().deserialize(internalGraph) : Graph(),
		// 		totalNodes: totalNodes || sample.nodes.length,
		// 	}, () => {
		// 		Object.entries(requests).forEach(([nid, req]) => {
		// 			if(nid in this.state.graph.nodes && !(nid in this.props.nodeIDs)){
		// 				this.props.addNodeID(nid, req);
		// 			}
		// 		})
		// 	});
		// 	console.log(arg);
		// })

		// ipcRenderer.on('get-requests-response', (_, arg) => {
		// 	const {queries, bodies, headers, path} = arg;
		// 	Object.entries(queries).forEach(([key, val]) => {
		// 		this.props.setRequestQueries(key, val)
		// 	});
		// 	Object.entries(bodies).forEach(([key, val]) => {
		// 		this.props.setRequestBodies(key, val)
		// 	});
		// 	Object.entries(headers).forEach(([key, val]) => {
		// 		this.props.setRequestHeaders(key, val)
		// 	});
		// 	Object.entries(path).forEach(([key, val]) => {
		// 		this.props.setRequestPath(key, val)
		// 	});
		// });
		// ipcRenderer.send('read-graph');
		// ipcRenderer.send('get-requests')
	}

	// componentWillUnmount = () => {
	// 	ipcRenderer.removeAllListeners('read-graph-response');
	// 	ipcRenderer.removeAllListeners('get-requests-response');
	// }

	componentDidUpdate = (prevProps: GraphAreaProps, prevState: GraphAreaState) => {
		//console.log("th", this.props.graphA);

		// const {graph, requests} = prevState;
		// const {graph: currGraph, requests: currRequests} = this.state;

		
		// if(!isEqual(graph, currGraph) || !isEqual(requests, currRequests)){ 
		// 	console.log("asdasdsa")
		// 	this.props.addGraphAreaState({
		// 		graph: this.state.graph,
		// 		requests: this.state.requests,
		// 		internalGraph: this.state.internalGraph.serialize(),
		// 		totalNodes: this.state.totalNodes,
		// 	});
		// }
		if (this.props.selectedRequest){
			if (!this.props.selectedRequest.added){
				this.onCreateNode(200,200, true);
			}
		}


		// const difference: ChainedNodes = this.difference(this.props.chainedNodes, prevProps.chainedNodes)
		// if(!_.isEmpty(difference)){
		// 	//console.log(difference, 'differenceeeeeeeee')

		// 	Object.entries(difference).forEach(([source, dest]) => {
		// 				const sourceNode = {[NODE_KEY]: source};
		// 				Object.keys(dest).forEach(destination => {
		// 					const currCount = this.props.chainedNodes[source][destination];
		// 					// const prevCount = prevProps.chainedNodes[source][destination];
		// 					//console.log(currCount,'Countsssssss')
		// 					const destinationNode = {[NODE_KEY]: destination};
		// 					if(currCount === 0){
		// 						// time to delete the edge
		// 						const edge: IEdge = {source: source, target: destination};
		// 						const realEdgeIdx = this.getEdgeIndex(edge);
		// 						const realEdge = this.state.graph.edges[realEdgeIdx];
		// 						const edges = this.state.graph.edges.filter(edge => edge.source.toString() !== source && edge.target.toString() !== destination);
		// 						this.onDeleteEdge(realEdge, edges);
		// 					}
		// 					else if(!this.state.internalGraph.adjacent(source).includes(destination)){
		// 						//console.log("sdljdogjmdogbmom", this.props.chainedNodes[source])
		// 						this.onCreateEdge(sourceNode, destinationNode, true);
		// 					}
		// 				});
		// 			})
		// }

	
	}

	difference = (object: any, base: any) => {
		const changes = (object: any, base: any) => {
			return _.transform(object, function(result: any, value, key) {
				if (!_.isEqual(value, base[key])) {
					result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
				}
			});
		}
		return changes(object, base);
	}
	// Helper to find the index of a given node
	getNodeIndex = (searchNode: INode | any) => {
		return this.state.graph.nodes.findIndex((node: INode) => {
			return node[NODE_KEY].toString() === searchNode[NODE_KEY].toString();
		});
	};

	// Helper to find the index of a given edge
	getEdgeIndex = (searchEdge: IEdge) => {
		return this.state.graph.edges.findIndex((edge: IEdge) => {
			return (
				edge.source === searchEdge.source && edge.target === searchEdge.target
			);
		});
	};

	// Given a nodeKey, return the corresponding node
	getViewNode = (nodeKey: string) => {
		const searchNode = { [NODE_KEY]: '' };

		searchNode[NODE_KEY] = nodeKey;
		const i = this.getNodeIndex(searchNode);
		//console.log(i, 'index')

		return this.state.graph.nodes[i];
	};

	addStartNode = () => {
		const graph = this.state.graph;
		const { totalNodes, internalGraph, nodes } = this.state;

		// using a new array like this creates a new memory reference
		// this will force a re-render
		const id = Date.now();
		graph.nodes = [
			{
				id,
				title: 'Start Here!',
				type: NODE,
				x: 200,
				y: 200,
			},
			...this.state.graph.nodes,
		];

		internalGraph.addNode(id.toString());
		nodes[id.toString()] = {};
		this.setState(
			{
				graph,
				totalNodes: totalNodes + 1,
				internalGraph,
				nodes,
			},
			() => Debug.log('misc', internalGraph.nodes(), nodes)
		);
	};

	// Called by 'drag' handler, etc..
	// to sync updates from D3 with the graph
	onUpdateNode = (viewNode: INode) => {
		const graph = this.state.graph;
		const i = this.getNodeIndex(viewNode);

		Debug.log('misc', viewNode);
		graph.nodes[i] = viewNode;
		this.setState({ graph });
	};

	// Node 'mouseUp' handler
	onSelectNode = (viewNode: INode | null, callbackAfterSelection?: (nid: string) => any) => {
		const { nodes, requests, collectionData } = this.state;
		const selectRequest : (request: any) => any = this.props.selectRequest;
		const selectNode : (node?: string) => any = this.props.selectNode;
		
		// Deselect events will send Null viewNode
		return new Promise<void>((resolve, _) => {
			if (viewNode != null) {
				console.log('This is the selected node: ',viewNode[NODE_KEY]);
				this.setState({
					selected: viewNode,
				}, () => {
					selectNode(viewNode[NODE_KEY].toString()).then(() => {
						if (viewNode.type === TRANSLATION_NODE) {
							selectRequest(undefined).then(() => {
								if(callbackAfterSelection?.toString() === "selectNodeCallback") {if(this.state.selected) callbackAfterSelection(this.state.selected[NODE_KEY]).then(() => resolve())}
							});
							;
						}
						else {
							selectRequest({...requests[viewNode[NODE_KEY].toString()], added: true}).then(() => {
								if(callbackAfterSelection?.toString() === "selectNodeCallback") {if(this.state.selected) callbackAfterSelection(this.state.selected[NODE_KEY]).then(() => resolve())}
							});
						}
					});
				});
				
			} else {
				this.setState({
					selected: viewNode,
					// shouldShowModal: false,
				}, () => selectNode(undefined));
				resolve();
				
			}
		})
	};

	// Edge 'mouseUp' handler
	onSelectEdge = (viewEdge: IEdge | null) => {
		console.log("selected", viewEdge?.source, viewEdge?.target)
		if(viewEdge != null) {
			this.setState({ selected: viewEdge });
			this.props.onNodesConnected(viewEdge.source, viewEdge.target);
		}
	};

	// Updates the graph with a new node
	onCreateNode = (x: number, y: number, requestCreated?: boolean) => {
		if(requestCreated === true){
			const graph = {...this.state.graph};
			const requests = {...this.state.requests}
			const { totalNodes, internalGraph, nodes, collectionData} = this.state;
			const selectRequest : (request: any) => any = this.props.selectRequest;
			const addNodeID: (node:string, request: any) => any = this.props.addNodeID;
			Debug.log('misc', x, y);

			const type = NODE;

			const id = Date.now();
			const viewNode = {
				id,
				title:
					this.props.selectedRequest?.method +
					' - ' +
					this.props.selectedRequest?.requestName,
				type,
				x,
				y,
			};

			Debug.log('misc', this.props.selectedRequest);
			internalGraph.addNode(id.toString());
			nodes[id.toString()] = NODE;
			requests[id.toString()] = this.props.selectedRequest;
			graph.nodes = [...graph.nodes, viewNode];
			this.setState(
				{ graph, totalNodes: totalNodes + 1, internalGraph, nodes, requests },
				() => Debug.log('misc', internalGraph.nodes(), nodes)
			);
			selectRequest({...requests[id.toString()], added: true, nodeID: id.toString()});
			// Debug.log('misc', this.props.selectedRequest);
			addNodeID(id.toString(), this.props.selectedRequest);
			// Debug.log('misc', "printing state of graph", this.state);
			// Debug.log('misc', "th", this.props.graphA);
			// Debug.log('misc', nodes[id.toString()]);
		}
	}; 



	onCreateTranslationNode = (x: number, y: number) => {
		const graph = {...this.state.graph};
	
		const { totalNodes, internalGraph, nodes} = this.state;

		const type = TRANSLATION_NODE; 

		const id = `TR-${Date.now()}`;
		const viewNode = {
			id,
			title: "",
			type,
			x,
			y,
		};

		internalGraph.addNode(id);
		nodes[id.toString()] = TRANSLATION_NODE; // not sure what this is for or is this really needed 
		graph.nodes = [...graph.nodes, viewNode];
		this.setState(
			{ graph, totalNodes: totalNodes + 1, internalGraph, nodes },
			() => Debug.log('misc', internalGraph.nodes(), nodes)
		);
		this.props.addNodeID(id, undefined);
	}

	// Deletes a node from the graph
	onDeleteNode = (viewNode: INode, nodeId: string, nodeArr: INode[]) => {
		// Note: onDeleteEdge is also called from react-digraph for connected nodes
		const graph = {...this.state.graph};

		const { totalNodes, internalGraph, nodes } = this.state;
		const removeNodeID: (node?: string) => any = this.props.removeNodeID;

		//console.log('Node to be deleted', nodeId);
		// all of the node's variables will become enstranged
		Object.entries(this.props.nodeCreatedVariables).forEach(([id, variable]) => {
			if(id.startsWith(nodeId)){
				///this.props.addEstrangedVariable(variable.variable, variable.output);
				this.props.deleteVariable(id)
			}
		})

		graph.nodes = nodeArr;

		internalGraph.removeNode(nodeId.toString());
		delete nodes[nodeId.toString()];
		removeNodeID(nodeId);
		this.setState(
			{
				graph,
				selected: null,
				totalNodes: totalNodes - 1,
				internalGraph,
				nodes,
			},
			() => Debug.log('misc', internalGraph.nodes(), nodes)
		);
	};

	// Called when an edge is deleted
	onDeleteEdge = (viewEdge: IEdge, edges: IEdge[]) => {
		const graph = {...this.state.graph};
			
		const { internalGraph } = this.state;

		graph.edges = edges;

		this.props.disownParentNode(viewEdge.target.toString(), viewEdge.source.toString());

		this.setState(
			{
				graph,
				selected: null,
				internalGraph: internalGraph.removeEdge(
					viewEdge.source.toString(),
					viewEdge.target.toString()
				),
			},
			() =>
				Debug.log('misc', 
					this.state.internalGraph.adjacent(viewEdge.source.toString()),
					viewEdge.source,
					viewEdge.target
				)
		);
	};

	// Creates a new edge between two nodes
	onCreateEdge = (sourceViewNode: INode | any, targetViewNode: INode | any, requestCreated?: boolean) => {
		//if(/*requestCreated === true*/ true){
		const graph = {...this.state.graph};
			
		const { internalGraph } = this.state;

		const type = EDGE;

		const viewEdge = {
			source: sourceViewNode[NODE_KEY],
			target: targetViewNode[NODE_KEY],
			type,
		};

		// Only add the edge when the source node is not the same as the target
		if (viewEdge.source !== viewEdge.target) {
			this.props.setParentNode(targetViewNode[NODE_KEY].toString(), sourceViewNode[NODE_KEY].toString());
			this.props.onNodesConnected(sourceViewNode[NODE_KEY].toString(), targetViewNode[NODE_KEY].toString());

			graph.edges = [...graph.edges, viewEdge];
			this.setState(
				{
					graph,
					selected: viewEdge,
					internalGraph: internalGraph.addEdge(
						viewEdge.source.toString(),
						viewEdge.target.toString()
					),
				},
				() =>
					Debug.log('misc', 
						this.state.internalGraph.adjacent(viewEdge.source.toString()),
						viewEdge.source,
						viewEdge.target
					)
			);
		}
		// } else {
		// 	alert("Please chain variables to create an edge")
		// }
	};

	onRequestCall = (nodeID: any, syncronous: boolean) =>{
		const { runNodes, requests } = this.state;

		Debug.log('Run Button', 'got to call');
		
		runNodes.push(nodeID);

		this.setState(
			runNodes
		)

		Debug.log('Run Button', '<<<<<Run Nodes:', this.state.runNodes);
		return sendRequestWithState(nodeID.toString(), this.props.requestsState, this.props.variables, undefined, syncronous);
	}

	onTranslationCall = (nodeID: any, syncronous: boolean) =>{
		const { runNodes, requests } = this.state;

		Debug.log('Run Button', 'got to call');
		
		runNodes.push(nodeID);

		this.setState(
			runNodes
		)

		Debug.log('Run Button', '<<<<<Run Nodes:', this.state.runNodes);
		return evaluateScriptFromState(nodeID.toString(), this.props.translations, this.props.variables, this.props.addNodeCreatedVariable);
	}


	runBFS = function* (that: GraphArea){
		Debug.log('misc','rundfs');
		const visitedSet: Set<string> = new Set(Array.from(that.state.visitedSet));
		const bfsArray: string[] = [...that.state.bfsArray];

		const breakOut = (parentNodes: string[]) => {
			parentNodes.forEach(node => {
				if(that.state.internalGraph.indegree(node) === 0 && !visitedSet.has(node)){
					bfsArray.push(node)
				}
				else breakOut(getNodeParents(node))
			})
			that.setState({bfsArray});
		}

		const getNodeParents = (nid: string) => {
			const nodes: string[] = that.state.internalGraph.nodes();
			return nodes.filter(node => that.state.internalGraph.adjacent(node).includes(nid) && !visitedSet.has(node));
		}
		
		
		Debug.log('misc', 'sfdzfgvsdgvgdfsvc hi');
			while(bfsArray.length){
				let nodeID = bfsArray.shift();
				if(nodeID && !that.state.hasNodeRan.has(nodeID)){
				console.log('nodeID', nodeID)
				if(nodeID){
					visitedSet.add(nodeID);	

					let parents = getNodeParents(nodeID)
					// console.log("parentssssss", parents, visitedSet);
					
					if(parents.length){
						visitedSet.delete(nodeID);
						bfsArray.push(nodeID);
						breakOut(parents)
						nodeID = bfsArray.shift();
						if(nodeID)
							visitedSet.add(nodeID);
					}
	
					if(nodeID){
						const neighbours: string[] = that.state.internalGraph.adjacent(nodeID);
						console.log('neighbors', neighbours)
						neighbours.forEach(neighbour => {
							if(!visitedSet.has(neighbour)){
								// visitedSet.add(neighbour);
								bfsArray.push(neighbour);
							}
						})

						console.log('v', visitedSet, 'a', bfsArray);
					
						const node = that.getViewNode(nodeID)
						console.log('Run Button', node, 'node', nodeID);
						const callback = (nid: string) => 
							new Promise<void>((resolve, _) => {
								let hasNodeRan;
								if(nodeID && !that.state.hasNodeRan.has(nodeID))
									hasNodeRan = new Set([...Array.from(that.state.hasNodeRan), nodeID])

								that.setState({bfsArray, visitedSet, hasNodeRan: hasNodeRan || that.state.hasNodeRan}, () => {
									if(node.type === "defaultNode"){
										const {err, data, status} = that.onRequestCall(node[NODE_KEY], true)
										if(err){
											console.log("error message",data);
											Debug.log("WPT", data);
										}
                                        that.props.setRequestStatus(node[NODE_KEY], status);
										ResponseHandler.updateVars(data, nid, that.props.variables, that.props.addStoreNodeVariable);
										that.props.setRequestOutput(nid, JSON.stringify(data)).then(() => {
											if(err)
												that.setState({enableStep: false, bfsIterator: undefined, bfsArray: []}, () => resolve())
											else resolve();
										})
									}
									else {
										const {err} = that.onTranslationCall(node[NODE_KEY], true);
										if(err)
											that.setState({enableStep: false, bfsIterator: undefined, bfsArray: []}, () => resolve())
										else resolve();
									}
								})
							})
			
						
						callback.toString = () => "selectNodeCallback"
						that.setState({bfsArray, visitedSet});
							yield that.onSelectNode(node, callback);
						// else if(!visitedSet.has(nodeID)) yield that.onSelectNode(node, callback);
						}
					}
				}
			}
		
		that.setState({enableStep: false});
		return;
	
	}

	onSkipButton = (multiple: boolean) => {
		let res = this.state.bfsIterator?.next();
		console.log(res, "ressssss");
		if(res && !res.done){
			res.value.then(() => {
				if(multiple)
					this.onSkipButton(true)
			})
		}
	}
	
	// document.getelementByid(){

	// }
	onRunButton = () => {
		const nodeIDs = this.props.nodeIDs;
		const {nodes, runNodes} = this.state;
		const {edges} = this.state.graph;
		const bfsArray: string[] = [];
		const visitedSet: Set<string> = new Set();

		const startingNodes: string[] = this.state.internalGraph.nodes().filter((node: any) => this.state.internalGraph.indegree(node) === 0)
		if(this.state.enableStep){
			this.setState({enableStep: false});
		} else {
			if(startingNodes.length){
				//console.log(startingNodes, 'start')
				
				// startingNodes.forEach(node => {
				// 	bfsArray.push(node);
				// })
				
				//console.log(bfsArray, 'asdasdasd');
				const bfsIterator = this.runBFS(this);
				this.setState({enableStep: true, bfsArray: startingNodes, bfsIterator, visitedSet, hasNodeRan: new Set()});
			} else {
				this.setState({enableStep: false});
				alert("No Valid Starting Nodes Found");
			}
		}
	}
	// onExportClick = () => {
	// 	remote.dialog.showSaveDialog({
	// 		defaultPath: remote.app.getPath('documents') + '/graph.json',
	// 	}).then(result => {
	// 		if(!result.canceled) {
	// 			Debug.log("YM", "save file path", result.filePath);
    //             //this.props.onCloseClick();
	// 			ipcRenderer.send("save-graph",this.state);
	// 		}
	// 	});
	// }


	render() {
		const { selected, totalNodes, selectedNodeId, nodes: Nodes } = this.state;

		const { nodes, edges } = this.state.graph;
		const { NodeTypes, EdgeTypes } = GraphConfig;

		return (
			
			<div className='GraphAreaContainer'>
				<GraphView
					ref={(el) => (this.GraphView = el)}
					allowMultiSelect={false}
					nodeKey={NODE_KEY}
					nodes={nodes}
					edges={edges}
					selected={selected}
					nodeTypes={NodeTypes}
					nodeSubtypes={{}}
					edgeTypes={EdgeTypes}
					onSelectNode={this.onSelectNode}
					onSelectEdge={this.onSelectEdge}
					onUpdateNode={this.onUpdateNode}
					onDeleteNode={this.onDeleteNode}
					onDeleteEdge={this.onDeleteEdge}
					onCreateNode={this.onCreateNode}
					onCreateEdge={this.onCreateEdge}
					gridDotSize={2}
					maxTitleChars={30}
					layoutEngineType='None'
					showGraphControls={false}
				/>

				<div id='graph-area-buttons'>
					{/* <Button
						className='graph-buttons-item'
						variant='contained'
						color='primary'
						onClick={this.addStartNode}>
						Start a graph
					</Button> */}
					<span className='graph-buttons-item'>{totalNodes} node(s) </span>

					<Button
						color="primary"
						className='graph-buttons-item'
						variant='outlined'
						onClick={() => this.onCreateTranslationNode(200, 200)}>
						Add a Translation Node
					</Button>
					{/* <Button
						color="primary"
						className='graph-buttons-item'
						variant='outlined'
						onClick={() => { if(this.props.selectedRequest) this.onCreateNode(200, 200, true); else alert('Please select a request first')}}>
						Add a node
					</Button> */}
					{this.state.enableStep && <Button
						color="primary"
						className='graph-buttons-item'
						variant='outlined'
						startIcon={<SkipNext />}
						onClick={() => this.onSkipButton(true)}>
						Skip to End
					</Button>}
					{this.state.enableStep && <Button
						color="primary"
						className='graph-buttons-item'
						variant='outlined'
						startIcon={<FastForward />}
						onClick={() => this.onSkipButton(false)}>
						Step
					</Button>}
					<Button
						color="primary"
						variant='outlined'
						className='graph-buttons-item'
						startIcon={this.state.enableStep ? <Loop/> : <PlayArrowIcon />}
						onClick={() => {this.onRunButton()}}>
						{this.state.enableStep ? 'Reset' : 'Run'}
					</Button>
				</div>
			</div>
		);
	}
	
}

export default GraphArea;
