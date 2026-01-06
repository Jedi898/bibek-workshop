const preetiMap: Record<string, string> = {
    's': 'क', 'v': 'ख', 'u': 'ग', '#': 'घ', 'ª': 'ङ',
    'r': 'च', '%': 'छ', 'h': 'ज', 'H': 'झ', '`': 'ञ',
    '^': 'ट', '&': 'ठ', '*': 'ड', '(': 'ढ', ')': 'ण',
    't': 'त', 'y': 'थ', 'b': 'द', 'w': 'ध', 'g': 'न',
    'k': 'प', 'p': 'फ', 'a': 'ब', 'e': 'भ', 'd': 'म',
    'o': 'य', '/': 'र', 'n': 'ल', 'j': 'व', 'z': 'श',
    'i': 'ष', ';': 'स', 'x': 'ह', 'q': 'त्र', '!': 'ज्ञ',
    'c': 'अ', 'O': 'इ', 'L': 'ई', 'p': 'उ', 'P': 'ऊ', 'C': 'ऋ',
    ']': 'े', '}': 'ै', 'f]': 'ो', 'f}': 'ौ',
    'f': 'ा', 'l': 'ि', '\\': '्', '{': 'र्', '|': '्र', '[': 'ृ',
    'F': 'ँ', '+': 'ं', '_': 'ः', '.': '।', ',': ',',
    '0': '०', '1': '१', '2': '२', '3': '३', '4': '४', '5': '५', '6': '६', '7': '७', '8': '८', '9': '९',
    'R': 'द्व', 'Q': 'त्त', 'I': 'क्ष', '>': 'श्र', '?': 'रु', "'": 'ु', '"': 'ू'
};

const kantipurMap: Record<string, string> = {
    'a': 'ब', 'b': 'द', 'c': 'अ', 'd': 'म', 'e': 'भ', 'f': 'ा', 'g': 'न', 'h': 'ज',
    'i': 'ष', 'j': 'व', 'k': 'क', 'l': 'ि', 'm': 'क', 'n': 'ल', 'o': 'इ', 'p': 'उ',
    'q': 'त्र', 'r': 'च', 's': 'क', 't': 'त', 'u': 'ग', 'v': 'ख', 'w': 'ध', 'x': 'ह',
    'y': 'थ', 'z': 'श', 'A': 'आ', 'B': 'भ', 'C': 'ऋ', 'D': 'ध', 'E': 'भ', 'F': 'ँ',
    'G': 'न', 'H': 'ज', 'I': 'क्ष', 'J': 'व', 'K': 'फ', 'L': 'ी', 'M': 'स', 'N': 'ल',
    'O': 'ध', 'P': 'ए', 'Q': 'त्त', 'R': 'द्व', 'S': 'क', 'T': 'त', 'U': 'ग', 'V': 'ख',
    'W': 'ध', 'X': 'ह', 'Y': 'थ', 'Z': 'श', '`': 'ञ', '~': 'ञ्', '!': 'ज्ञ', '@': 'द्द',
    '#': 'घ', '$': 'द्ध', '%': 'छ', '^': 'ट', '&': 'ठ', '*': 'ड', '(': 'ढ', ')': 'ण',
    '_': 'घ', '-': '(', '+': 'ं', '=': '.', '[': 'ृ', ']': 'े', '{': 'र्', '}': 'ै',
    '\\': '्', '|': '्र', ';': 'स', ':': 'स', ',': ',', '.': '।', '/': 'र', '<': '?',
    '>': 'श्र', '?': 'रु', "'": 'ु', '"': 'ू'
};

function convert(text: string, map: Record<string, string>): string {
    // Two-character mappings first for preeti
    if (map === preetiMap) {
        text = text.replace(/cf}/g, 'औ');
        text = text.replace(/cf]/g, 'ओ');
        text = text.replace(/cf/g, 'आ');
    }

    let array = text.split('');

    // Correctly position 'l' (ikar)
    for (let i = 0; i < array.length; i++) {
        if (array[i] === 'l') {
            let j = i + 1;
            while (j < array.length && (map[array[j]] || array[j] === '\\') && array[j] !== 'f') {
                j++;
            }
            if (j !== i + 1) {
                let cluster = array.splice(i + 1, j - (i + 1));
                array.splice(i, 0, ...cluster);
            }
        }
    }

    // Correctly position '{' (reph)
    for (let i = 0; i < array.length; i++) {
        if (array[i] === '{') {
            let j = i - 1;
            while (j >= 0) {
                if (array[j] === '\\') {
                    j -= 2; // Skip halanta and the preceding character
                } else if (map[array[j]]) {
                    j--; // It's a consonant, keep moving back
                } else {
                    break; // Not part of the cluster
                }
            }
            j++; // Move j to the start of the cluster

            if (j < i) {
                let cluster = array.splice(j + 1, i - (j + 1));
                array.splice(j + 1, 0, ...cluster);
            }
        }
    }

    let result = '';
    for (let i = 0; i < array.length; i++) {
        const char = array[i];
        // Check if the character is part of a potential Nepali word.
        // A simple heuristic: if the surrounding characters are also in the map, it's likely Nepali.
        const prevChar = i > 0 ? array[i-1] : ' ';
        const nextChar = i < array.length - 1 ? array[i+1] : ' ';

        // If the character is a number or a common English letter that could be in a Nepali word
        if (map[char] && (map[prevChar] || map[nextChar] || char === '/' || char === '.' || !/[a-zA-Z0-9]/.test(prevChar) || !/[a-zA-Z0-9]/.test(nextChar))) {
             result += map[char];
        } else {
            result += char; // Keep original character if it looks like standalone English/number
        }
    }

    // Post-processing to fix common issues
    result = result.replace(/्ा/g, 'ा');
    result = result.replace(/्े/g, 'े');
    result = result.replace(/्ो/g, 'ो');
    return result;
}

function isLikelyPreeti(text: string): boolean {
    const preetiChars = /[cfhjlsvwx]/g;
    const sample = text.substring(0, 500);
    const matches = sample.match(preetiChars);
    return (matches ? matches.length : 0) / Math.min(sample.length, 500) > 0.20;
}

function isLikelyKantipur(text: string): boolean {
    const kantipurChars = /[kO]/g;
    const sample = text.substring(0, 500);
    const matches = sample.match(kantipurChars);
    return (matches ? matches.length : 0) / Math.min(sample.length, 500) > 0.10;
}

export function detectAndConvert(text: string): string {
    if (isLikelyPreeti(text)) {
        console.log("Preeti-like font detected. Converting...");
        return convert(text, preetiMap);
    }
    if (isLikelyKantipur(text)) {
        console.log("Kantipur-like font detected. Converting...");
        return convert(text, kantipurMap);
    }
    console.log("No legacy font detected. Assuming Unicode.");
    return text;
}