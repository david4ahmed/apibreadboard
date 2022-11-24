import Debug from '@/Debug';
import { Reducer } from 'redux';
import { setRequestQueries } from './action';
import { RequestActionTypes, RequestsState } from './types';

export const initialState: RequestsState = {
	selectedRequest: undefined,
	requestHeaders: {},
	requestBodies: {},
	requestQueries: {},
	requestOutput: {},
	requestPath: {},
	queryDisplayValue: {},
    requestStatus: {},
};

const reducer: Reducer<RequestsState> = (state = initialState, action) => {
	switch (action.type) {
		case RequestActionTypes.SELECT_REQUEST: {
			Debug.log('misc', "here i am in the reducer")
			Debug.log('misc', action.payload)
			return { ...state, selectedRequest: action.payload };
		}
		case RequestActionTypes.SET_REQUEST_BODIES: {
			const payload: string[] = action.payload;
			const key = `${payload[0]}`;
			Debug.log('misc', `<<<<<<<<<<Printing result body; key: ${key}, output: ${payload[1]}`);
			return { ...state, requestBodies: {...state.requestBodies, [key]: payload[1]} };
		}
		case RequestActionTypes.SET_REQUEST_HEADERS: {
			const payload: string[] = action.payload;
			const key = `${payload[0]}`;
			Debug.log('misc', `<<<<<<<<<<Printing result header; key: ${key}, output: ${payload[1]}`);
			return { ...state, requestHeaders: {...state.requestHeaders, [key]: payload[1]} };
		}
		case RequestActionTypes.SET_REQUEST_QUERIES: {
			const payload: string[] = action.payload;
			const key = `${payload[0]}`;
			Debug.log('misc', `<<<<<<<<<<Printing result query; key: ${key}, output: ${payload[1]}`);
			return { ...state, requestQueries: {...state.requestQueries, [key]: payload[1]} };
		}
		case RequestActionTypes.SET_REQUEST_OUTPUT: {
			const payload: string[] = action.payload;
			const key = `${payload[0]}`;
			Debug.log('misc', `<<<<<<<<<<Printing result output; key: ${key}, output: ${payload[1]}`);
			return { ...state, requestOutput: {...state.requestOutput, [key]: payload[1]} };
		}
		case RequestActionTypes.SET_REQUEST_PATH: {
			const payload: string[] = action.payload;
			const key = `${payload[0]}`;
			Debug.log('misc', `<<<<<<<<<<Printing result path; key: ${key}, output: ${payload[1]}`);
			return { ...state, requestPath: {...state.requestPath, [key]: payload[1]} };
		}
		case RequestActionTypes.SET_QUERY_DISPLAY_VALUE: {
			const nodeID: string = action.payload[0];
			const index: number = action.payload[1];
			const requestLength: number = action.payload[2];
			const displayValue: string = action.payload[3];

			if(!(nodeID in state.queryDisplayValue)){
				const displayQueries: string[] = [];
				for(let i = 0; i < requestLength; i++)
					displayQueries.push("");
				displayQueries[index] = displayValue;

				return {...state, queryDisplayValue: {...state.queryDisplayValue, [nodeID]: {queryValues: displayQueries}}};
			} else {
				const displayQueries = state.queryDisplayValue[nodeID].queryValues;
				displayQueries[index] = displayValue;

				return {...state, queryDisplayValue: {...state.queryDisplayValue, [nodeID]: {queryValues: displayQueries}}};
			}


		}
        case RequestActionTypes.SET_REQUEST_STATUS: {
            const payload: string[] = action.payload;
			const key = `${payload[0]}`;
            console.log("AAAA",payload[1]);
			return { ...state, requestStatus: {...state.requestStatus, [key]: payload[1]} };
        }
		default:
			return state;
	}
};

export { reducer as RequestsReducer };
