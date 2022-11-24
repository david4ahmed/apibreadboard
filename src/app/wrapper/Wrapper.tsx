import React from 'react';
import { connect, Provider } from 'react-redux';
import { ApplicationState } from '../store';
import {
	importAllCollections,
	addCollection,
	deleteCollection,
} from '../store/collections/action';

import {
	addGraphAreaState,
} from '../store/graphArea/action';

import {
	selectRequest,
	setRequestBodies,
	setRequestQueries,
	setRequestHeaders,
	setRequestOutput,
	setRequestPath,
	setQueryDisplayValue,
    setRequestStatus,
} from '../store/requests/action';

import {
	addNodeCreatedVariable,
	deleteVariable,
	renameVariable,
	addEstrangedVariable,
	addStoreEstrangedVariable,
	addStoreNodeVariable,
	updateCheckboxState,
} from '../store/variables/action';

import {
	setTranslationCode,
	setTranslationInput,
	setTranslationOutput,
} from '../store/translation/action';

import { ThunkDispatch } from 'redux-thunk';
import { AnyAction, Store } from 'redux';

import configureStore from '@/app/store';
import { CollectionsState } from '../store/collections/types';
import { RequestsState } from '../store/requests/types';
import { VariablesMap, VariablesState } from '../store/variables/types';
import {GraphAreaStoreState} from '../store/graphArea/types';
import MainUIContainer from '../views/MainUIContainer/MainUIContainer';
import { 
	selectNode,
	addNodeID,
	removeNodeID,
	setParentNode,
	disownParentNode,
} from '../store/graph/action';
import { GraphState } from '../store/graph/types';
import { TranslationState } from '../store/translation/types';
import GraphAreaState from '../views/MainUIContainer/GraphArea/GraphArea'

interface PropsFromState {
	collections: CollectionsState;
	requests: RequestsState;
	variables: VariablesState;
	graph: GraphState;
	translation: TranslationState;
	graphA: GraphAreaStoreState;
}

interface PropsFromDispatch {
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
	deleteCollection: (CID: number) => any;
	renameVariable: (variable:string, newVariable:string, id:string) => any;
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

type AllProps = PropsFromState & PropsFromDispatch;

const Wrapper: React.FC<AllProps> = ({
	collections,
	requests,
	variables,
	graph,
	translation,
	graphA,
	importAllCollections,
	addCollection,
	selectRequest,
	setRequestBodies,
	setRequestQueries,
	setRequestPath,
	setRequestHeaders,
	addNodeCreatedVariable,
	addEstrangedVariable,
	addStoreEstrangedVariable,
	addStoreNodeVariable,
	deleteVariable,
	renameVariable,
	setRequestOutput,
	selectNode,
	deleteCollection,
	addNodeID,
	setParentNode,
	setTranslationCode,
	setTranslationInput,
	setTranslationOutput,
	addGraphAreaState,
	removeNodeID,
	setQueryDisplayValue,
	updateCheckboxState,
    setRequestStatus,
}) => {
	return (
		<MainUIContainer
			collections={collections.collections}
			requests={requests}
			variables={variables}
			graph={graph}
			translation={translation}
			graphA={graphA}
			addNodeCreatedVariable={addNodeCreatedVariable}
			addEstrangedVariable={addEstrangedVariable}
			addStoreEstrangedVariable={addStoreEstrangedVariable}
			addStoreNodeVariable={addStoreNodeVariable}
			deleteVariable={deleteVariable}
			deleteCollection={deleteCollection}
			renameVariable={renameVariable}
			importAllCollections={importAllCollections}
			addCollection={addCollection}
			selectRequest={selectRequest}
			setRequestBodies={setRequestBodies}
			setRequestQueries={setRequestQueries}
			setRequestPath={setRequestPath}
			setRequestHeaders={setRequestHeaders}
			setRequestOutput={setRequestOutput}
			selectNode={selectNode}
			addNodeID={addNodeID}
			setParentNode={setParentNode}
			disownParentNode={disownParentNode}
			setTranslationCode={setTranslationCode}
			setTranslationInput={setTranslationInput}
			setTranslationOutput={setTranslationOutput}
			addGraphAreaState={addGraphAreaState}
			removeNodeID={removeNodeID}
			setQueryDisplayValue={setQueryDisplayValue}
			updateCheckboxState={updateCheckboxState}
            setRequestStatus={setRequestStatus}
		/>
	);
};

const mapStateToProps = (state: ApplicationState) => ({
	collections: state.collections,
	requests: state.requests,
	variables: state.variables,
	translation: state.translation,
	graph: state.graph,
	graphA: state.graphA
});

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
	return {
		importAllCollections: (collections: any) =>
			dispatch(importAllCollections(collections)),
		addCollection: (collection: any) => dispatch(addCollection(collection)),
		selectRequest: (request: any) => dispatch(selectRequest(request)),
		setRequestQueries: (nid: string, queries: any) =>
			dispatch(setRequestQueries(nid, queries)),
		setRequestPath: (nid: string, paths: any) =>
			dispatch(setRequestPath(nid, paths)),
		setRequestBodies: (nid: string, bodies: any) => dispatch(setRequestBodies(nid, bodies)),
		setRequestHeaders: (nid: string, headers: any) => dispatch(setRequestHeaders(nid, headers)),
		setRequestOutput: (nid: string, output:string) => dispatch(setRequestOutput(nid,output)),
		addNodeCreatedVariable: (variable: string,
			output: string, nodeID: string) => dispatch(addNodeCreatedVariable(variable, output, nodeID)),
		addEstrangedVariable: (variable: string,
			output: string) => dispatch(addEstrangedVariable(variable, output)),
		addStoreNodeVariable: (ID: string,
				variable: string, output: string) => dispatch(addStoreNodeVariable(ID, variable, output)),
		addStoreEstrangedVariable: (ID: string,
			variable: string, output: string) => dispatch(addStoreEstrangedVariable(ID, variable, output)),
		deleteVariable: (id:string) => dispatch(deleteVariable(id)),
		deleteCollection: (CID: number) => dispatch(deleteCollection(CID)),
		renameVariable: (variable:string, newVariable:string, id:string) => dispatch(renameVariable(variable,newVariable,id)),
		selectNode: (node?: string) => dispatch(selectNode(node)),
		addNodeID: (node: string, request:any) => dispatch(addNodeID(node, request)),
		setParentNode: (childNode: string, parentNode: string) => dispatch(setParentNode(childNode, parentNode)),
		disownParentNode: (childNode: string, parentNode: string) => dispatch(disownParentNode(childNode, parentNode)),
		setTranslationCode: (node: string, code: string) => dispatch(setTranslationCode(node, code)),
		setTranslationInput: (node: string, varID: string[]) => dispatch(setTranslationInput(node, varID)),
		setTranslationOutput: (node: string, varID: string[]) => dispatch(setTranslationOutput(node, varID)),
		addGraphAreaState: (graphStateStore: any) => dispatch(addGraphAreaState(graphStateStore)),
		removeNodeID: (node?:string) => dispatch(removeNodeID(node)),
		setQueryDisplayValue: (nodeID: string, index: number,requestLength: number, displayValue: string) => dispatch(setQueryDisplayValue(nodeID, index, requestLength, displayValue)),
		updateCheckboxState: (nodeID: string, checkboxState: boolean[]) => dispatch(updateCheckboxState(nodeID, checkboxState)),
        setRequestStatus: (nodeID: string, status: string) => dispatch(setRequestStatus(nodeID, status))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Wrapper);
