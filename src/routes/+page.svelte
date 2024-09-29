<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import type { PageData } from '$lib/page-data-types';
	import nlp from 'compromise';
	import Quiz from './Quiz.svelte';
	import Word from './Word.svelte';

	export let data: PageData;
	const { translation } = data;

	let useSimplified = true;
	let isDefinitionQuestion = true;
	let blurredBackgroundImage = '';

	onMount(() => {
		loadImages();
	});

	function loadImages() {
		const doc = nlp(translation);
		const nouns = doc.nouns().out('array');
		if (nouns.length > 0) {
			const firstNoun = encodeURIComponent(nouns[0]);
			blurredBackgroundImage = `https://loremflickr.com/1280/827/${firstNoun}`;
		}
	}

	function handleQuizTypeChange(event: CustomEvent<boolean>) {
		isDefinitionQuestion = event.detail;
	}
</script>

<main>
	<img src={blurredBackgroundImage} alt="Blurred Background" class="blur-overlay" />
	<div class="content">
		<div class="sentence">
			{#if useSimplified}
				{#each data.tokenized.simplified as word}
					<Word {word} simplifiedSentence={data.simplifiedSentence} {isDefinitionQuestion} />
				{/each}
			{:else}
				{#each data.tokenized.traditional as word}
					<Word {word} simplifiedSentence={data.simplifiedSentence} {isDefinitionQuestion} />
				{/each}
			{/if}
		</div>

		<p class="translation">{translation}</p>

		<Quiz {data} {isDefinitionQuestion} on:quizTypeChange={handleQuizTypeChange} />
	</div>
</main>

<style>
	main {
		position: relative;
		height: 100svh;
		overflow: hidden;
	}

	.blur-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.blur-overlay {
		z-index: 0;
		filter: brightness(0.7) blur(10px);
	}

	.content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100%;
		padding: 2rem;
		color: white;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
		box-sizing: border-box;
	}

	.sentence {
		margin-bottom: 1rem;
	}

	.translation {
		font-style: italic;
		margin-bottom: 2rem;
	}
</style>
