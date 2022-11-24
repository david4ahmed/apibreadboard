import Debug from '@/Debug';
import { Reducer } from 'redux';
import { GraphAreaActionTypes, GraphAreaStoreState} from "./types";

const initialState: GraphAreaStoreState = {
    graphStateStore: {},
}

const reducer: Reducer<GraphAreaStoreState> = (state = initialState, action) => {
	Debug.log('misc', "graph payload", action.payload);
    if(action.type == GraphAreaActionTypes.ADD_GRAPH_AREA_STATE) {
        Debug.log('misc', "ADDDDINNNGGGG GRAPH STATE", action.payload)
        return { ...state, graphStateStore: action.payload};
    }else{
        return state;
    }
        
	
};

export { reducer as GraphAreaReducer };

