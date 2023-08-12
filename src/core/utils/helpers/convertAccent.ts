export function convertAccent(word: string): string {
  // Normalize the string to NFD form to separate base characters and diacritics
  const normalizedWord = word.normalize('NFD');

  // Find the position of the stressed syllable and move the accent mark
  for (let i = 0; i < normalizedWord.length; i++) {
    if (/[\u0300-\u036f]/.test(normalizedWord[i])) {
      // Move the accent to the previous base character
      const convertedWord =
        normalizedWord.slice(0, i - 1) +
        normalizedWord[i] +
        normalizedWord[i - 1] +
        normalizedWord.slice(i + 1);
      return convertedWord.normalize('NFC'); // Normalize back to NFC form
    }
  }

  return word; // Return the original word if no accent is found
}
