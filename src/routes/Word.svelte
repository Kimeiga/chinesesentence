<script lang="ts">
	import type { TokenizedWord } from '$lib/server-types';
	export let word: TokenizedWord;
	export let simplifiedSentence: string;
	export let isDefinitionQuestion: boolean;

	const characterSize = '5';
</script>

<div class="word">
	{#if isDefinitionQuestion}
		<span class="word-pinyin">{word.pinyin}</span>
	{/if}
	<span class="word-word">{word.word}</span>
	{#if !isDefinitionQuestion && word.primaryDefinition}
		<span class="word-definition" style="width: {word.word.length * characterSize}rem">
			{word.primaryDefinition}
		</span>
	{/if}
</div>

<style>
	.word {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
	}

	.word-word {
		font-size: 5rem;
	}

	.word-definition {
		text-align: center;
	}
</style>
