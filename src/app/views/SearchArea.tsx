import React, { Component } from 'react';
import GraphConfig, {
	NODE,
	EDGE,
	nodeTypes,
	edgeTypes,
	NODE_KEY,
} from './graph-config';
import { Button, FormControl, InputGroup, Modal } from 'react-bootstrap';
import 'react-bootstrap/InputGroup';

import { ipcRenderer, remote } from 'electron';
import ReactJson from 'react-json-view';
import { GraphView, IEdge, INode } from 'react-digraph';
import Graph from 'graph-data-structure';
import '../app.scss';
import Debug from '@/Debug';

const { dialog } = remote;

type SearchAreaState = {
	searchText: string;
	// method: HttpMethods;
	collection?: any;
	shouldShowModal: Boolean;
	graph: any;
	nodes: any;
	modalNodeId: string;
	internalGraph: any;
	selected: null | INode | IEdge;
	totalNodes: number;
};

// interface Request {
// 	url: string;
// 	response: any;
// }

type IGraph = {
	nodes: INode[];
	edges: IEdge[];
};

type IGraphProps = {};

type IGraphStae = {
	graph: any;
	selected: null | INode | IEdge;
	totalNodes: number;
};

enum HttpMethods {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	PATCH = 'PATCH',
	DELETE = 'DELETE',
}

const sample: IGraph = {
	nodes: [],
	edges: [],
};

class SearchArea extends Component<any, SearchAreaState> {
	GraphView: any;

	constructor(props: any) {
		super(props);

		this.state = {
			searchText: '',
			// method: HttpMethods.GET,
			collection: undefined,
			shouldShowModal: false,
			graph: sample,
			selected: null,
			totalNodes: sample.nodes.length,
			internalGraph: Graph(),
			modalNodeId: '',
			nodes: {},
		};

		this.GraphView = React.createRef();
	}

