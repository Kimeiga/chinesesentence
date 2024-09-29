import type {
	CedictEntry,
	MultiPronunciationEntry,
	SinglePronunciationEntry,
	TokenizedWord
} from '$lib/server-types';

// Define a map for exceptions
const exceptions: Record<string, string> = {
	着: '<ongoing>',
	了: '<completed>',
	里: 'inside',
	阵: 'wave',
	就: 'then',
	最: 'most',
	后: 'after',
	个: '<measure word>'
	// Add more exceptions here as needed
};

const cleanDefinition = (definition: string): string => {
	// Remove parentheticals, but keep the original if the result would be empty
	let cleaned = definition.replace(/\([^)]*\)/g, '').trim();
	if (cleaned === '') {
		cleaned = definition.trim();
	}
	// Get only the part before the first semicolon
	cleaned = cleaned.split(';')[0].trim();
	return cleaned || definition.trim(); // Return original if still empty
};

const isVariantDefinition = (def: string): boolean => {
	const lowerDef = def.toLowerCase();
	return lowerDef.startsWith('variant of') || lowerDef.startsWith('old variant of');
};

const getBestDefinition = (definitions: string[]): string => {
	// First, try to find a non-variant, non-bound form definition
	const regularDefs = definitions.filter(
		(def) => !isVariantDefinition(def) && !def.startsWith('(bound form)')
	);
	if (regularDefs.length > 0) {
		return regularDefs[0];
	}

	// If no regular definitions, prefer bound form over variant
	const boundFormDefs = definitions.filter((def) => def.startsWith('(bound form)'));
	if (boundFormDefs.length > 0) {
		return boundFormDefs[0];
	}

	// If no other options, use variant definition
	return definitions[0];
};

const getPrimaryDefinition = (word: TokenizedWord): string => {
	// Check if the word is an exception
	if (exceptions[word.word]) {
		return exceptions[word.word];
	}

	if (!word.definition) return '';

	const definition = word.definition;
	const targetPinyin = word.numericPinyin;

	let rawDefinition: string;

	// If it's a single entry, get its best definition
	if (!Array.isArray(definition[0])) {
		rawDefinition = getBestDefinition((definition as SinglePronunciationEntry)[2]);
	} else {
		// It's a multi-pronunciation entry
		const entries = definition as MultiPronunciationEntry;

		// Try to find an entry with matching numeric pinyin
		const matchingEntry = entries.find((entry) => entry[1] === targetPinyin);

		if (matchingEntry) {
			// Get the best definition of the matching entry
			rawDefinition = getBestDefinition(matchingEntry[2]);
		} else {
			// If no match found, get the best definition of the first entry
			rawDefinition = getBestDefinition(entries[0][2]);
		}
	}

	return cleanDefinition(rawDefinition);
};

const getPrimaryDefinition2 = (
	word: string,
	numericPinyin: string,
	definition: CedictEntry
): string => {
	// Check if the word is an exception
	if (exceptions[word]) {
		return exceptions[word];
	}

	if (!word) return '';
	if (!numericPinyin) return '';
	if (!definition) return '';

	let rawDefinition: string;

	// If it's a single entry, get its best definition
	if (!Array.isArray(definition[0])) {
		rawDefinition = getBestDefinition((definition as SinglePronunciationEntry)[2]);
	} else {
		// It's a multi-pronunciation entry
		const entries = definition as MultiPronunciationEntry;

		// Try to find an entry with matching numeric pinyin
		const matchingEntry = entries.find((entry) => entry[1] === numericPinyin);

		if (matchingEntry) {
			// Get the best definition of the matching entry
			rawDefinition = getBestDefinition(matchingEntry[2]);
		} else {
			// If no match found, get the best definition of the first entry
			rawDefinition = getBestDefinition(entries[0][2]);
		}
	}

	return cleanDefinition(rawDefinition);
};

export { getPrimaryDefinition, getPrimaryDefinition2 };
