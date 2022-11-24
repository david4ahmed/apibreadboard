import {
	combineReducers,
	Store,
	createStore,
	applyMiddleware,
	compose,
} from 'redux';
import {persistReducer }from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import { ActionCreator, Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { CollectionsReducer } from './collections/reducer';
import { CollectionsState } from './collections/types';

import { RequestsReducer } from './requests/reducer';
import { RequestsState } from './requests/types';

import { VariablesReducer } from './variables/reducer'
import { VariablesState } from './variables/types'

import { GraphReducer } from './graph/reducer';
import { GraphState } from './graph/types'
import { TranslationState } from './translation/types';
import { TranslationReducer } from './translation/reducer';
import { GraphAreaStoreState } from './graphArea/types';
import { GraphAreaReducer } from './graphArea/reducer';

export type AppThunk = ActionCreator<
	ThunkAction<void, ApplicationState, null, Action<string>>
>;

export interface  ApplicationState {
	collections: CollectionsState;
	requests: RequestsState;
	variables: VariablesState;
	graph: GraphState;
	translation: TranslationState;
	graphA: GraphAreaStoreState;
}


export const createRootReducer = () =>
	combineReducers({
		collections: CollectionsReducer,
		requests: RequestsReducer,
		variables: VariablesReducer,
		translation: TranslationReducer,
		graph: GraphReducer,
		graphA: GraphAreaReducer,
	});

declare global {
	interface Window {
		__REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
	}
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;


export default function configureStore(
	initialState: ApplicationState
): Store<ApplicationState> {
	return createStore(
		createRootReducer(),
		initialState,
		composeEnhancers(applyMiddleware(thunk))
	);
}
