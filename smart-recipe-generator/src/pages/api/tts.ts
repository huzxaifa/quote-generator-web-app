import { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { connectDB } from '../../lib/mongodb';
import Recipe from '../../models/recipe';

import { getTTS } from '../../lib/openai'
import { ExtendedRecipe } from '../../types';

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  const { recipeId } = req.body;

  if (!recipeId) {
    return res.status(400).json({ message: 'Missing recipeId' });
  }

  try {
    // Connect to the databaseand Fetch the recipe
    await connectDB();
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // If the audio link already exists, return it
    if (recipe.audio) {
      return res.status(200).json({ audio: recipe.audio });
    }
    
    console.info("Synthesizing text to speech.....")
    const leanRecipe = recipe.toObject() as unknown as ExtendedRecipe;
    const audioBuffer = await getTTS(leanRecipe, session.user.id)
    
    // Return the audio buffer directly
    return res.status(200).json({ audio: audioBuffer.toString("base64") });
  } catch (error) {
    console.error('Error handling TTS request:', error);
    return res.status(500).json({ message: 'Error generating or uploading audio' });
  }
}

export default apiMiddleware(['POST'], handler);
