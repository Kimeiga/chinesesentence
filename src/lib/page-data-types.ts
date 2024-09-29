import type { TokenizedSentence } from './server-types';
import type { TatoebaResponse } from './tatoeba-types';

export interface PageData {
	simplifiedSentence: string;
	traditionalSentence: string;
	response: TatoebaResponse;
	tokenized: TokenizedSentence;
	translation: string;
}
