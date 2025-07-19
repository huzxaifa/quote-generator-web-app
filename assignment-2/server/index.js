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
app.use(cors({
  origin: 'https://blog-summarizer-frontend.vercel.app',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Backend is running' });
}); 

app.post('/translate', async (req, res) => {
  const { text, source, target } = req.body;
  try {
    const translatedText = await translateText(text, source, target);
    console.log('Translated text:', translatedText);
    res.send(translatedText);
  } catch (error) {
    console.error('Translation failed:', error);
    res.status(500).send(`Translation failed: ${error.message}`);
  }
});

app.post('/store-summary', async (req, res) => {
  const { url, summary } = req.body;
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const fullText = $('article, .post-content, .entry-content, p').text().trim();
    const summaryResult = await storeSummary(url, summary);
    console.log('Stored summary in Supabase:', summaryResult);
    await storeFullText(url, fullText);
    res.send(summaryResult);
  } catch (error) {
    console.error('Failed to store summary:', error);
    res.status(500).send(`Failed to store summary: ${error.message}`);
  }
});

app.get('/summaries', async (req, res) => {
  try {
    const { data, error } = await supabase.from('summaries').select('*');
    if (error) throw error;
    console.log('Fetched summaries from Supabase:', data);
    res.send(data);
  } catch (error) {
    console.error('Failed to fetch summaries:', error);
    res.status(500).send(`Failed to fetch summaries: ${error.message}`);
  }
});

module.exports = app;