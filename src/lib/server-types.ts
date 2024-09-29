interface TokenizedWord {
	word: string;
	pinyin: string;
	numericPinyin: string;
	definition: CedictEntry | undefined;
}

interface TokenizedSentence {
	simplified: TokenizedWord[];
	traditional: TokenizedWord[];
}

// Type for a single definition entry
type DefinitionEntry = [string, string, string[]];

// Type for a single-pronunciation entry
type SinglePronunciationEntry = DefinitionEntry;

// Type for a multi-pronunciation entry
type MultiPronunciationEntry = DefinitionEntry[];

// Type for the entire CEDICT entry
type CedictEntry = SinglePronunciationEntry | MultiPronunciationEntry;

// Update the TokenizedWord interface to use the new CedictEntry type
interface TokenizedWord {
	word: string;
	pinyin: string;
	numericPinyin: string;
	definition: CedictEntry | undefined;
	primaryDefinition?: string;
	otherAnswers: string[];
}

export type {
	DefinitionEntry,
	SinglePronunciationEntry,
	MultiPronunciationEntry,
	CedictEntry,
	TokenizedWord,
	TokenizedSentence
};
