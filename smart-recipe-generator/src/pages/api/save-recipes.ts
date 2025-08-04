import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { generateImages } from '../../lib/openRouter';

import { apiMiddleware } from '../../lib/apiMiddleware';
import { connectDB } from '../../lib/mongodb';
import recipe from '../../models/recipe';
import { Recipe, ExtendedRecipe } from '../../types';

const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        // Extract recipes from the request body
        const { recipes } = req.body;
        const recipeNames = recipes.map(({ name, ingredients }: Recipe) => ({ name, ingredients }));

        // Generate images using Unsplash
        console.info('Getting images from Unsplash...');
        const imageResults = await generateImages(recipeNames, session.user.id);
        
        // Update recipe data with image links and owner information
        const updatedRecipes = recipes.map((r: Recipe, idx: number) => ({
            ...r,
            owner: new mongoose.Types.ObjectId(session.user.id),
            imgLink: imageResults[idx].imgLink,
            openaiPromptId: r.openaiPromptId.split('-')[0] // Remove client key iteration
        }));

        // Connect to MongoDB and save recipes
        await connectDB();
        const savedRecipes = await recipe.insertMany(updatedRecipes);
        console.info(`Successfully saved ${recipes.length} recipes to MongoDB`);

        // Remove the generateRecipeTags call for now
        // savedRecipes.forEach((r) => {
        //     generateRecipeTags(r as ExtendedRecipe, session.user.id)
        //         .catch((error) => console.error(`Failed to generate tags for recipe ${r.name}:`, error));
        // });

        // Respond with success message
        res.status(200).json({ status: 'Saved Recipes and generated the Images!' });
    } catch (error) {
        // Handle any errors that occur during the process
        console.error('Failed to send response:', error);
        res.status(500).json({ error: 'Failed to save recipes' });
    }
};

export default apiMiddleware(['POST'], handler);