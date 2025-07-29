const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

/* ---------- helpers ---------- */
type RecipeStub = {
  name: string;
  ingredients: { name: string; quantity?: string }[];
  instructions?: string[];
  dietaryPreference?: string[];
  additionalInformation?: any;
};

if (!OPENROUTER_API_KEY) {
  throw new Error("Missing OPENROUTER_API_KEY in .env");
}

export async function openRouterChat(
  messages: { role: "user" | "system" | "assistant"; content: string }[],
  model = "openai/gpt-4-turbo"
) {
  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
      "X-Title": "smart-recipe-generator",
    },
    body: JSON.stringify({ model, messages }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${text}`);
  }

  const json = await res.json();
  return json.choices[0]?.message?.content || "";
}

export async function generateImages(items: any[], userId: string): Promise<{ imgLink: string; name: string }[]> {
  return Promise.all(
    items.map(async ({ name, ingredients }) => {
      const prompt = `Professional food photography of ${name}, featuring ${ingredients.join(
        ', '
      )}, high-resolution, appetizing lighting`;

      const res = await fetch(`${OPENROUTER_BASE_URL}/images/generations`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/dall-e-3',
          prompt,
          n: 1,
          size: '1024x1024',
          response_format: 'url',
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`OpenRouter image error: ${res.status} ${txt}`);
      }

      const json = await res.json();
      return { imgLink: json.data[0].url, name };
    })
  );
}

/* 1. generateRecipe */
export async function generateRecipe(
  ingredients: any[], dietary: string[]
) {
  const prompt = `JSON array of 3 recipes with keys: name, ingredients(name,quantity), instructions, dietaryPreference, additionalInformation. Ingredients: ${JSON.stringify(
    ingredients
  )}. Dietary: ${dietary.join(',')}.`;

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'openai/gpt-4-turbo', messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) throw new Error('Failed to generate recipe');

  const json = await res.json();
  const recipes = json.choices[0]?.message?.content || '[]';

  // mock db insert for prompt tracking
  const AIGenerated = (await import('../../src/models/aigenerated')).default;
  return { recipes };
}

/* 2. validateIngredient */
export async function validateIngredient(name: string) {
  const prompt = `Return JSON: {"isValid": true/false,"possibleVariations":[...]} for ingredient "${name}".`;

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'openai/gpt-4-turbo', messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) throw new Error('Failed to validate ingredient');

  const json = await res.json();
  return json.choices[0]?.message?.content || '{}';
}

/* 3. getTTS */
export async function getTTS(recipe: any) {
  const prompt = `Recipe ${recipe.name}. Ingredients: ${recipe.ingredients
    .map((i: any) => i.name)
    .join(', ')}. Instructions: ${recipe.instructions?.join('. ')}`;

  const res = await fetch(`${OPENROUTER_BASE_URL}/audio/speech`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'openai/tts-1', voice: 'alloy', input: prompt }),
  });
  if (!res.ok) throw new Error('Failed to generate tts');

  return Buffer.from(await res.arrayBuffer());
}

/* 4. generateRecipeTags */
export async function generateRecipeTags(recipe: RecipeStub) {
  const prompt = `10 single-word tags in JSON array for "${recipe.name}".`;

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'openai/gpt-4-turbo', messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) throw new Error('Failed to generate tags');

  const json = await res.json();
  const tags = JSON.parse(json.choices[0]?.message?.content || '[]');
  // persist to DB if you want
}

/* 5. generateChatResponse */
export async function generateChatResponse(
  message: string,
  recipe: any,
  history: any[]
) {
  const systemPrompt = `You are a recipe assistant.\nRecipe: ${recipe.name}\nIngredients: ${recipe.ingredients
    .map((i: any) => i.name)
    .join(', ')}`;
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: message },
  ];

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'openai/gpt-4-turbo', messages }),
  });
  if (!res.ok) throw new Error('Failed to chat');

  const json = await res.json();
  const reply = json.choices[0]?.message?.content || 'Sorry, I had trouble responding.';
  return { reply, totalTokens: json.usage?.total_tokens || 0 };
}


