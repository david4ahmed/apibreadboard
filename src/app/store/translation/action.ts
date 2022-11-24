import { TranslationActionTypes } from './types';
import { Action, Dispatch } from 'redux';
import { AppThunk } from '../index';

export const setTranslationCode: AppThunk = (node: string, code: string) => (
	dispatch: Dispatch
): Action =>
	dispatch({
		type: TranslationActionTypes.SET_TRANSLATION_CODE,
		payload: [node, code],
	});

export const setTranslationInput: AppThunk = (node: string, varID: string[]) => (
	dispatch: Dispatch
): Action =>
	dispatch({
		type: TranslationActionTypes.SET_TRANSLATION_INPUT,
		payload: [node, varID],
	});

export const setTranslationOutput: AppThunk = (node: string, varID: string[]) => (
	dispatch: Dispatch
): Action =>
	dispatch({
		type: TranslationActionTypes.SET_TRANSLATION_OUTPUT,
		payload: [node, varID],
	});