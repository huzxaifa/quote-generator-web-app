import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

export async function generateRecipeWithHF(ingredients: string[], dietaryPreferences: string[]): Promise<any> {
    try {
        const ingredientList = ingredients.join(', ');
        const dietaryList = dietaryPreferences.length > 0 ? dietaryPreferences.join(', ') : 'any';
        
        // Improved prompt for better recipe generation
        const prompt = `Create a detailed recipe using these ingredients: ${ingredientList}. 
        Dietary preferences: ${dietaryList}.
        
        Generate a creative recipe name and return in this exact JSON format:
        {
          "name": "Creative Recipe Name (not 'Recipe with ingredients')",
          "ingredients": [{"name": "ingredient", "quantity": "specific amount"}],
          "instructions": ["detailed step 1", "detailed step 2", "detailed step 3"],
          "dietaryPreference": ["${dietaryPreferences.join('", "')}"],
          "additionalInformation": {
            "tips": "specific cooking tips for this recipe",
            "variations": "creative variations of this recipe",
            "servingSuggestions": "how to serve this specific dish",
            "nutritionalInformation": "nutritional details for this recipe"
          }
        }
        
        Make the recipe name creative and descriptive, like "Salmon Croissant Sandwich" or "Cheese and Salmon Frittata".`;

        // Try multiple models for better results
        const models = [
            'gpt2',
            'facebook/opt-350m', 
            'microsoft/DialoGPT-medium',
            't5-small'
        ];

        let response;
        let lastError;

        for (const model of models) {
            try {
                console.log(`Trying model: ${model}`);
                
                response = await hf.textGeneration({
                    model: model,
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 800,
                        temperature: 0.8,
                        do_sample: true,
                        top_p: 0.9
                    }
                });

                // Try to parse the response as JSON
                const generatedText = response.generated_text;
                console.log('Generated text:', generatedText);
                
                // Look for JSON in the response
                const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const recipeData = JSON.parse(jsonMatch[0]);
                    
                    // Validate the recipe data
                    if (recipeData.name && recipeData.ingredients && recipeData.instructions) {
                        console.log('Successfully parsed recipe:', recipeData.name);
                        return recipeData;
                    }
                }
                
            } catch (modelError) {
                console.log(`Model ${model} failed:`, modelError);
                lastError = modelError;
                continue;
            }
        }

        // If all models fail, create a better fallback recipe
        console.log('All models failed, using fallback');
        return createBetterRecipe(ingredients, dietaryPreferences);

    } catch (error) {
        console.error('Hugging Face recipe generation error:', error);
        return createBetterRecipe(ingredients, dietaryPreferences);
    }
}

function createBetterRecipe(ingredients: string[], dietaryPreferences: string[]): any {
    // Create more creative recipe names based on ingredients
    const recipeNames = [
        `${ingredients[0]} ${ingredients[1]} Delight`,
        `${ingredients[0]} and ${ingredients[1]} Fusion`,
        `${ingredients[0]} ${ingredients[1]} Bowl`,
        `${ingredients[0]} ${ingredients[1]} Medley`,
        `${ingredients[0]} ${ingredients[1]} Special`
    ];
    
    const randomName = recipeNames[Math.floor(Math.random() * recipeNames.length)];
    
    return {
        name: randomName,
        ingredients: ingredients.map(name => ({ 
            name, 
            quantity: getRandomQuantity(name) 
        })),
        instructions: [
            'Prepare all ingredients as listed.',
            'Follow cooking instructions based on your preferences.',
            'Cook until done and serve hot.',
            'Garnish and enjoy your meal!'
        ],
        dietaryPreference: dietaryPreferences,
        additionalInformation: {
            tips: 'Use fresh ingredients for the best flavor.',
            variations: 'You can substitute ingredients based on availability.',
            servingSuggestions: 'Serve immediately for best taste.',
            nutritionalInformation: 'Contains various nutrients from the ingredients used.'
        }
    };
}

function getRandomQuantity(ingredient: string): string {
    const quantities = [
        '1 cup', '2 pieces', '3 tablespoons', '1/2 cup', 
        '200 grams', '100 grams', '4 slices', '1 tablespoon'
    ];
    return quantities[Math.floor(Math.random() * quantities.length)];
}