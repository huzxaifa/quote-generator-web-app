import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

// Recipe name templates for better naming
const recipeNameTemplates = {
    sandwich: (ingredients: string[]) => {
        const protein = ingredients.find(i => ['salmon', 'chicken', 'turkey', 'ham', 'tuna', 'beef'].some(p => i.toLowerCase().includes(p)));
        const bread = ingredients.find(i => ['croissant', 'bread', 'bun', 'roll', 'bagel'].some(b => i.toLowerCase().includes(b)));
        if (protein && bread) {
            return `${capitalizeFirst(protein)} ${capitalizeFirst(bread)} Sandwich`;
        }
        return null;
    },
    frittata: (ingredients: string[]) => {
        if (ingredients.some(i => i.toLowerCase().includes('egg'))) {
            const mainIngredients = ingredients.filter(i => 
                !i.toLowerCase().includes('egg') && 
                !i.toLowerCase().includes('salt') && 
                !i.toLowerCase().includes('pepper')
            ).slice(0, 2);
            return `${mainIngredients.map(capitalizeFirst).join(' and ')} Frittata`;
        }
        return null;
    },
    salad: (ingredients: string[]) => {
        const greens = ingredients.find(i => ['lettuce', 'spinach', 'arugula', 'kale'].some(g => i.toLowerCase().includes(g)));
        if (greens) {
            const otherIngredients = ingredients.filter(i => i !== greens).slice(0, 2);
            return `${otherIngredients.map(capitalizeFirst).join(' ')} ${capitalizeFirst(greens)} Salad`;
        }
        return null;
    },
    pasta: (ingredients: string[]) => {
        const pasta = ingredients.find(i => ['pasta', 'spaghetti', 'penne', 'linguine', 'fettuccine'].some(p => i.toLowerCase().includes(p)));
        if (pasta) {
            const sauce = ingredients.find(i => ['tomato', 'cream', 'pesto', 'cheese'].some(s => i.toLowerCase().includes(s)));
            if (sauce) {
                return `${capitalizeFirst(sauce)} ${capitalizeFirst(pasta)}`;
            }
        }
        return null;
    },
    soup: (ingredients: string[]) => {
        if (ingredients.some(i => ['broth', 'stock', 'soup'].some(s => i.toLowerCase().includes(s)))) {
            const mainIngredients = ingredients.filter(i => 
                !['broth', 'stock', 'soup', 'salt', 'pepper'].some(s => i.toLowerCase().includes(s))
            ).slice(0, 2);
            return `${mainIngredients.map(capitalizeFirst).join(' and ')} Soup`;
        }
        return null;
    }
};

function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function generateCreativeRecipeName(ingredients: string[]): string {
    // Try template-based naming first
    for (const [type, generator] of Object.entries(recipeNameTemplates)) {
        const name = generator(ingredients);
        if (name) return name;
    }
    
    // Fallback to creative combinations
    const mainIngredients = ingredients.slice(0, 3);
    const creativeCombinations = [
        `${capitalizeFirst(mainIngredients[0])} ${capitalizeFirst(mainIngredients[1])} Delight`,
        `${capitalizeFirst(mainIngredients[0])} and ${capitalizeFirst(mainIngredients[1])} Fusion`,
        `${capitalizeFirst(mainIngredients[0])} ${capitalizeFirst(mainIngredients[1])} Bowl`,
        `${capitalizeFirst(mainIngredients[0])} ${capitalizeFirst(mainIngredients[1])} Medley`,
        `Gourmet ${capitalizeFirst(mainIngredients[0])} ${capitalizeFirst(mainIngredients[1])}`,
        `${capitalizeFirst(mainIngredients[0])} ${capitalizeFirst(mainIngredients[1])} Supreme`,
        `Chef's ${capitalizeFirst(mainIngredients[0])} ${capitalizeFirst(mainIngredients[1])}`,
        `${capitalizeFirst(mainIngredients[0])} ${capitalizeFirst(mainIngredients[1])} Specialty`
    ];
    
    return creativeCombinations[Math.floor(Math.random() * creativeCombinations.length)];
}

