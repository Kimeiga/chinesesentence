import type { CedictEntry, TokenizedSentence, TokenizedWord } from '../lib/server-types';
import { Script, type Result, type TatoebaResponse } from '../lib/tatoeba-types';
import { getPrimaryDefinition2 } from '$lib/utils/definition-utils';
import nlp from 'compromise';
import { adjectives } from './adjectives.server';
import { adverbs } from './adverbs.server';
import { nouns } from './nouns.server';
import { verbs } from './verbs.server';
import { questionWords } from './question_words.server';
import { convert } from 'pinyin-pro';

const makeid = (length: number) => {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	return Array.from({ length }, () =>
		characters.charAt(Math.floor(Math.random() * characters.length))
	).join('');
};

// pinyinResult:
// {
// 	"script": "Latn",
// 	"text": "Ta1 yao4 zuo4 shen2me5?",
// 	"html": "Tā y&agrave;o zu&ograve; sh&eacute;nme?",
// }

function addSpacesToPinyin(pinyin: string): string {
	return pinyin.replace(/(\d)/g, '$1 ').trim();
}

function cleanPinyin(pinyin: string): string {
	return pinyin.replace(/\s+/g, '').replace(/5/g, '');
}

const lookUpInCedict = async (
	word: string,
	numericPinyin: string,
	fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>
): Promise<{ entry: CedictEntry; primaryDefinition: string } | undefined> => {
	const filename = word.endsWith('.json') ? word : `${word}.json`;

	try {
		const response = await fetch(`/dictionary/${filename}`);

		if (!response.ok) {
			throw new Error('Network response was not ok');
		}

		const entry: CedictEntry = await response.json();

		const primaryDefinition = getPrimaryDefinition2(word, numericPinyin, entry);

		return { entry, primaryDefinition };
	} catch (err) {
		console.log(`Failed to fetch ${word}`);
		return undefined;
	}
};

const getPartOfSpeech = (word: string): string => {
	if (word.startsWith('to ')) {
		return 'verb';
	}

	const doc = nlp(word);
	const tags = doc.out('tags');
	const partsOfSpeech = ['Noun', 'Verb', 'Adverb', 'Adjective', 'QuestionWord'];

	for (const pos of partsOfSpeech) {
		if (tags.includes(pos)) {
			return pos.toLowerCase();
		}
	}

	return 'default';
};

const getOtherAnswers = (partOfSpeech: string): string[] => {
	const getRandomWord = () => {
		let wordList: string[];
		switch (partOfSpeech) {
			case 'noun':
				wordList = nouns;
				break;
			case 'verb':
				wordList = verbs;
				break;
			case 'adjective':
				wordList = adjectives;
				break;
			case 'adverb':
				wordList = adverbs;
				break;
			case 'questionword':
				wordList = questionWords;
				break;
			default: {
				const allLists = [nouns, verbs, adjectives, adverbs];
				wordList = allLists[Math.floor(Math.random() * allLists.length)];
			}
		}
		return wordList[Math.floor(Math.random() * wordList.length)];
	};

	const randomWords: string[] = [];
	while (randomWords.length < 3) {
		const word = getRandomWord();
		if (!randomWords.includes(word)) {
			randomWords.push(word);
		}
	}

	return randomWords;
};

