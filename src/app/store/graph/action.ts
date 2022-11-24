import { GraphActionTypes } from './types';
import { Action, Dispatch } from 'redux';
import { AppThunk } from '../index';

export const selectNode: AppThunk = (node?: string) => (
	dispatch: Dispatch
) => new Promise<void>((resolve, _) => {
	dispatch({
		type: GraphActionTypes.SELECT_NODE,
		payload: node,
	});
	resolve();
})
	

export const addNodeID: AppThunk = (node: string, request: any) => (
	dispatch: Dispatch
): Action =>
	dispatch({
		type: GraphActionTypes.ADD_NODE,
		payload: [node, request],
	});

export const setParentNode: AppThunk = (childNode: string, parentNode: string) => (
	dispatch: Dispatch
): Action =>
	dispatch({
		type: GraphActionTypes.SET_PARENT_NODE,
		payload: [childNode, parentNode],
});

export const disownParentNode: AppThunk = (childNode: string, parentNode: string) => (
	dispatch: Dispatch
): Action => {
	return dispatch({
		type: GraphActionTypes.DISOWN_PARENT_NODE,
		payload: [childNode, parentNode],
});
}


export const removeNodeID: AppThunk = (node?: string) => (
	dispatch: Dispatch
	): Action =>
		dispatch({
			type: GraphActionTypes.DELETE_NODE,
			payload: node,
		})
