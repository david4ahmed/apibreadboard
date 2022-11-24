import { RequestActionTypes } from './types';
import { Action, Dispatch } from 'redux';
import { AppThunk } from '../index';

export const selectRequest: AppThunk = (request: any) => (
	dispatch: Dispatch
)=> new Promise<void>((resolve, _) => {
		dispatch({
			type: RequestActionTypes.SELECT_REQUEST,
			payload: request,
		});

		resolve();
	}) 

export const setRequestQueries: AppThunk = (
	nid: string,
	queries: any
	) => (
	dispatch: Dispatch
): Action => {
	return dispatch({
		type: RequestActionTypes.SET_REQUEST_QUERIES,
		payload: [nid, queries],
	});
};

export const setRequestHeaders: AppThunk = (
	nid: string,
	headers: any
	) => (
	dispatch: Dispatch
): Action => {
	return dispatch({
		type: RequestActionTypes.SET_REQUEST_HEADERS,
		payload: [nid, headers],
	});
};

export const setRequestBodies: AppThunk = (
	nid: string,
	bodies: any
	) => (
	dispatch: Dispatch
): Action => {
	return dispatch({
		type: RequestActionTypes.SET_REQUEST_BODIES,
		payload: [nid, bodies],
	});
};

export const setRequestOutput: AppThunk = (
	nid: string,
	output: string
) => (dispatch: Dispatch) => new Promise<void>((resolve, _) => {
	 dispatch({
		type: RequestActionTypes.SET_REQUEST_OUTPUT,
		payload: [nid, output]
	})
	resolve();
})


export const setRequestPath: AppThunk = (
	nid: string,
	paths: any
	) => (
	dispatch: Dispatch
): Action => {
	return dispatch({
		type: RequestActionTypes.SET_REQUEST_PATH,
		payload: [nid, paths],
	});
};

export const setQueryDisplayValue: AppThunk = (
	nodeID: string,
	index: number,
	requestLength: number,
	displayValue: string,
	) => (
	dispatch: Dispatch
): Action => {

	return dispatch({
		type: RequestActionTypes.SET_QUERY_DISPLAY_VALUE,
		payload: [nodeID, index, requestLength, displayValue],
	});
};

export const setRequestStatus: AppThunk = (
	nid: string,
	status: string,
	) => (
	dispatch: Dispatch
): Action => {
	return dispatch({
		type: RequestActionTypes.SET_REQUEST_STATUS,
		payload: [nid, status],
	});
};