import { Action, Dispatch } from 'redux';
import { AppThunk } from '..';
import { VariablesActionTypes } from './types';

export const addNodeCreatedVariable: AppThunk = (
	variable: string,
	output: string,
	nodeID: string
) => (dispatch: Dispatch) => new Promise<void>((resolve, _) => {
	//console.log("<<<<< idx", idx);
	dispatch({
		type: VariablesActionTypes.ADD_NODE_CREATED_VARIABLE,
		payload: [variable, output, nodeID],
	});
	resolve();
})

export const addEstrangedVariable: AppThunk = (
	variable: string,
	output: string,
) => (dispatch: Dispatch): Action => {
	return dispatch({
		type: VariablesActionTypes.ADD_ESTRANGED_VARIABLE,
		payload: [variable, output],
	});
};
export const addStoreEstrangedVariable: AppThunk = (
	ID: string,
	variable: string,
	output: string,
) => (dispatch: Dispatch): Action => {
	return dispatch({
		type: VariablesActionTypes.ADD_STORE_ESTRANGED_VARIABLE,
		payload: [ID, variable, output],
	});
};
export const addStoreNodeVariable: AppThunk = (
	ID: string,
	variable: string,
	output: string,
) => (dispatch: Dispatch): Action => {
	return dispatch({
		type: VariablesActionTypes.ADD_STORE_NODE_VARIABLE,
		payload: [ID, variable, output],
	});
};
export const deleteVariable: AppThunk = (
	id: string,
) => (dispatch: Dispatch): Action => {
	return dispatch({
		type: VariablesActionTypes.DELETE_VARIABLE,
		payload: id,
	});
};

export const renameVariable: AppThunk = (
	variable: string,
	newVariable: string,
	id: string,

) => (dispatch: Dispatch): Action => {
	return dispatch({
		type: VariablesActionTypes.RENAME_VARIABLE,
		payload: [variable, newVariable, id],
	});
};

export const updateCheckboxState: AppThunk = (
	nodeID: string,
	checkboxState: boolean,
) => (dispatch: Dispatch): Action => {
	return dispatch({
		type: VariablesActionTypes.UPDATE_CHECKBOX_STATE,
		payload: [nodeID, checkboxState],
	});
};
