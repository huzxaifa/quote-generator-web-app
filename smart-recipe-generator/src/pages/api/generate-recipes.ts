import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { generateRecipeWithHF } from '../../lib/huggingFace';

const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        const { ingredients, dietaryPreferences } = req.body;

        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ error: 'Ingredients are required' });
        }

        const ingredientNames = ingredients.map(ing => ing.name);
        
        console.info('Generating recipes with Hugging Face...');
        
        // Generate recipe using Hugging Face
        const recipeData = await generateRecipeWithHF(ingredientNames, dietaryPreferences || []);
        
        const response = { 
            recipes: JSON.stringify([recipeData]),
            openaiPromptId: `hf-${Date.now()}`
        };
        
        res.status(200).json(response);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate recipes' });
    }
};

export default apiMiddleware(['POST'], handler);