	// Helper to find the index of a given node
	getNodeIndex = (searchNode: INode | any) => {
		return this.state.graph.nodes.findIndex((node: INode) => {
			return node[NODE_KEY] === searchNode[NODE_KEY];
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
	onSelectNode = (viewNode: INode | null) => {
		const { nodes } = this.state;
		// Deselect events will send Null viewNode
		if (viewNode != null) {
			this.setState({
				selected: viewNode,
				shouldShowModal: true,
				modalNodeId: viewNode[NODE_KEY].toString(),
				searchText: nodes[viewNode[NODE_KEY].toString()]['url'] || '',
			});
		} else {
			this.setState({
				selected: viewNode,
				shouldShowModal: false,
			});
		}
	};

	// Edge 'mouseUp' handler
	onSelectEdge = (viewEdge: IEdge | null) => {
		this.setState({ selected: viewEdge });
	};

	// Updates the graph with a new node
	onCreateNode = (x: number, y: number) => {
		const graph = this.state.graph;
		const { totalNodes, internalGraph, nodes } = this.state;

		Debug.log('misc', x, y);

		const type = NODE;

		const id = Date.now();
		const viewNode = {
			id,
			title: '',
			type,
			x,
			y,
		};

		internalGraph.addNode(id.toString());
		nodes[id.toString()] = {};
		graph.nodes = [...graph.nodes, viewNode];
		this.setState(
			{ graph, totalNodes: totalNodes + 1, internalGraph, nodes },
			() => Debug.log('misc', internalGraph.nodes(), nodes)
		);
	};

	// Deletes a node from the graph
	onDeleteNode = (viewNode: INode, nodeId: string, nodeArr: INode[]) => {
		// Note: onDeleteEdge is also called from react-digraph for connected nodes
		const graph = this.state.graph;
		const { totalNodes, internalGraph, nodes } = this.state;

		graph.nodes = nodeArr;

		internalGraph.removeNode(nodeId.toString());
		delete nodes[nodeId.toString()];

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
		const graph = this.state.graph;
		const { internalGraph } = this.state;

		graph.edges = edges;

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

	// Creates a new node between two edges
	onCreateEdge = (sourceViewNode: INode, targetViewNode: INode) => {
		const graph = this.state.graph;
		const { internalGraph } = this.state;

		const type = EDGE;

		const viewEdge = {
			source: sourceViewNode[NODE_KEY],
			target: targetViewNode[NODE_KEY],
			type,
		};

		// Only add the edge when the source node is not the same as the target
		if (viewEdge.source !== viewEdge.target) {
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
	};

	// onBackgroundClick = () => {
	// 	const { shouldShowModal } = this.state;
	// 	Debug.log('misc', shouldShowModal);

	// 	if (shouldShowModal) this.setState({ shouldShowModal: false });
	// };

	toggleShouldShowModal = (value: Boolean) => {
		const { searchText, nodes, modalNodeId } = this.state;
		if (value === false) {
			nodes[modalNodeId]['url'] = searchText;
			this.setState({ shouldShowModal: value, nodes, searchText: '' });
		}
	};

	componentDidMount = () => {
		ipcRenderer.on('get-collections-response', (event: any, arg: any) => {
			Debug.log('misc', JSON.parse(arg));
		});

		ipcRenderer.send('get-collections');

		ipcRenderer.on('import-collection-url-response', (event: any, arg: any) => {
			Debug.log('misc', arg);
			this.setState({ collection: arg[0] });
		});
		ipcRenderer.on('import-collection-url-error', (event: any, arg: any) => {
			Debug.log('misc', arg);
		});

		ipcRenderer.on('get-request-response', (event: any, arg: any) => {
			Debug.log('misc', arg);
			const { nodes, modalNodeId } = this.state;
			nodes[modalNodeId.toString()]['resp'] = arg.resp;
			this.setState(
				{
					nodes,
				},
				() => Debug.log('misc', this.state.nodes)
			);
		});
		ipcRenderer.on('get-request-error', (event: any, arg: any) => {
			Debug.log('misc', arg);
		});
	};

	onChange = (e: any) => {
		this.setState(
			{
				searchText: e.target.value,
			},
			() => Debug.log('misc', this.state.searchText)
		);
	};

	fetchData = (url: string) => {
		ipcRenderer.send('import-collection-url', url);
	};

	performGet = (url: string) => {
		const { nodes, modalNodeId } = this.state;

		nodes[modalNodeId.toString()]['url'] = url;
		this.setState(
			{
				nodes,
			},
			() => Debug.log('misc', this.state.nodes)
		);
		ipcRenderer.send('get-request', { id: this.state.modalNodeId, url: url });
	};

	render() {
		const {
			searchText,
			collection,
			selected,
			totalNodes,
			modalNodeId,
			nodes: Nodes,
		} = this.state;
		const { nodes, edges } = this.state.graph;
		const { NodeTypes, EdgeTypes } = GraphConfig;
		return (
			<>
				<Modal
					show={this.state.shouldShowModal}
					onHide={() => this.toggleShouldShowModal(false)}
					backdrop='static'
					size='lg'
					keyboard={false}
					centered>
					<Modal.Body>
						<InputGroup className='mb-3'>
							<FormControl value={searchText} onChange={this.onChange} />
							<InputGroup.Append>
								<Button
									variant='primary'
									onClick={() => this.performGet(searchText)}>
									Send
								</Button>
							</InputGroup.Append>
						</InputGroup>
						<div className='result-text'>
							{modalNodeId &&
								Nodes[modalNodeId] &&
								Nodes[modalNodeId]['resp'] && (
									<ReactJson src={Nodes[modalNodeId]['resp']} />
								)}
						</div>
					</Modal.Body>
					<Modal.Footer>
						<Button
							variant='outline-secondary'
							onClick={() => this.toggleShouldShowModal(false)}>
							Close
						</Button>
					</Modal.Footer>
				</Modal>
				<div className='flex-container'>
					<div className='collections'>
						<InputGroup className='mb-3'>
							<FormControl onChange={this.onChange} />
							<InputGroup.Append>
								<Button
									variant='primary'
									onClick={() => this.fetchData(searchText)}>
									Import
								</Button>
							</InputGroup.Append>
						</InputGroup>

						{collection && <ReactJson src={collection} />}
					</div>
					<div className='graph'>
						<div id='graph'>
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
								// onBackgroundClick={this.onBackgroundClick}
								gridDotSize={2}
								maxTitleChars={30}
								layoutEngineType='None'
							/>
							<div id='graph-buttons'>
								<Button
									className='graph-buttons-item'
									variant='outline-primary'
									onClick={this.addStartNode}>
									Start a graph
								</Button>
								<span className='graph-buttons-item'>{totalNodes} node(s) </span>
								<Button
									className='graph-buttons-item'
									variant='outline-primary'
									onClick={() => this.onCreateNode(200, 200)}>
									Add a node
								</Button>
							</div>
						</div>
					</div>
					<div className='result'></div>
				</div>
			</>
		);
	}
}

export default SearchArea;
