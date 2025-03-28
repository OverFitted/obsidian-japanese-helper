export class JapaneseConverter {
	// Common romaji to kana mapping
	private static readonly ROMAJI_TO_HIRAGANA: { [key: string]: string } = {
		'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お',
		'ka': 'か', 'ki': 'き', 'ku': 'く', 'ke': 'け', 'ko': 'こ',
		'sa': 'さ', 'shi': 'し', 'su': 'す', 'se': 'せ', 'so': 'そ',
		'ta': 'た', 'chi': 'ち', 'tsu': 'つ', 'te': 'て', 'to': 'と',
		'na': 'な', 'ni': 'に', 'nu': 'ぬ', 'ne': 'ね', 'no': 'の',
		'ha': 'は', 'hi': 'ひ', 'fu': 'ふ', 'he': 'へ', 'ho': 'ほ',
		'ma': 'ま', 'mi': 'み', 'mu': 'む', 'me': 'め', 'mo': 'も',
		'ya': 'や', 'yu': 'ゆ', 'yo': 'よ',
		'ra': 'ら', 'ri': 'り', 'ru': 'る', 're': 'れ', 'ro': 'ろ',
		'wa': 'わ', 'wo': 'を', 'n': 'ん',
		'ga': 'が', 'gi': 'ぎ', 'gu': 'ぐ', 'ge': 'げ', 'go': 'ご',
		'za': 'ざ', 'ji': 'じ', 'zu': 'ず', 'ze': 'ぜ', 'zo': 'ぞ',
		'da': 'だ', 'di': 'ぢ', 'du': 'づ', 'de': 'で', 'do': 'ど',
		'ba': 'ば', 'bi': 'び', 'bu': 'ぶ', 'be': 'べ', 'bo': 'ぼ',
		'pa': 'ぱ', 'pi': 'ぴ', 'pu': 'ぷ', 'pe': 'ぺ', 'po': 'ぽ',

		// Small letters and combinations
		'kya': 'きゃ', 'kyu': 'きゅ', 'kyo': 'きょ',
		'sha': 'しゃ', 'shu': 'しゅ', 'sho': 'しょ',
		'cha': 'ちゃ', 'chu': 'ちゅ', 'cho': 'ちょ',
		'nya': 'にゃ', 'nyu': 'にゅ', 'nyo': 'にょ',
		'hya': 'ひゃ', 'hyu': 'ひゅ', 'hyo': 'ひょ',
		'mya': 'みゃ', 'myu': 'みゅ', 'myo': 'みょ',
		'rya': 'りゃ', 'ryu': 'りゅ', 'ryo': 'りょ',
		'gya': 'ぎゃ', 'gyu': 'ぎゅ', 'gyo': 'ぎょ',
		'ja': 'じゃ', 'ju': 'じゅ', 'jo': 'じょ',
		'bya': 'びゃ', 'byu': 'びゅ', 'byo': 'びょ',
		'pya': 'ぴゃ', 'pyu': 'ぴゅ', 'pyo': 'ぴょ',

		// Double consonants for small tsu
		'kk': 'っk', 'ss': 'っs', 'tt': 'っt', 'pp': 'っp',

		// Special cases
		'tch': 'っち', 'cch': 'っち',
		'ssh': 'っし', 'tts': 'っつ',
	};

	// Convert hiragana to katakana
	private static readonly HIRAGANA_TO_KATAKANA_OFFSET = 0x30A0 - 0x3040;

	// Convert romaji text to hiragana
	public static romajiToHiragana(text: string): string {
		// Preprocess text to handle special cases
		text = text.toLowerCase().replace(/-/g, '');

		let result = '';
		let i = 0;

		while (i < text.length) {
			// Try to match the longest possible romaji sequence
			let matched = false;

			// Check for double consonants (small tsu)
			if (i < text.length - 1 &&
				text[i] === text[i + 1] &&
				'kstp'.includes(text[i])) {
				result += 'っ';
				i++;
				matched = true;
				continue;
			}

			// Try to match 3-character romaji
			if (i <= text.length - 3) {
				const chunk3 = text.substring(i, i + 3);
				if (this.ROMAJI_TO_HIRAGANA[chunk3]) {
					result += this.ROMAJI_TO_HIRAGANA[chunk3];
					i += 3;
					matched = true;
					continue;
				}
			}

			// Try to match 2-character romaji
			if (i <= text.length - 2) {
				const chunk2 = text.substring(i, i + 2);
				if (this.ROMAJI_TO_HIRAGANA[chunk2]) {
					result += this.ROMAJI_TO_HIRAGANA[chunk2];
					i += 2;
					matched = true;
					continue;
				}
			}

			// Try to match 1-character romaji
			const chunk1 = text[i];
			if (this.ROMAJI_TO_HIRAGANA[chunk1]) {
				result += this.ROMAJI_TO_HIRAGANA[chunk1];
				i += 1;
				matched = true;
				continue;
			}

			// Special case for 'n' followed by a non-vowel (or at the end)
			if (chunk1 === 'n' && (i === text.length - 1 || !'aiueo'.includes(text[i + 1]))) {
				result += 'ん';
				i += 1;
				matched = true;
				continue;
			}

			// If no match found, keep the original character
			if (!matched) {
				result += text[i];
				i += 1;
			}
		}

		return result;
	}

	// Convert romaji text to katakana
	public static romajiToKatakana(text: string): string {
		const hiragana = this.romajiToHiragana(text);
		return this.hiraganaToKatakana(hiragana);
	}

	// Convert hiragana to katakana
	public static hiraganaToKatakana(text: string): string {
		let result = '';

		for (let i = 0; i < text.length; i++) {
			const char = text.charCodeAt(i);
			// Check if character is in hiragana range
			if (char >= 0x3040 && char <= 0x309F) {
				result += String.fromCharCode(char + this.HIRAGANA_TO_KATAKANA_OFFSET);
			} else {
				result += text[i];
			}
		}

		return result;
	}
}
