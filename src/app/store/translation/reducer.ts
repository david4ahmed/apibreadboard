import { Reducer } from 'redux';
import { TranslationActionTypes, TranslationState } from "./types";

const initialState: TranslationState = {
    translationCode: {},
	inputVars: {},
	outputVar: {},
}

const reducer: Reducer<TranslationState> = (state = initialState, action) => {
	switch (action.type) {
		case TranslationActionTypes.SET_TRANSLATION_CODE: {
			return { ...state, translationCode: {...state.translationCode, [action.payload[0]]: action.payload[1]} };
        }
		case TranslationActionTypes.SET_TRANSLATION_INPUT: {
			return { ...state, inputVars: {...state.inputVars, [action.payload[0]]: action.payload[1]} };
		}
		case TranslationActionTypes.SET_TRANSLATION_OUTPUT: {
			return { ...state, outputVar: {...state.outputVar, [action.payload[0]]: action.payload[1]} };
		}
		default:
			return state;
	}
};

export { reducer as TranslationReducer };


