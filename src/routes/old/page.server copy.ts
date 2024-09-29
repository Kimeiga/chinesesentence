// import cedict from 'coupling-dict-chinese-updated';
import cedict from '$lib/data/cedict.json';

import he from 'he';
// var decodeEntities = (function () {
// 	// this prevents any overhead from creating the object each time
// 	var element = document.createElement("div");

// 	function decodeHTMLEntities(str) {
// 		if (str && typeof str === "string") {
// 			// strip script/html tags
// 			str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gim, "");
// 			str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gim, "");
// 			element.innerHTML = str;
// 			str = element.textContent;
// 			element.textContent = "";
// 		}

// 		return str;
// 	}

// 	return decodeHTMLEntities;
// })();
function makeid(length) {
	let result = '';
	let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

export const load = async ({ fetch }) => {
	const fetchDefinitions = async (rubyTexts) => {
		let definitions = [];

		for (const [i, s] of rubyTexts.entries()) {
			let word = s.chars;

			// Exceptions
			if (word == '个') {
				s.definition = 'generic classifier for noun';
				continue;
			}

			if (word == '别' && i == 0) {
				s.definition = "don't";
				continue;
			}

			if (word == '吗') {
				s.definition = 'question particle';
				continue;
			}

			if (word == '里' && s.pinyin == 'lǐ') {
				s.definition = 'inside';
				continue;
			}
			if (word == '被') {
				s.definition = 'by';
				continue;
			}
			if (word == '跟') {
				s.definition = 'with';
				continue;
			}

			// let result = await dictionary.query(s.chars);
			// let result;
			console.log(rubyTexts);
			// let result = await cedict.searchByChineseAsync(s.chars);
			let result = cedict[s.chars];
			// console.log('s.chars');
			// console.log(s.chars);
			// console.log('result');
			console.log(result);

			if (!result || result.length == 0) {
				s.definition = null;
				// continue;
				continue;
			}

			if (s.chars == '背') {
				console.log(result);
			}

			// let correctPronunciationResult = result.filter(
			// 	(r) => r.pronunciation.replace(/\s+/g, '') == (i == 0 ? s.pinyin.toLowerCase() : s.pinyin)
			// );

			// let correctPronunciationResult = result;
			// result = correctPronunciationResult.length ? correctPronunciationResult : result;
			// if (s.chars == '背') {
			// 	console.log(result);
			// }
			// // let englishDefinitions = result[0].definitions.split(';');

			// // let r = result.filter(r => !/^surname/.test(r.definitions))
			// // console.log(r)
			// // r = r.length ? r : result;

			// let noSurnameResult = result.filter((r) => !/^surname/.test(r.definitions));
			// // console.log(noSurnameResult)
			// result = noSurnameResult.length ? noSurnameResult : result;
			// // console.log(result)

			// // let r2 = r.filter(r => !/^abbr./.test(r.definitions))
			// // console.log(r2)
			// // r = r2.length ? r2 : r;

			// let noAbbreviationResult = result.filter((r) => !/^abbr./.test(r.definitions));
			// result = noAbbreviationResult.length ? noAbbreviationResult : result;
			// // console.log(result)

			// // r2 = r.filter(r => !/^variant./.test(r.definitions))
			// // console.log(r2)
			// // r = r2.length ? r2 : r;

			// let noVariantResult = result.filter((r) => !/^variant /.test(r.definitions));
			// result = noVariantResult.length ? noVariantResult : result;

			// let noOldVariantResult = result.filter((r) => !/^old variant /.test(r.definitions));
			// result = noOldVariantResult.length ? noOldVariantResult : result;
			// // console.log(result)

			// let definitions = result[0].definitions.split(';');

			// // let noVariantResult = definitions.filter(d => !/^variant /.test(d))
			// // definitions = noVariantResult.length ? noVariantResult : definitions;

			// let noLongResult = definitions.filter((d) => d.split(' ').length <= 10);
			// definitions = noLongResult.length ? noLongResult : definitions;

			// let definition = definitions[0];
			// // let definition = r[0]?.english[0];

			// if (!definition) {
			// 	s.definition = null;
			// 	// continue;
			// }

			// let r2 = definition.replace(/\([^()]*\)/g, '').trim();

			// // "structural particle: used after a verb , linking it to following phrase indicating effect, degree, possibility etc"
			// // -> "structural particle"
			// r2 = r2.replace(/:.*/, '');

			// definition = r2.length ? r2 : definition;

			// // console.log(result)
			// definitions.push(result);
			// // console.log("definitions")
			// // console.log(definitions)

			s.definition = cedict[s.chars][s.pinyin];
		}

		console.log(rubyTexts);

		return rubyTexts;
	};

	const seed = makeid(4);
	console.log(seed);
	let response = await fetch(
		'https://tatoeba.org/en/api_v0/search?from=cmn&orphans=no&sort=random&to=eng&trans_filter=limit&trans_to=eng&unapproved=no&limit=1&rand_seed=' +
			seed
		// 'lne2'
		// 'TcPZ'
		// 'iVlb'
		// 'mDb0'
		// 'yg6k'
		// 'Uv8f' //long
		// '7BxZ'
		// 'lnNV'
		// 'FMuS'
		// 'lWWI' // todo yuxia
		// 'VhCD'
		// 'WmjG'
		// 'rFSV'
		// 'w3pW'
		// 'osDh'
		// "Lkrf"
		// "Cqio"
		// "Jhjs"
	).then((response) => response.json());

	// console.log(response)

	let result = response.results[0];

	let chineseSentence;
	let traditionalChineseSentence;

	if (result.script == 'Hans') {
		chineseSentence = result.text;
		traditionalChineseSentence = result.transcriptions[0].text;
	} else if (result.script == 'Hant') {
		traditionalChineseSentence = result.text;
		chineseSentence = result.transcriptions[0].text;
	} else {
		chineseSentence = result.transcriptions[0].text;
		traditionalChineseSentence = result.text;
	}

	let pinyinResult = result.transcriptions.filter((t) => t.script == 'Latn')[0];
	// let pinyinSentenceList = he.decode(pinyinResult.html).split(/[, .?";!”“]/);
	let pinyinSentenceList = he.decode(pinyinResult.html).split(/(?<=[, .?";!”“])|(?=[, .?";!”“])/);
	pinyinSentenceList = pinyinSentenceList.filter((word) => !/[ ]/.test(word));

	// VhCD
	// 3-5
	const noAlphabeticCharsRegex = /^[^a-zA-Z]+$/;

	let tempList = [];

	for (const word of pinyinSentenceList) {
		if (!word.match(noAlphabeticCharsRegex)) {
			tempList.push(word);
		} else {
			// 3-5
			for (const letter of word) {
				tempList.push(letter);
			}
		}
	}

	pinyinSentenceList = tempList;

	let pinyinNumeralSentenceList = pinyinResult.text.split(/(?<=[, .?";!”“])|(?=[, .?";!”“])/);

	// VhCD
	// 3-5
	const pinyinWithNumeralsRegex = /\b[a-zA-ZüÜ]+\d/g;

	tempList = [];

	for (const word of pinyinNumeralSentenceList) {
		if (word.match(pinyinWithNumeralsRegex)) {
			tempList.push(word);
		} else {
			// 3-5
			for (const letter of word) {
				tempList.push(letter);
			}
		}
	}

	pinyinNumeralSentenceList = tempList;

	console.log(pinyinNumeralSentenceList);

	// 	const input = "Hao3 le5 hai2zi5men5!";
	// const matches = input.match(pinyinWithNumeralsRegex);

	// console.log(matches);

	pinyinNumeralSentenceList = pinyinNumeralSentenceList.filter((word) => !/[ ]/.test(word));
	console.log(pinyinNumeralSentenceList);

	let translation = result.translations.filter((a) => a.length > 0)[0][0].text;

	let syllableArray = [];
	for (let n of pinyinNumeralSentenceList) {
		let syllableCount = n.match(/\d/g)?.length ?? (n.length || 1);
		syllableArray.push(syllableCount);
	}

	let rubyTexts = [];
	let accChinese = 0;
	for (let [i, n] of syllableArray.entries()) {
		rubyTexts = [
			...rubyTexts,
			{
				chars: chineseSentence.slice(accChinese, accChinese + n),
				traditionalChars: traditionalChineseSentence.slice(accChinese, accChinese + n),
				pinyin: /^[,.\?"“”!]+$/.test(pinyinSentenceList[i]) ? '' : pinyinSentenceList[i]
				// definition: await dictionary.query(chineseSentence.slice(accChinese, accChinese + n))[0]
			}
		];

		accChinese += n;
	}

	for (const [i, s] of rubyTexts.entries()) {
		let word = s.chars;

		// Exceptions
		if (word == '个') {
			s.definition = 'generic classifier for noun';
			continue;
		}

		if (word == '别' && i == 0) {
			s.definition = "don't";
			continue;
		}

		if (word == '吗') {
			s.definition = 'question particle';
			continue;
		}

		if (word == '里' && s.pinyin == 'lǐ') {
			s.definition = 'inside';
			continue;
		}
		if (word == '被') {
			s.definition = 'by';
			continue;
		}
	}

	return {
		seed,
		response,
		chineseSentence,
		traditionalChineseSentence,
		translation,
		// pinyinTextList: pinyinSentence.split(/[, .?";!”“]/),
		rubyTexts,
		streamed: {
			definitions: fetchDefinitions(rubyTexts)
		}
	};
};
