export const nepaliMap: Record<string, string> = {
  // Lowercase (Consonants & Independent Vowels)
  'a': 'अ', 'b': 'ब', 'c': 'च', 'd': 'द', 'e': 'ए', 'f': 'फ', 'g': 'ग', 'h': 'ह',
  'i': 'इ', 'j': 'ज', 'k': 'क', 'l': 'ल', 'm': 'म', 'n': 'न', 'o': 'ओ', 'p': 'प',
  'q': 'ट', 'r': 'र', 's': 'स', 't': 'त', 'u': 'उ', 'v': 'व', 'w': 'व', 'x': 'क्ष',
  'y': 'य', 'z': 'श',
  
  // Numbers
  '0': '०', '1': '१', '2': '२', '3': '३', '4': '४', '5': '५', '6': '६', '7': '७', '8': '८', '9': '९',
  
  // Matras & Symbols (Mapped to punctuation/brackets)
  '[': 'ा',  // Akar
  ']': 'ि',  // Ikar
  '\\': '्', // Halanta (Virama) - Essential for half letters
  ';': 'े',  // Ekar
  '\'': 'ो', // Okar
  ',': ',', '.': '।', '/': '?', '-': '-', '=': 'ृ',
  '`': 'ञ',  // Nya

  // Uppercase (Shifted)
  'A': 'आ', 'B': 'भ', 'C': 'छ', 'D': 'ड', 'E': 'ऐ', 'F': 'ँ', 'G': 'घ', 'H': 'ः',
  'I': 'ई', 'J': 'झ', 'K': 'ख', 'L': 'ळ', 'M': 'ं', 'N': 'ण', 'O': 'औ', 'P': 'फ',
  'Q': 'ठ', 'R': 'ऋ', 'S': 'ष', 'T': 'थ', 'U': 'ऊ', 'V': 'ँ', 'W': 'ौ', 'X': 'द्य',
  'Y': 'ञ', 'Z': 'श',

  // Shifted Symbols (Matras)
  '{': 'ी', // Dirgha Ikar
  '}': 'ु', // Ukar
  '|': 'ू', // Dirgha Ukar
  ':': 'ै', // Aikar
  '"': 'ौ', // Aukar
  '_': 'ः', // Visarga
  '+': 'ं', // Anusvara
  '<': 'ङ', // Nga
  '>': 'श्र', // Shra
  '?': 'ज्ञ', // Gya
  '~': 'ॐ', // Om
  '#': 'घ', // Gha (Alternative)
  '$': 'द्ध', // Ddha
};

export const toNepali = (text: string): string => {
  return text.split('').map(char => nepaliMap[char] || char).join('');
}