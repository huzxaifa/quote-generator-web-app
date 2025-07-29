import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { openRouterChat } from '../../lib/openRouter';

/**
 * API handler for generating recipes based on provided ingredients and dietary preferences.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        // Extract ingredients and dietary preferences from request body
        const { ingredients, dietaryPreferences } = req.body;

        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ error: 'Ingredients are required' });
        }

        
        const prefs = dietaryPreferences?.length
          ? `Dietary preferences: ${dietaryPreferences.join(', ')}. `
          : '';
        const prompt =
          `Create a detailed, easy-to-follow recipe that uses the following ingredients: ${ingredients.join(
            ', '
          )}. ${prefs}` +
          `Return only the recipe in markdown format (title as H1, ingredients as bullet list, numbered steps).`;

    
        console.info('Generating recipes ...');
        const markdown = await openRouterChat([
          { role: 'system', content: 'You are a creative chef.' },
          { role: 'user', content: prompt },
        ]);
        const response = { recipes: [{ markdown }] };
        
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate recipes' });
    }
};

export default apiMiddleware(['POST'], handler);
