export enum CollectionActonTypes {
	IMPORT_ALL_COLLECTIONS = '@@collections/IMPORT_ALL_COLLECTIONS',
	ADD_COLLECTION = '@@collections/ADD_COLLECTION',
	DELETE_COLLECTION = '@@collections/DELETE_COLLECTION'
}

export interface CollectionsState {
	readonly collections: any[];
}
