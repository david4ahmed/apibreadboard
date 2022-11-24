export enum GraphActionTypes {
    SELECT_NODE = '@@graph/SELECT_NODE',
    ADD_NODE = '@@graph/ADD_NODE',
    SET_PARENT_NODE = '@@graph/SET_PARENT_NODE',
    DISOWN_PARENT_NODE = '@@graph/DISOWN_PARENT_NODE',
    DELETE_NODE = '@@graph/DELETE_NODE'
}

export interface GraphState {
    readonly allNodeRequests: Requests;
    selectedNode?: string;
    nodeIDs: string[];
    parentNodes: ParentNodes;
}

export interface ParentNodes {
    [nodeID: string]: Set<string>;
}

export interface Requests {
	[nodeID: string]: any;
}
