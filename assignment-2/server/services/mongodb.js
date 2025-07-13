const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let db;

async function connectMongoDB() {
  if (!db) {
    await client.connect();
    db = client.db('blog_summarizer');
  }
  return db;
}

async function storeFullText(url, fullText, sourceLang, targetLang) {
  try {
    const database = await connectMongoDB();
    const collection = database.collection('full_text_articles');
    const result = await collection.insertOne({
      url,
      fullText,
      createdAt: new Date(),
    });
    return result;
  } catch (error) {
    throw new Error(`MongoDB error: ${error.message}`);
  }
}

module.exports = { storeFullText };