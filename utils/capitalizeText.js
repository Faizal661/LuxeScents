export default function capitalizeWords(str) {
  const words = str.split(' ');

  for (let i = 0; i < words.length; i++) {
    if (words[i].length > 0) {
      const firstLetter = words[i].charAt(0).toUpperCase();
      const restOfWord = words[i].slice(1);
      words[i] = firstLetter + restOfWord;
    }
  }

  return words.join(' ');
}
