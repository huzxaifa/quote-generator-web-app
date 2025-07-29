/**
 * @jest-environment node
 */
import {
  generateRecipe,
  generateImages,
  validateIngredient,
  getTTS,
  generateRecipeTags,
  generateChatResponse,
} from '../../src/lib/openRouter'; // <-- NEW helpers
import aigenerated from '../../src/models/aigenerated';
import recipe from '../../src/models/recipe';
import { stubRecipeBatch } from '../stub';

// ----- Global fetch mock -----
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

// ----- DB mock -----
jest.mock('../../src/lib/mongodb', () => ({
  connectDB: () => Promise.resolve(),
}));

// ----- Utility to clear fetch mocks -----
afterEach(() => mockFetch.mockClear());

/* ------------------------------------------------------------------ */
describe('generating recipes via OpenRouter', () => {
  it('shall generate recipes given ingredients', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '["TEST-RECIPE-A", "TEST-RECIPE-B"]' } }],
      }),
    } as any);

    aigenerated.create = jest.fn().mockResolvedValue({ _id: 1234 });

    const ingredients = [{ name: 'ingredient-1', id: '1' }, { name: 'ingredient-2', id: '2' }];
    const result = await generateRecipe(ingredients, ['Keto', 'Vegetarian']);

    expect(result).toEqual({ recipes: '["TEST-RECIPE-A", "TEST-RECIPE-B"]', openaiPromptId: 1234 });
    expect(mockFetch).toHaveBeenCalled();
  });

  it('shall handle OpenRouter failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('fail'));
    const ingredients = [{ name: 'ingredient-1', id: '1' }];
    await expect(generateRecipe(ingredients, [])).rejects.toThrow('Failed to generate recipe');
  });
});

/* ------------------------------------------------------------------ */
describe('generating images via OpenRouter', () => {
  it('shall generate images given ingredients', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [{ url: 'http://stub-ai-image-url' }] }),
    } as any);


    const result = await generateImages(
      stubRecipeBatch.map(r => ({
        name: r.name,
        ingredients: r.ingredients.map(i => i.name),
      })) as any,
      'mockUserId'
    );
    expect(result).toEqual([
      { imgLink: 'http://stub-ai-image-url', name: 'Recipe_1_name' },
      { imgLink: 'http://stub-ai-image-url', name: 'Recipe_2_name' },
    ]);
  });

  it('shall throw on OpenRouter failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('fail'));
    await expect(generateImages(stubRecipeBatch, 'mock')).rejects.toThrow('Failed to generate image');
  });
});

/* ------------------------------------------------------------------ */
describe('validating ingredients via OpenRouter', () => {
  it('shall validate ingredient', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'mock-ingredient-validation-response' } }],
      }),
    } as any);

    const res = await validateIngredient('mock-ingredient');
    expect(res).toBe('mock-ingredient-validation-response');
  });

  it('shall throw on OpenRouter failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('fail'));
    await expect(validateIngredient('x')).rejects.toThrow('Failed to validate ingredient');
  });
});

/* ------------------------------------------------------------------ */
describe('generating audio via OpenRouter', () => {
  it('shall generate audio', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => Buffer.from('mock buffer'),
    } as any);

    const buf = await getTTS(stubRecipeBatch[0]);
    expect(buf).toEqual(Buffer.from('mock buffer'));
  });

  it('shall throw on OpenRouter failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('fail'));
    await expect(getTTS(stubRecipeBatch[0])).rejects.toThrow('Failed to generate tts');
  });
});

/* ------------------------------------------------------------------ */
describe('generating recipe tags via OpenRouter', () => {
  it('shall generate tags', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(['tag1', 'tag2']) } }],
      }),
    } as any);

    await generateRecipeTags(stubRecipeBatch[0]);
    expect(mockFetch).toHaveBeenCalled();
  });

  it('shall throw on bad JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({ invalid: true }) } }],
      }),
    } as any);

    await expect(generateRecipeTags(stubRecipeBatch[0])).rejects.toThrow(
      /Failed to parse tags/
    );
  });
});

/* ------------------------------------------------------------------ */
describe('generating chat responses via OpenRouter', () => {
  it('shall return AI reply', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Use flaxseed instead of eggs.' } }],
        usage: { total_tokens: 1000 },
      }),
    } as any);

    const res = await generateChatResponse('What can I use instead?', stubRecipeBatch[0], []);
    expect(res).toEqual({ reply: 'Use flaxseed instead of eggs.', totalTokens: 1000 });
  });

  it('shall fallback on error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('fail'));
    const res = await generateChatResponse('?', stubRecipeBatch[0], []);
    expect(res).toEqual({ reply: 'Sorry, I had trouble responding.', totalTokens: 0 });
  });
});