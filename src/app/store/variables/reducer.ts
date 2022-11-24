import Debug from '@/Debug';
import { omit } from 'lodash';
import { Reducer } from 'redux';
import { VariablesActionTypes, VariablesMap, VariablesState } from './types';

const initialState: VariablesState = {
	nodeCreatedVariables: {},
	estrangedVariables: {},
	allVariables: {},
	checkboxState: {},
	namespace: new Set<string>(),
};

const generateRandomNumber = () => Math.floor(-Math.random() * 1000000000000000).toString()

const reducer: Reducer<VariablesState> = (state = initialState, action) => {
	const getValidName = (name: string, currVarID : string) => {
		let validName = name;
		let i = 0;
		while(state.namespace.has(validName)) {
			// If a variable is trying to update itself
			if(state.allVariables[currVarID]?.variable == validName) {
				// We still need to define a new set in case the returned function tries to modify it
				const updatedNamespace = new Set<string>(state.namespace);
				return [validName, updatedNamespace];
			}

			validName = name + i;
			i++;
		}

		const updatedNamespace = new Set<string>(state.namespace);
		updatedNamespace.add(validName);

		return [validName, updatedNamespace];
	}
	
	switch (action.type) {
		case VariablesActionTypes.ADD_ESTRANGED_VARIABLE: {
			const payload: string[] = action.payload;
			let key = generateRandomNumber();
			while(key in state.estrangedVariables)
				key = generateRandomNumber();

			const result : any[] = getValidName(payload[0], key);
			const name : string = result[0]
			const updatedNamespace : Set<string> = result[1];

			const varBody = {
				id: key,
				variable: name,
				output: payload[1]
			}

			return {...state, estrangedVariables: {...state.estrangedVariables, [key]: varBody},
				allVariables: {...state.allVariables, [key]: varBody},
				namespace: updatedNamespace,
			}
			// return {...state, lastVariableOutput: {...state.lastVariableOutput, variable: payload[0], output: payload[1]}};
		}
		case VariablesActionTypes.ADD_NODE_CREATED_VARIABLE: {
			const payload: string[] = action.payload;
			const key = `${payload[2]}-${payload[0]}`
			//console.log("<<<<<<<<<<Printing payload 2", payload);
			if(!state.nodeCreatedVariables[payload[2]]){
				//console.log("exissstsssss");
				const result : any[] = getValidName(payload[0], key);
				const name : string = result[0]
				const updatedNamespace : Set<string> = result[1];

				const varBody = {
					id: key,
					variable: name,
					output: payload[1]
				}

				return {...state, nodeCreatedVariables: {...state.nodeCreatedVariables, [key]: varBody},
					allVariables: {...state.allVariables, [key]: varBody},
					namespace: updatedNamespace,
				}
			}
		}
		case VariablesActionTypes.DELETE_VARIABLE: {
			const key: string = (action.payload)
			if(Number.isNaN(Number(key))){
				// the key is not a number so the variable belongs to a node
				if(key in state.nodeCreatedVariables){
					const variable = state.nodeCreatedVariables[key];
					Debug.log('misc', "<<<<<<<<<<IN DELETEEEE NODE VAR", {variable: variable.variable, output: variable.output});
					const newNodeCreatedVariables = omit(state.nodeCreatedVariables, key);
					const newAllVariables = omit(state.allVariables, key);
					
					const updatedNamespace = new Set<string>(state.namespace);
					updatedNamespace.delete(variable.variable);

					return {...state, nodeCreatedVariables: newNodeCreatedVariables, allVariables: newAllVariables,
						namespace: updatedNamespace,
					};
				}
				return state;
			} else {
				// the key is a number so the variable is estranged
				if(key in state.estrangedVariables){
					const variable = state.estrangedVariables[key];
					Debug.log('misc', "<<<<<<<<<<IN DELETEEEE ESTRANGED VAR", {variable: variable.variable, output: variable.output});
					const newEstrangedVariables = omit(state.estrangedVariables, key);
					const newAllVariables = omit(state.allVariables, key);
					
					const updatedNamespace = new Set<string>(state.namespace);
					updatedNamespace.delete(variable.variable);

					return {...state, estrangedVariables: newEstrangedVariables, allVariables: newAllVariables,
						namespace: updatedNamespace,
					};
				}
				return state;
			}
		}

		case VariablesActionTypes.RENAME_VARIABLE: {
			const payload: string[] = action.payload;
			const key = payload[2]

			const updatedNamespace = new Set<string>(state.namespace);
			updatedNamespace.delete(payload[0]);
			const result : any[] = getValidName(payload[0], key);
			const name : string = result[0]
			updatedNamespace.add(name);

			if(Number.isNaN(Number(key))){
				// the key is not a number so the variable belongs to a node
				const variable = state.nodeCreatedVariables[key];
				Debug.log('misc', "<<<<<<<<<<IN RENAME NODE VAR", {variable: payload[0], newVariable: payload[1], output: variable.output});
				return {...state, nodeCreatedVariables: {...state.nodeCreatedVariables, [key]: {...state.nodeCreatedVariables[key], variable: payload[1]}},
					allVariables: {...state.allVariables, [key]: {...state.allVariables[key], variable: payload[1]}},
					namespace: updatedNamespace
				};
			} else {
				// the key is a number so the variable is estranged
				const variable = state.estrangedVariables[key];
				Debug.log('misc', "<<<<<<<<<<IN RENAME ESTRANGED VAR", {variable: payload[0], newVariable: payload[1], output: variable.output});
				return {...state, nodeCreatedVariables: {...state.nodeCreatedVariables, [key]: {...state.estrangedVariables[key], variable: payload[1]}},
					allVariables: {...state.allVariables, [key]: {...state.allVariables[key], variable: payload[1]}},
					namespace: updatedNamespace
				};
			}									
		}

		case VariablesActionTypes.ADD_STORE_ESTRANGED_VARIABLE:{
			const payload: string[] = action.payload;

			const varBody = {
				id: payload[0],
				variable: payload[1],
				output: payload[2]
			}
		
			return {...state, estrangedVariables: {...state.estrangedVariables, [payload[0]]: varBody},
				allVariables: {...state.allVariables, [payload[0]]: varBody }
			}
			// return {...state, lastVariableOutput: {...state.lastVariableOutput, variable: payload[0], output: payload[1]}};
		}

		case VariablesActionTypes.ADD_STORE_NODE_VARIABLE: {
			const payload: string[] = action.payload;

			const varBody = {
				id: payload[0],
				variable: payload[1],
				output: payload[2]
			}
		
			return {...state, nodeCreatedVariables: {...state.nodeCreatedVariables, [payload[0]]: varBody},
				allVariables: {...state.allVariables, [payload[0]]: varBody }
			}
			// return {...state, lastVariableOutput: {...state.lastVariableOutput, variable: payload[0], output: payload[1]}};
		}

		case VariablesActionTypes.UPDATE_CHECKBOX_STATE: {
			const payload: any[] = action.payload;

			return {...state, checkboxState: {...state.checkboxState, [payload[0]]: payload[1]}}
		}

		default:
			return state;
	}
};

export { reducer as VariablesReducer };
