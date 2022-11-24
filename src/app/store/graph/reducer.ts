import Debug from '@/Debug';
import { Reducer } from 'redux';
import { GraphActionTypes, GraphState } from "./types";

const initialState: GraphState = {
    selectedNode: undefined,
	parentNodes: {},
	nodeIDs: [],
	allNodeRequests: {},
}

const reducer: Reducer<GraphState> = (state = initialState, action) => {
	switch (action.type) {
		case GraphActionTypes.SELECT_NODE: {
            Debug.log('misc', `<<<<<<<<<<Printing selected node; node: ${action.payload}`);
			return { ...state, selectedNode: action.payload };
        }
		case GraphActionTypes.ADD_NODE: {
			return {...state, nodeIDs: [...state.nodeIDs, action.payload[0]],
				allNodeRequests: {...state.allNodeRequests, [action.payload[0]]: action.payload[1]}}
		}
		case GraphActionTypes.SET_PARENT_NODE: {
			const payload: string[] = action.payload;
			const child = payload[0];
			const parent = payload[1]

			const updatedSet = new Set<string>(state.parentNodes[child]);
			updatedSet.add(parent);

			return {...state, parentNodes: {...state.parentNodes, [child]: updatedSet}}
			// if(source in state.chainedNodes && dest in state.chainedNodes[source]){
			// 	const variablesChained = state.chainedNodes[source][dest];
			// 	return {...state, chainedNodes: {...state.chainedNodes, [source]: {...state.chainedNodes[source], dest: variablesChained + 1}}};
			// } else {
			// 	if(!(source in state.chainedNodes))
			// 		return {...state, chainedNodes: {...state.chainedNodes, [source]:{[dest]: 1}}};
			// 	else
			// 	return {...state, chainedNodes: {...state.chainedNodes, [source]:{...state.chainedNodes[source], [dest]: 1}}};
			// }
		}
		case GraphActionTypes.DISOWN_PARENT_NODE: {
			const payload: string[] = action.payload;
			const child = payload[0];
			const parent = payload[1];

			const updatedSet = new Set<string>(state.parentNodes[child]);
			updatedSet.delete(parent);

			return {...state, parentNodes: {...state.parentNodes, [child]: updatedSet}}
			// if(source in state.chainedNodes && destToRemove in state.chainedNodes[source]){
			// 	const variablesChained = state.chainedNodes[source][destToRemove];
			// 	return {...state, chainedNodes: {...state.chainedNodes, [source]: {...state.chainedNodes[source], [destToRemove]: variablesChained - 1}}};
			// } 
			// return state;
		}
		case GraphActionTypes.DELETE_NODE: {
			return {...state, nodeIDs: state.nodeIDs.filter(id => id !== action.payload)};
		}
		default:
			return state;
	}
};

export { reducer as GraphReducer };


