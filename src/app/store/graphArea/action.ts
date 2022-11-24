
import { GraphAreaActionTypes } from './types';
import { Action, Dispatch } from 'redux';
import { AppThunk } from '../index';
import GraphAreaState from '../../views/MainUIContainer/GraphArea/GraphArea'

export const addGraphAreaState: AppThunk = (graphStateStore: any) => (
	dispatch: Dispatch
): Action =>
	dispatch({
		type: GraphAreaActionTypes.ADD_GRAPH_AREA_STATE,
		payload: graphStateStore,
	});