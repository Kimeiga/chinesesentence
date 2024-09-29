<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import type { PageData } from '$lib/page-data-types';
	import type { TokenizedWord } from '$lib/server-types';
	import { getPrimaryDefinition } from '$lib/utils/definition-utils';

	export let data: PageData;
	export let isDefinitionQuestion: boolean;

	const dispatch = createEventDispatcher();

	let question = '';
	let answers: string[] = [];
	let correctAnswerIndex: number;

	const pinyinVowels = {
		a: ['ā', 'á', 'ǎ', 'à'],
		e: ['ē', 'é', 'ě', 'è'],
		i: ['ī', 'í', 'ǐ', 'ì'],
		o: ['ō', 'ó', 'ǒ', 'ò'],
		u: ['ū', 'ú', 'ǔ', 'ù'],
		ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ']
	};

	const allVowels = Object.keys(pinyinVowels).flat();
	const allDiacritics = Object.values(pinyinVowels).flat();

	function getRandomWord(): TokenizedWord {
		const words = data.tokenized.simplified.filter(
			(word) => word.word.trim() !== '' && word.pinyin.trim() !== ''
		);
		return words[Math.floor(Math.random() * words.length)];
	}

	function generatePinyinVariations(pinyin: string): string[] {
		const variations: Set<string> = new Set();
		const maxAttempts = 100; // Prevent infinite loop
		let attempts = 0;
		let attempts2 = 0;

		while (variations.size < 3 && attempts < maxAttempts) {
			let newPinyin = pinyin
				.split('')
				.map((char) => {
					if (allDiacritics.includes(char)) {
						for (const [vowel, accents] of Object.entries(pinyinVowels)) {
							if (accents.includes(char)) {
								return accents[Math.floor(Math.random() * accents.length)];
							}
						}
					}
					return char;
				})
				.join('');

			if (newPinyin !== pinyin) {
				variations.add(newPinyin);
			}
			attempts++;
		}

		console.log(attempts);

		// If we couldn't generate 3 variations, fill the rest with dummy values
		while (variations.size < 3 && attempts2 < maxAttempts) {
			console.log('attempt2');
			let newPinyin = pinyin
				.split('')
				.map((char) => {
					if (allVowels.includes(char)) {
						for (const [vowel, accents] of Object.entries(pinyinVowels)) {
							console.log(accents);
							if (vowel.includes(char)) {
								return accents[Math.floor(Math.random() * accents.length)];
							}
						}
					}
					return char;
				})
				.join('');

			console.log(newPinyin);

			if (newPinyin !== pinyin) {
				variations.add(newPinyin);
			}
			attempts2++;
		}

		return Array.from(variations);
	}

	function generateQuestion() {
		const targetWord = getRandomWord();
		// const targetWord = {
		// 	word: '的',
		// 	pinyin: 'de',
		// 	numericPinyin: 'de5',
		// 	definition: [
		// 		[
		// 			'de',
		// 			'de5',
		// 			[
		// 				"of; ~'s (possessive particle)",
		// 				'(used after an attribute)',
		// 				'(used to form a nominal expression)',
		// 				'(used at the end of a declarative sentence for emphasis)',
		// 				'also pr. [di4] or [di5] in poetry and songs'
		// 			]
		// 		],
		// 		['dī', 'di1', ['a taxi; a cab (abbr. for 的士[di1 shi4])']],
		// 		['dí', 'di2', ['really and truly']],
		// 		['dì', 'di4', ["(bound form) bull's-eye; target"]]
		// 	],
		// 	primaryDefinition: 'of',
		// 	otherAnswers: ['pull', 'chase', 'deeply ']
		// };
		isDefinitionQuestion = Math.random() < 0.5;
		dispatch('quizTypeChange', isDefinitionQuestion);

		if (isDefinitionQuestion) {
			question = `What does "${targetWord.word}" mean?`;
			correctAnswerIndex = Math.floor(Math.random() * 4);

			// Create a set of unique definitions
			const definitionsSet = new Set<string>();
			definitionsSet.add(getPrimaryDefinition(targetWord));

			// Add otherAnswers to the set
			if (Array.isArray(targetWord.otherAnswers)) {
				targetWord.otherAnswers.forEach((answer) => definitionsSet.add(answer));
			} else if (typeof targetWord.otherAnswers === 'string') {
				definitionsSet.add(targetWord.otherAnswers);
			}

			// If we still need more answers, add random definitions
			while (definitionsSet.size < 4) {
				const randomWord = getRandomWord();
				if (randomWord !== targetWord) {
					definitionsSet.add(getPrimaryDefinition(randomWord));
				}
			}

			answers = Array.from(definitionsSet);
			// Shuffle the answers
			answers = answers.sort(() => Math.random() - 0.5);

			// Ensure the correct answer is included
			const correctAnswer = getPrimaryDefinition(targetWord);
			if (!answers.includes(correctAnswer)) {
				answers[correctAnswerIndex] = correctAnswer;
			} else {
				correctAnswerIndex = answers.indexOf(correctAnswer);
			}
		} else {
			// Pronunciation question logic remains the same
			question = `How is "${targetWord.word}" pronounced?`;
			correctAnswerIndex = Math.floor(Math.random() * 4);
			const correctPinyin = targetWord.pinyin;
			answers = generatePinyinVariations(correctPinyin);
			answers.splice(correctAnswerIndex, 0, correctPinyin);
		}
	}

	function handleAnswer(index: number) {
		if (index === correctAnswerIndex) {
			alert('Correct!');
		} else {
			alert('Incorrect. Try again!');
		}
		generateQuestion();
	}

	onMount(() => {
		generateQuestion();
	});
</script>

<div class="quiz-container">
	<p class="question">{question}</p>
	<div class="answers-grid">
		{#each answers as answer, i}
			<button on:click={() => handleAnswer(i)}>{answer}</button>
		{/each}
	</div>
</div>

<style>
	.quiz-container {
		margin-top: auto;
		padding: 1rem;
		margin-bottom: 1rem;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.question {
		font-size: 1.2em;
		margin-bottom: 15px;
		text-align: center;
	}

	.answers-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		max-width: 1000px;
	}

	button {
		padding: 10px;
		font-size: 1em;
		border: none;
		cursor: pointer;
	}

	button:hover {
		background-color: #45a049;
	}
</style>
