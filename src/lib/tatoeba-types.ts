export interface TatoebaResponse {
	paging: Paging;
	results: Result[];
}

export interface Paging {
	Sentences: Sentences;
}

export interface Sentences {
	finder: string;
	page: number;
	current: number;
	count: number;
	perPage: number;
	start: number;
	end: number;
	prevPage: boolean;
	nextPage: boolean;
	pageCount: number;
	sort: string;
	direction: boolean;
	limit: number;
	sortDefault: boolean;
	directionDefault: boolean;
	scope: null;
	completeSort: never[];
}

export interface Result {
	id: number;
	text: string;
	lang: ResultLang;
	correctness: number;
	script: Script;
	license: License;
	translations: Array<Translation[]>;
	transcriptions: Transcription[];
	audios: never[];
	user: User;
	lang_name: ResultLangName;
	dir: Dir;
	lang_tag: ResultLangTag;
	is_favorite: null;
	is_owned_by_current_user: boolean;
	permissions: null;
	max_visible_translations: number;
	current_user_review: null;
}

export enum Dir {
	LTR = 'ltr'
}

export enum ResultLang {
	Cmn = 'cmn'
}

export enum ResultLangName {
	MandarinChinese = 'Mandarin Chinese'
}

export enum ResultLangTag {
	ZhHans = 'zh-Hans',
	ZhHant = 'zh-Hant'
}

export enum License {
	CcBy20Fr = 'CC BY 2.0 FR'
}

export enum Script {
	Hans = 'Hans',
	Hant = 'Hant',
	Latn = 'Latn'
}

export interface Transcription {
	id: number;
	sentence_id: number;
	script: Script;
	text: string;
	user_id: number | null;
	needsReview: boolean;
	modified: Date;
	user: User | null;
	readonly: boolean;
	type: Type;
	html: string;
	markup: null;
	info_message: string;
}

export enum Type {
	Altscript = 'altscript',
	Transcription = 'transcription'
}

export interface User {
	username: string;
}

export interface Translation {
	id: number;
	text: string;
	lang: TranslationLang;
	correctness: number;
	script: null;
	transcriptions: never[];
	audios: Audio[];
	isDirect?: boolean;
	lang_name: TranslationLangName;
	dir: Dir;
	lang_tag: TranslationLangTag;
}

export interface Audio {
	id: number;
	external?: null;
	sentence_id?: number;
	user?: User;
	author: string;
	attribution_url: null;
	license: null;
}

export enum TranslationLang {
	Eng = 'eng'
}

export enum TranslationLangName {
	English = 'English'
}

export enum TranslationLangTag {
	En = 'en'
}
