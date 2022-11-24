import { CollectionActonTypes } from './types';
import { Action, Dispatch } from 'redux';
import { AppThunk } from '../index';

export const importAllCollections: AppThunk = (collections: any[]) => (
	dispatch: Dispatch
): Action =>
	dispatch({
		type: CollectionActonTypes.IMPORT_ALL_COLLECTIONS,
		payload: collections,
	});

export const addCollection: AppThunk = (collection: any) => (
	dispatch: Dispatch
): Action =>
	dispatch({
		type: CollectionActonTypes.ADD_COLLECTION,
		payload: collection,
	});
export const deleteCollection: AppThunk = (CID: number) => (
	dispatch: Dispatch
): Action =>
	dispatch({
		type: CollectionActonTypes.DELETE_COLLECTION,
		payload: CID,
	});
	
