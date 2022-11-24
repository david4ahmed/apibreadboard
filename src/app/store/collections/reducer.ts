import Debug from '@/Debug';
import { Reducer } from 'redux';
import { CollectionActonTypes, CollectionsState } from './types';

export const initialState: CollectionsState = {
	collections: [],
};

const reducer: Reducer<CollectionsState> = (state = initialState, action) => {
	switch (action.type) {
		case CollectionActonTypes.IMPORT_ALL_COLLECTIONS: {
			return { ...state, collections: action.payload };
		}
		case CollectionActonTypes.ADD_COLLECTION: {
			return { ...state, collections: [action.payload, ...state.collections] };
		}
		case CollectionActonTypes.DELETE_COLLECTION: {
			const payload: number = action.payload;
			Debug.log('misc', "<<<<<<<<<<IN COLLECTION DELETEEEE", {CID: payload});
			
			state.collections.forEach(collection => Debug.log('misc', collection))
			return {
					...state,
					collections: [
						...state.collections.filter(collection => (
							collection.CID != payload
						))
					]
			}
		}
		default:
			return state;
	}
};

export { reducer as CollectionsReducer };
