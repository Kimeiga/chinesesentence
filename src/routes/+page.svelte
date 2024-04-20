<script>
	export let data;
	console.log(data);

	let utterance = new window.SpeechSynthesisUtterance(data.chineseSentence);
	utterance.lang = 'zh-ZH';
	utterance.rate = 0.8;

	let traditional = false;

	// Clamp number between two values with the following line:
	const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

	// const characterSize = clamp(8 - data.chineseSentence.length / 6, 4, 8);

	function remToVw(rem) {
		// Get root element font-size
		var rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

		// Convert rem to px
		var px = rem * rootFontSize;

		// Viewport width in pixels
		var vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

		// Convert pixel value to vw
		var resultVw = (px / vw) * 100;

		return resultVw;
	}

	const characterSize = clamp(100 / data.chineseSentence.length, remToVw(5), remToVw(12));

	function SetBackgroundImage() {
		// let words = new pos.Lexer().lex(translationText);
		// let tags = new pos.Tagger()
		//   .tag(words)
		//   .map(function (tag) {
		//     return tag[0] + "/" + tag[1];
		//   })
		//   .join(" ");

		// // debugger;
		// let nouns = chunker.chunk(tags, "[{ tag: NN|NNP|VBG }]");
		// // console.log(nouns);
		// let extractedNouns = [];
		// let nouns2 = [...nouns.matchAll(/\{([^}]+)\}/g)];
		// // console.log(nouns2);

		// for (let n of nouns2) {
		//   // console.log(n);
		//   extractedNouns.push(n[1].match(/(.*?)\//)[1]);
		// }

		// console.log("extractedNouns");
		// console.log(extractedNouns);

		// remove short words
		let extractedWords = data.translation.split(' ').filter((x) => x.length > 4);

		if (extractedWords.length == 0) {
			extractedWords = data.translation.split(' ').filter((x) => x.length > 3);
		}

		if (extractedWords.length == 0) {
			extractedWords = data.translation.split(' ').filter((x) => x.length > 2);
		}

		// remove words with apostrophe's like "didn't"
		let noApostrophes = extractedWords.filter((x) => x.indexOf("'") == -1);
		if (noApostrophes) extractedWords = noApostrophes;

		console.log('extractedWords');
		console.log(extractedWords);

		let backgroundImageURL = `url("https://source.unsplash.com/random/?${extractedWords.join()}")`;

		// console.log(backgroundImageURL);

		document.body.style.backgroundImage = backgroundImageURL;
	}

	SetBackgroundImage();

	function determineChar(sc) {
		// if (sc == '。') {
		// 	// return halfwidth full stop
		// 	return '｡';
		// }
		if (sc == '，') {
			// return halfwidth comma
			return ',';
		}
		if (sc == '、') {
			// return halfwidth comma
			return '､';
		}
		// if sc is full width question mark
		if (sc == '？') {
			return '?';
		}
		// if sc is full width exclamation mark
		if (sc == '！') {
			return '!';
		}
		// if sc is full width colon
		if (sc == '：') {
			return ':';
		}
		// if sc is full width semicolon
		if (sc == '；') {
			return ';';
		}
		// if sc is full width left parenthesis
		if (sc == '（') {
			return '(';
		}
		// if sc is full width right parenthesis
		if (sc == '）') {
			return ')';
		}
		// if sc is full width left square bracket
		if (sc == '【') {
			return '[';
		}
		// if sc is full width right square bracket
		if (sc == '】') {
			return ']';
		}
		// if sc is full width left double quote
		if (sc == '“') {
			return '"';
		}
		// if sc is full width right double quote
		if (sc == '”') {
			return '"';
		}
		return sc;
	}
</script>

