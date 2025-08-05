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
    // Fix 1: Pass the recipe instructions as text to getTTS
    const audioBuffer = await getTTS(leanRecipe.instructions.join(" "))
    
    // Fix 2: Ensure audioBuffer is treated as a Buffer if it's not already
    // The getTTS function in openai.ts currently returns a string. 
    // If it were to return a Buffer, toString("base64") would be correct.
    // For now, assuming getTTS returns a string (URL or base64 string directly).
    // If getTTS returns a URL, we should return the URL. If it returns a base64 string, return that.
    // Based on the previous openai.ts, it returns a string (placeholder URL).
    return res.status(200).json({ audio: audioBuffer });
  } catch (error) {
    console.error('Error handling TTS request:', error);
    return res.status(500).json({ message: 'Error generating or uploading audio' });
  }
}

export default apiMiddleware(['POST'], handler);