export async function validateIngredientWithHF(ingredient: string): Promise<{ isValid: boolean; suggested: string | null }> {
    try {
        // Use Hugging Face to validate if the input is a valid food ingredient
        const prompt = `Is "${ingredient}" a valid food ingredient that can be used in cooking? Answer only with "yes" or "no". If not, suggest a valid alternative.`;
        
        const response = await hf.textGeneration({
            model: 'gpt2',
            inputs: prompt,
            parameters: {
                max_new_tokens: 50,
                temperature: 0.1,
                do_sample: false
            }
        });

        const generatedText = response.generated_text.toLowerCase();
        let isValid = generatedText.includes('yes');
        let suggested: string | null = null;

        if (!isValid) {
            const suggestionMatch = generatedText.match(/suggest\s*(?:a\s*valid\s*)?alternative\s*:\s*([a-zA-Z0-9\s,]+)/i);
            if (suggestionMatch && suggestionMatch[1]) {
                suggested = suggestionMatch[1].trim();
            } else {
                // Fallback if no specific suggestion is parsed from HF response
                suggested = isCommonIngredient(ingredient) ? null : 'Please enter a valid food ingredient.';
            }
        }
        
        // Always check against common ingredients as a strong fallback
        if (isCommonIngredient(ingredient)) {
            isValid = true;
            suggested = null; // If it's a common ingredient, no suggestion needed
        }

        console.log(`Ingredient validation for "${ingredient}": isValid=${isValid}, suggested=${suggested}`);
        return { isValid, suggested };
    } catch (error) {
        console.error('Hugging Face ingredient validation error:', error);
        // Fallback to simple validation and a generic suggestion on error
        const isValid = isCommonIngredient(ingredient);
        const suggested = isValid ? null : 'Could not validate ingredient. Please try a common food item.';
        return { isValid, suggested };
    }
}

function isCommonIngredient(ingredient: string): boolean {
    const commonIngredients = [
        'salmon', 'chicken', 'beef', 'pork', 'fish', 'eggs', 'cheese', 'milk', 'butter',
        'bread', 'rice', 'pasta', 'tomato', 'onion', 'garlic', 'salt', 'pepper',
        'croissant', 'lettuce', 'spinach', 'carrot', 'potato', 'lemon', 'lime',
        'flour', 'sugar', 'oil', 'vinegar', 'herbs', 'spices', 'meat', 'vegetable',
        'fruit', 'grain', 'dairy', 'seafood', 'poultry', 'bean', 'nut', 'seed'
    ];
    
    const lower = ingredient.toLowerCase();
    return commonIngredients.some(common => 
        lower.includes(common) || 
        common.includes(lower) ||
        lower.length > 2 // Basic length check for reasonable ingredient names
    );
}

