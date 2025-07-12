require('dotenv').config();

async function translateText(text, source, target) {
  try {
    if (!text || typeof text !== 'string' || !source || !target) {
      return 'Translation failed: Invalid input';
    }
    const apiKey = process.env.MYMEMORY_API_KEY || '';
    const maxLength = 1000; // Adjust based on confirmed limit
    const chunks = [];
    for (let i = 0; i < text.length; i += maxLength) {
      chunks.push(text.substring(i, i + maxLength));
    }
    const translations = [];
    for (const chunk of chunks) {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${source}|${target}${apiKey ? `&key=${apiKey}` : ''}&de=${encodeURIComponent('huzaifakhalid7c@gmail.com')}`;
      const response = await fetch(url);
      const json = await response.json();
      if (json.responseStatus !== 200) {
        return `Translation failed: ${json.responseDetails || 'Unknown error'}`;
      }
      const matches = json.matches;
      if (matches && matches.length > 0) {
        translations.push(matches[0].translation || '');
      } else {
        translations.push('No translation found');
      }
    }
    return translations.join(' ');
  } catch (error) {
    console.error('Translation error:', error);
    return 'Translation failed: Network or server error';
  }
}

module.exports = translateText;