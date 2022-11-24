export enum RequestActionTypes {
	SELECT_REQUEST = '@@requests/SELECT_REQUEST',
	SET_REQUEST_QUERIES = '@@requests/SET_REQUEST_QUERIES',
	SET_REQUEST_BODIES = '@@requests/SET_REQUEST_BODIES',
	SET_REQUEST_HEADERS = '@@requests/SET_REQUEST_HEADERS',
	SET_REQUEST_PATH = '@@requests/SET_REQUEST_PATH',
	SET_REQUEST_OUTPUT = '@@variables/SET_REQUEST_OUTPUT',
	SET_QUERY_DISPLAY_VALUE = "@@variables/SET_QUERY_DISPLAY_VALUE",
    SET_REQUEST_STATUS = '@@variables/SET_REQUEST_STATUS',
}

export interface RequestsState {
	selectedRequest: any;
	requestQueries: RequestData;
	requestBodies: RequestData;
	requestHeaders: RequestData;
	requestPath : RequestData;
	requestOutput: RequestOutput;
	queryDisplayValue: QueryDisplayValue;
    requestStatus : RequestData;
}


export interface QueryDisplayValue {
    [nodeID: string]: {
        queryValues: string[];
	}
}

export interface RequestOutput {
	[key: string]: string
}

export interface RequestData {
	[key: string]: any
}