export async function generateRecipeWithHF(ingredients: string[], dietaryPreferences: string[]): Promise<any> {
    try {
        const ingredientList = ingredients.join(', ');
        const dietaryList = dietaryPreferences.length > 0 ? dietaryPreferences.join(', ') : 'any';
        
        // Generate a creative recipe name first
        const creativeName = generateCreativeRecipeName(ingredients);
        
        // Improved prompt for better recipe generation
        const prompt = `Create a detailed recipe using these ingredients: ${ingredientList}. 
        Dietary preferences: ${dietaryList}.
        Recipe name should be: "${creativeName}"
        
        Generate a complete recipe and return in this exact JSON format:
        {
          "name": "${creativeName}",
          "ingredients": [{"name": "ingredient", "quantity": "specific amount with units"}],
          "instructions": ["detailed step 1", "detailed step 2", "detailed step 3", "detailed step 4"],
          "dietaryPreference": ["${dietaryPreferences.join('", "')}"],
          "additionalInformation": {
            "tips": "specific cooking tips for this recipe",
            "variations": "creative variations of this recipe",
            "servingSuggestions": "how to serve this specific dish",
            "nutritionalInformation": "nutritional details for this recipe"
          }
        }
        
        Make sure the recipe is practical and the instructions are clear and detailed.`;

        // Try multiple models for better results
        const models = [
            'gpt2',
            'facebook/opt-350m', 
            'microsoft/DialoGPT-medium'
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
                        max_new_tokens: 1000,
                        temperature: 0.7,
                        do_sample: true,
                        top_p: 0.9,
                        repetition_penalty: 1.1
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
        console.log('All models failed, using enhanced fallback');
        return createEnhancedRecipe(ingredients, dietaryPreferences);

    } catch (error) {
        console.error('Hugging Face recipe generation error:', error);
        return createEnhancedRecipe(ingredients, dietaryPreferences);
    }
}

function createEnhancedRecipe(ingredients: string[], dietaryPreferences: string[]): any {
    const creativeName = generateCreativeRecipeName(ingredients);
    
    // More realistic quantities based on ingredient type
    const getRealisticQuantity = (ingredient: string): string => {
        const lower = ingredient.toLowerCase();
        
        if (lower.includes('salmon') || lower.includes('chicken') || lower.includes('beef')) {
            return '200 grams';
        }
        if (lower.includes('egg')) {
            return '2 pieces';
        }
        if (lower.includes('cheese')) {
            return '2 slices';
        }
        if (lower.includes('croissant') || lower.includes('bread')) {
            return '2 pieces';
        }
        if (lower.includes('butter')) {
            return '1 tablespoon';
        }
        if (lower.includes('lemon')) {
            return '1 tablespoon';
        }
        if (lower.includes('salt') || lower.includes('pepper')) {
            return 'to taste';
        }
        if (lower.includes('milk') || lower.includes('cream')) {
            return '1/2 cup';
        }
        
        // Default quantities
        const quantities = ['1 cup', '1/2 cup', '100 grams', '3 tablespoons'];
        return quantities[Math.floor(Math.random() * quantities.length)];
    };
    
    // Generate more detailed instructions based on recipe type
    const generateInstructions = (recipeName: string, ingredients: string[]): string[] => {
        const lower = recipeName.toLowerCase();
        
        if (lower.includes('sandwich')) {
            return [
                'Preheat oven to 180°C (350°F).',
                'Season the salmon with salt, black pepper, and lemon juice.',
                'Bake the salmon in the preheated oven for 12-15 minutes until cooked through.',
                'In a pan, melt the butter and scramble the eggs, seasoning with a pinch of salt.',
                'Cut the croissants in half and layer the cooked salmon and scrambled eggs inside.',
                'Place a slice of cheese on top and close the croissant.',
                'Optionally warm the sandwich in the oven for 5 minutes to melt the cheese.'
            ];
        }
        
        if (lower.includes('frittata')) {
            return [
                'Preheat oven to 190°C (375°F).',
                'Heat butter in an oven-safe pan over medium heat.',
                'Add the main ingredients and cook for 3-4 minutes.',
                'Beat the eggs with salt and pepper, then pour over the ingredients.',
                'Cook for 2-3 minutes until edges start to set.',
                'Transfer to oven and bake for 10-12 minutes until golden and set.',
                'Let cool for 2 minutes before slicing and serving.'
            ];
        }
        
        // Default instructions
        return [
            'Prepare all ingredients as listed above.',
            'Heat a pan or oven to appropriate temperature.',
            'Combine ingredients according to recipe requirements.',
            'Cook until ingredients are properly done.',
            'Season to taste and serve immediately.',
            'Garnish as desired and enjoy your meal!'
        ];
    };
    
    const instructions = generateInstructions(creativeName, ingredients);
    
    return {
        name: creativeName,
        ingredients: ingredients.map(name => ({ 
            name, 
            quantity: getRealisticQuantity(name) 
        })),
        instructions: instructions,
        dietaryPreference: dietaryPreferences,
        additionalInformation: {
            tips: 'Use fresh ingredients for the best flavor. Adjust seasoning to your taste preferences.',
            variations: 'You can substitute ingredients based on availability or dietary restrictions.',
            servingSuggestions: 'Serve immediately while hot for the best taste and texture.',
            nutritionalInformation: 'This recipe provides a balanced combination of proteins, carbohydrates, and essential nutrients from the selected ingredients.'
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