<main>
	<div id="container">
		<div class="rubyTexts">
			{#await data.streamed.definitions}
				{#each data.rubyTexts as rubyText}
					<div
						style="display: flex; flex-direction:column;align-items:{determineChar(
							rubyText.chars
						) == '。'
							? ''
							: 'center'}; width: {determineChar(rubyText.chars) == '。'
							? 0.5 * characterSize + 'vw'
							: ''};"
					>
						<ruby>
							<span
								class={traditional ? 'traditionalCharacter' : 'character'}
								style="font-size: {characterSize}vw; width: {determineChar(rubyText.chars) == '。'
									? '50%'
									: '100%'};"
								>{traditional
									? determineChar(rubyText.traditionalChars)
									: determineChar(rubyText.chars)}</span
							>
							<rt class="rubytext">{rubyText.pinyin}</rt>
						</ruby>
						{#if rubyText.definition}
							<span
								class="definition"
								style="text-align: center; width: {rubyText.chars.length * characterSize}vw"
								>{rubyText.definition || ''}</span
							>
						{/if}
					</div>
				{/each}
			{:then value}
				{#each value as rubyText}
					<div
						style="display: flex; flex-direction:column;align-items:{determineChar(
							rubyText.chars
						) == '。'
							? ''
							: 'center'}; width: {determineChar(rubyText.chars) == '。'
							? 0.5 * characterSize + 'vw'
							: ''};"
					>
						<ruby>
							<span
								class={traditional ? 'traditionalCharacter' : 'character'}
								style="font-size: {characterSize}vw; width: {determineChar(rubyText.chars) == '。'
									? '50%'
									: '100%'};"
								>{traditional
									? determineChar(rubyText.traditionalChars)
									: determineChar(rubyText.chars)}</span
							>
							<rt class="rubytext">{rubyText.pinyin}</rt>
						</ruby>
						{#if rubyText.definition}
							<span
								class="definition"
								style="text-align: center; width: {rubyText.chars.length * characterSize}vw"
								>{rubyText.definition || ''}</span
							>
						{/if}
					</div>
				{/each}
			{/await}
		</div>
	</div>
	{#if data !== undefined}
		<!-- <div class="rubyTexts">
			{#each data.rubyTexts as rubyText}
				<div style="display: flex; flex-direction:column;align-items:center;">
					<ruby>
						<span style="font-size: 5em;"
							>{traditional ? rubyText.traditionalChars : rubyText.chars}</span
						>
						<rt>{rubyText.pinyin}</rt>
					</ruby>
					<span style="text-align: center; width: {rubyText.chars.length * 5}em"
						>{rubyText.definition || ''}</span
					>
				</div>
			{/each}
		</div> -->

		<hr />

		<p>{data.translation}</p>

		<div id="button-container">
			<button on:click={() => speechSynthesis.speak(utterance)}>Speak</button>
			<button
				on:click={() => {
					console.log(data.traditionalChineseSentence);
					console.log(data.chineseSentence);
					traditional
						? navigator.clipboard.writeText(data.traditionalChineseSentence)
						: navigator.clipboard.writeText(data.chineseSentence);
				}}>Copy</button
			>
			<button
				on:click={() => {
					traditional = !traditional;
				}}>Switch To {traditional ? 'Simplified' : 'Traditional'}</button
			>
		</div>
		<small style="opacity: 0.4">Seed: {data.seed}</small>
	{:else}
		<p style="color:red;">loading...</p>
	{/if}
</main>

<style>
	/* .rubyTexts {
		font-size: 4em;
	} */
	ruby > rt {
		/* display: block; */
		font-size: 100%;
		/* text-align: start; */
	}

	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100svh;
	}

	hr {
		width: 70%;
	}

	.rubyTexts {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: center;
		row-gap: 2em;

		padding: 0 1rem;
	}

	.character {
		font-family: 'XingKai SC', 'C Xingkai SC', 'XingKai TC', 'KaiTi', 'KaiTi TC', 'PingFang TC',
			'serif';
		font-weight: bold;
	}
	.traditionalCharacter {
		font-family: 'XingKai TC', 'C Xingkai TC', 'XingKai SC', 'KaiTi', 'KaiTi SC', 'PingFang SC',
			'serif';
		font-weight: bold;
	}

	#pinyinTextDiv {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		width: 100%;
		font-size: 1.8rem;
	}

	#pinyinTextDiv p {
		font-size: 1.8rem;
	}

	#container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		margin: 1rem 0;
	}

	#button-container {
		margin: 0.7rem;
	}

	.rubytext {
		/* font-size: clamp(12px, 1.4vw, 24px); */
		/* position: relative;
		bottom: 1em;
		display: inline;
		line-height: 1; */
	}
	.definition {
		/* font-size: clamp(12px, 1.4vw, 24px); */
		position: relative;
		/* top: 0.5em; */
	}
	ruby {
		line-height: 1;
	}
</style>
