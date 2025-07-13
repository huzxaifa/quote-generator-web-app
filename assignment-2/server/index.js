const express = require('express');
const translateText = require('./services/translate');
const { storeSummary } = require('./services/supabase');
const { storeFullText } = require('./services/mongodb');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());
const PORT = 3000;

app.use(express.json());

// API ENDPOINT to translate text
app.post('/translate', async (req, res) => {
  const { text, source, target } = req.body;
  try {
    const translatedText = await translateText(text, source, target);
    res.send(translatedText);
  } catch (error) {
    res.status(500).send(`Translation failed: ${error.message}`);
  }
});

// API ENDPOINT to store summary and full text
app.post('/store-summary', async (req, res) => {
  const { url, summary } = req.body;
  try {
    // Fetch full blog text
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const fullText = $('article, .post-content, .entry-content, p').text().trim();
    // Store summary in Supabase
    const summaryResult = await storeSummary(url, summary);
    // Store full text in MongoDB
    await storeFullText(url, fullText);
    res.send(summaryResult);
  } catch (error) {
    res.status(500).send(`Failed to store summary: ${error.message}`);
  }
});

app.get('/summaries', async (req, res) => {
  try {
    const { data, error } = await supabase.from('summaries').select('*');
    if (error) throw error;
    res.send(data);
  } catch (error) {
    res.status(500).send(`Failed to fetch summaries: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log("App is listening on the port", PORT);
});