const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Supabase setup
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// MongoDB setup
const mongoClient = new MongoClient(process.env.MONGODB_URI);
let db;

async function connectMongo() {
  await mongoClient.connect();
  db = mongoClient.db('recipe_generator');
}

// Auth: Send magic link
app.post('/auth/magic-link', async (req, res) => {
  const { email } = req.body;
  try {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
    res.json({ message: 'Magic link sent' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Auth: Verify session
app.get('/auth/session', async (req, res) => {
  const { authorization } = req.headers;
  try {
    const { data: { user }, error } = await supabase.auth.getUser(authorization);
    if (error) throw error;
    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid session' });
  }
});

// Save recipe
app.post('/recipes', async (req, res) => {
  const { userId, recipe } = req.body;
  try {
    const collection = db.collection('recipes');
    const result = await collection.insertOne({ userId, ...recipe, createdAt: new Date() });
    res.json({ id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save recipe' });
  }
});

// Get user recipes
app.get('/recipes/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const collection = db.collection('recipes');
    const recipes = await collection.find({ userId }).toArray();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Mock AI endpoint for testing
app.post('/ai/generate-recipe', async (req, res) => {
  const { ingredients, cuisine, dietary } = req.body;
  // This would call n8n workflow in production
  res.json({
    recipe: {
      title: `Mock ${cuisine} Recipe`,
      ingredients: ingredients.split(',').map(i => i.trim()),
      instructions: ['Step 1: Prepare ingredients', 'Step 2: Cook', 'Step 3: Serve'],
      prepTime: '30 minutes'
    }
  });
});

connectMongo().then(() => {
  app.listen(3000, () => console.log('Server running on port 3000'));
});