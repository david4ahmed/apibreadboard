export enum TranslationActionTypes {
	SET_TRANSLATION_CODE = '@@requests/SET_TRANSLATION_CODE',
	SET_TRANSLATION_INPUT = '@@requests/SET_TRANSLATION_INPUT',
	SET_TRANSLATION_OUTPUT = '@@requests/SET_TRANSLATION_OUTPUT',
}

export interface TranslationState {
	translationCode: TranslationCode;
	inputVars: TranslationInputs;
	outputVar: TranslationOutput;
}

export interface TranslationCode {
	[key: string]: string
}

export interface TranslationInputs {
	[key: string]: string[]
}

export interface TranslationOutput {
	[key: string]: string[]
}