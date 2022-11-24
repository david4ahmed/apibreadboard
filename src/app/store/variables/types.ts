export enum VariablesActionTypes {
	ADD_NODE_CREATED_VARIABLE = '@@variables/ADD_NODE_CREATED_VARIABLE',
	ADD_ESTRANGED_VARIABLE = '@@variables/ADD_NODE_ESTRANGED_VARIABLE',
	ADD_STORE_ESTRANGED_VARIABLE = '@@variables/ADD_NODE_STORE_ESTRANGED_VARIABLE',
	DELETE_VARIABLE = '@@variables/DELETE_VARIABLE',
	RENAME_VARIABLE = '@@variables/RENAME_VARIABLE',
	ADD_STORE_NODE_VARIABLE = '@@variables/ADD_NODE_STORE_VARIABLE',
	UPDATE_CHECKBOX_STATE = '@@variables/UPDATE_CHECKBOX_STATE'
}

export interface VariablesState {
	readonly nodeCreatedVariables: VariablesMap;
	readonly estrangedVariables: VariablesMap;
	readonly allVariables: VariablesMap;

	// State for variable checkbox UI element (needed since lost on unmount)
	readonly checkboxState: CheckboxState;

	// Tracks all user facing variable names. Used to prevent duplicates.
	readonly namespace: Set<string>;
}
export interface VariablesMap {
    [key: string]: Variable;
}

export interface Variable {
	id: string,
	variable: string,
	output: string,
}
 
export interface CheckboxState {
	[nodeID: string]: boolean[];
}