async function tokenizeChinesePinyin(
	simplifiedSentence: string,
	traditionalSentence: string,
	result: Result,
	fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>
): Promise<TokenizedSentence> {
	const pinyinResult = result.transcriptions.find((t) => t.script === Script.Latn);
	if (!pinyinResult) {
		throw new Error('Pinyin transcription not found');
	}

	// Normalize spaces in the pinyin string
	const normalizedPinyinText = pinyinResult.text.replace(/\s+/g, ' ').trim();

	const pinyinTokens = normalizedPinyinText.split(/\s+|(?<=\d)(?=[,.:;?!])|(?<=[,.:;?!])(?=\S)/);

	let simplifiedIndex = 0;
	let traditionalIndex = 0;
	const tokenizedSimplified: TokenizedWord[] = [];
	const tokenizedTraditional: TokenizedWord[] = [];

	for (const pinyinToken of pinyinTokens) {
		if (/^[,.:;?!]$/.test(pinyinToken)) {
			const punctuation: TokenizedWord = {
				word: pinyinToken,
				pinyin: '',
				numericPinyin: '',
				definition: undefined
			};
			tokenizedSimplified.push(punctuation);
			tokenizedTraditional.push(punctuation);
			simplifiedIndex++;
			traditionalIndex++;
		} else {
			const syllableCount = (pinyinToken.match(/\d/g) || []).length;

			const simplifiedChars = simplifiedSentence.slice(
				simplifiedIndex,
				simplifiedIndex + syllableCount
			);
			const traditionalChars = traditionalSentence.slice(
				traditionalIndex,
				traditionalIndex + syllableCount
			);

			const pinyinWithSpaces = addSpacesToPinyin(pinyinToken);
			const convertedPinyin = convert(pinyinWithSpaces);
			const cleanedPinyin = cleanPinyin(convertedPinyin);

			const numericPinyin = addSpacesToPinyin(pinyinToken).replace(/'/g, '').toLowerCase();
			const simplifiedLookUpResult = await lookUpInCedict(simplifiedChars, numericPinyin, fetch);
			const traditionalLookUpResult = await lookUpInCedict(traditionalChars, numericPinyin, fetch);

			const partOfSpeech = getPartOfSpeech(simplifiedLookUpResult?.primaryDefinition || '');

			const otherAnswers = getOtherAnswers(partOfSpeech);

			const simplifiedToken: TokenizedWord = {
				word: simplifiedChars,
				pinyin: cleanedPinyin,
				numericPinyin,
				definition: simplifiedLookUpResult?.entry,
				primaryDefinition: simplifiedLookUpResult?.primaryDefinition,
				otherAnswers
			};

			const traditionalToken: TokenizedWord = {
				word: traditionalChars,
				pinyin: cleanedPinyin,
				numericPinyin,
				definition: traditionalLookUpResult?.entry,
				primaryDefinition: traditionalLookUpResult?.primaryDefinition,
				otherAnswers
			};

			tokenizedSimplified.push(simplifiedToken);
			tokenizedTraditional.push(traditionalToken);

			simplifiedIndex += syllableCount;
			traditionalIndex += syllableCount;
		}
	}

	return { simplified: tokenizedSimplified, traditional: tokenizedTraditional };
}

const getSentences = (result: Result) => {
	const { text, script, transcriptions } = result;
	const [transcription] = transcriptions || [];

	let simplifiedSentence = script === Script.Hant ? transcription?.text : text;
	let traditionalSentence = script === Script.Hans ? transcription?.text : text;

	simplifiedSentence = simplifiedSentence.replace(/\s+/g, '').trim();
	traditionalSentence = traditionalSentence.replace(/\s+/g, '').trim();

	return [simplifiedSentence, traditionalSentence];
};

export const load = async ({ fetch }) => {
	// const seed = makeid(4);
	// const seed = 'ypYa';
	// const seed = 'iQYd';
	const seed = 'D93L';
	console.log(seed);

	const response: TatoebaResponse = await fetch(
		`https://tatoeba.org/en/api_v0/search?from=cmn&orphans=no&sort=random&to=eng&trans_filter=limit&trans_to=eng&unapproved=no&limit=1&rand_seed=${seed}`
	).then((response) => response.json());

	const result: Result = response.results[0];

	const [simplifiedSentence, traditionalSentence] = getSentences(result);

	const tokenized = await tokenizeChinesePinyin(
		simplifiedSentence,
		traditionalSentence,
		result,
		fetch
	);

	const translation = result.translations.filter((a) => a.length > 0)[0][0].text;

	return {
		simplifiedSentence,
		traditionalSentence,
		response,
		tokenized,
		translation
	};
};
