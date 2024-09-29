import he from 'he';
import type { TatoebaResponse, Result } from '$lib/tatoeba-types';

const makeid = (length: number) => {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	return Array.from({ length }, () =>
		characters.charAt(Math.floor(Math.random() * characters.length))
	).join('');
};

const exceptions: Record<string, string> = {
	个: 'generic classifier for noun',
	吗: 'question particle',
	被: 'by',
	跟: 'with'
};

// Type for a single pronunciation-definition pair
type PronunciationDefinitionPair = [string, string | string[]];

// Type for a multi-pronunciation entry
type MultiPronunciationEntry = [string[], string[][]];

// Type for the entire CEDICT entry
type CedictEntry = PronunciationDefinitionPair | MultiPronunciationEntry;

// Type guard for MultiPronunciationEntry
function isMultiPronunciationEntry(entry: CedictEntry): entry is MultiPronunciationEntry {
	return Array.isArray(entry[0]);
}

const normalizePinyin = (pinyin: string): string => {
	return pinyin
		.toLowerCase()
		.replace(/[āáǎà]/g, 'a')
		.replace(/[ēéěè]/g, 'e')
		.replace(/[īíǐì]/g, 'i')
		.replace(/[ōóǒò]/g, 'o')
		.replace(/[ūúǔù]/g, 'u')
		.replace(/[ǖǘǚǜ]/g, 'u')
		.replace(/\d/g, ''); // Remove tone numbers if present
};

const getDefinitionFromEntry = (entry: CedictEntry, pinyin: string): string | null => {
	const normalizedLookupPinyin = normalizePinyin(pinyin);

	if (isMultiPronunciationEntry(entry)) {
		const [pronunciations, definitions] = entry;
		const index = pronunciations.findIndex((p) => normalizePinyin(p) === normalizedLookupPinyin);
		if (index !== -1) {
			const definition = definitions[index];
			return Array.isArray(definition) ? definition[0] : definition;
		}
	} else {
		const [pronunciation, definition] = entry;
		if (normalizePinyin(pronunciation) === normalizedLookupPinyin) {
			return Array.isArray(definition) ? definition[0] : definition;
		}
	}
	console.log(`No matching pronunciation found for ${pinyin} in`, entry);
	return null;
};

const lookUpInCedict = async (
	word: string,
	fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>
): Promise<CedictEntry | undefined> => {
	const filename = word.endsWith('.json') ? word : `${word}.json`;

	console.log(`Attempting to fetch /dictionary/${filename}`);

	try {
		const response = await fetch(`/dictionary/${filename}`);
		console.log(`Response status: ${response.status}`);

		if (!response.ok) {
			throw new Error('Network response was not ok');
		}

		const entry: CedictEntry = await response.json();
		console.log(`Entries: ${JSON.stringify(entry).slice(0, 100)}...`);
		return entry;
	} catch (err) {
		console.log(`Failed to fetch ${word}`);
		return undefined;
	}
};

interface RubyText {
	simp: string;
	trad: string;
	pinyin: string;
	definition?: string | null;
}
const fetchDefinitions = async (
	rubyTexts: RubyText[],
	fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>
): Promise<RubyText[]> => {
	for (const text of rubyTexts) {
		const word = text.simp;

		if (text.pinyin === '') {
			// It's punctuation, skip definition lookup
			continue;
		}

		console.log(`Looking up definition for: ${word} (${text.pinyin})`);

		if (word in exceptions) {
			text.definition = exceptions[word];
		} else if (word === '别' && rubyTexts.indexOf(text) === 0) {
			text.definition = "don't";
		} else if (word === '里' && normalizePinyin(text.pinyin) === 'li') {
			text.definition = 'inside';
		} else {
			try {
				const cedictEntry = await lookUpInCedict(word, fetch);

				if (!cedictEntry) {
					console.log(`No entry found for: ${word}`);
					text.definition = null;
					continue;
				}

				const definition = getDefinitionFromEntry(cedictEntry, text.pinyin);
				console.log(`Definition for ${word}: ${definition}`);
				text.definition = definition || null;
			} catch (error) {
				console.error(`Error fetching definition for ${word}:`, error);
				text.definition = null;
			}
		}
	}

	return rubyTexts;
};
export const load = async ({ fetch }) => {
	const seed = makeid(4);
	console.log(seed);

	const response: TatoebaResponse = await fetch(
		`https://tatoeba.org/en/api_v0/search?from=cmn&orphans=no&sort=random&to=eng&trans_filter=limit&trans_to=eng&unapproved=no&limit=1&rand_seed=${seed}`
	).then((response) => response.json());

	const result: Result = response.results[0];

	let chineseSentence: string;
	let traditionalChineseSentence: string;

	if (result.script === 'Hans') {
		chineseSentence = result.text;
		traditionalChineseSentence = result.transcriptions[0].text;
	} else if (result.script === 'Hant') {
		traditionalChineseSentence = result.text;
		chineseSentence = result.transcriptions[0].text;
	} else {
		chineseSentence = result.transcriptions[0].text;
		traditionalChineseSentence = result.text;
	}

	const pinyinResult = result.transcriptions.find((t) => t.script === 'Latn')!;
	const pinyinText = pinyinResult.html; // Use html instead of text to get tone-marked pinyin
	const pinyinWords = he.decode(pinyinText).split(' ');

	let rubyTexts: RubyText[] = [];
	let simpIndex = 0;
	let tradIndex = 0;

	const isPunctuation = (char: string) => /[^\u4e00-\u9fa5a-zA-Z0-9]/.test(char);

	for (const pinyinWord of pinyinWords) {
		const pinyinSyllables = pinyinWord.split(/(?<=[\u0300-\u036f])/); // Split by tone marks
		let wordLength = pinyinSyllables.length;

		// Handle each character in the word
		for (let i = 0; i < wordLength; i++) {
			const simpChar = chineseSentence[simpIndex + i];
			const tradChar = traditionalChineseSentence[tradIndex + i];

			if (isPunctuation(simpChar)) {
				// If it's punctuation, add it as a separate entry
				rubyTexts.push({
					simp: simpChar,
					trad: tradChar,
					pinyin: ''
				});
			} else {
				// If it's a Chinese character, add it with its pinyin
				rubyTexts.push({
					simp: simpChar,
					trad: tradChar,
					pinyin: pinyinSyllables[i]
				});
			}
		}

		simpIndex += wordLength;
		tradIndex += wordLength;

		// Handle any remaining punctuation after the word
		while (simpIndex < chineseSentence.length && isPunctuation(chineseSentence[simpIndex])) {
			rubyTexts.push({
				simp: chineseSentence[simpIndex],
				trad: traditionalChineseSentence[tradIndex],
				pinyin: ''
			});
			simpIndex++;
			tradIndex++;
		}
	}

	console.log('Ruby texts before fetching definitions:', rubyTexts);

	// Fetch definitions
	rubyTexts = await fetchDefinitions(rubyTexts, fetch);

	console.log('Ruby texts after fetching definitions:', rubyTexts);

	const translation = result.translations.find((a) => a.length > 0)![0].text;

	return {
		seed,
		response,
		chineseSentence,
		traditionalChineseSentence,
		translation,
		rubyTexts
	};
};
