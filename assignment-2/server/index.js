const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const translateText = require('./services/translate');
const { storeSummary } = require('./services/supabase');
const { storeFullText } = require('./services/mongodb');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

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
    console.log('Fetched summaries:', data);
    res.send(data);
  } catch (error) {
    console.error('Failed to fetch summaries:', error);
    res.status(500).send(`Failed to fetch summaries: ${error.message}`);
  }
});

module.exports = app;