/**
 * @jest-environment node
 */
import generateRecipes from '../../../src/pages/api/generate-recipes';
import { mockRequestResponse } from '../../apiMocks';
import { stubRecipeBatch, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';
import * as op from '../../../src/lib/openRouter'; // <-- NEW helpers

// mock authOptions & session
jest.mock('../../../src/pages/api/auth/[...nextauth]', () => ({
  authOptions: { adapter: {}, providers: [], callbacks: {} },
}));
jest.mock('next-auth/next');

jest.mock('../../../src/lib/openRouter', () => ({
  generateRecipe: jest.fn(),
}));

describe('Generating recipes', () => {
  let getServerSessionSpy: any;
  let generateRecipeSpy: any;

  beforeEach(() => {
    getServerSessionSpy = jest.spyOn(nextAuth, 'getServerSession');
    generateRecipeSpy = jest.spyOn(op, 'generateRecipe');
  });

  afterEach(() => jest.resetAllMocks());

  it('shall reject GET', async () => {
    getServerSessionSpy.mockResolvedValueOnce(null);
    const { req, res } = mockRequestResponse('GET');
    await generateRecipes(req, res);
    expect(res.statusCode).toBe(405);
  });

  it('shall 401 if not logged in', async () => {
    getServerSessionSpy.mockResolvedValueOnce(null);
    const { req, res } = mockRequestResponse('POST');
    await generateRecipes(req, res);
    expect(res.statusCode).toBe(401);
  });

  it('shall 400 without ingredients', async () => {
    getServerSessionSpy.mockResolvedValueOnce(getServerSessionStub);
    const { req, res } = mockRequestResponse('POST');
    const updatedreq = { ...req, body: { ingredients: [] } };
    await generateRecipes(updatedreq as any, res);
    expect(res.statusCode).toBe(400);
  });

  it('shall return generated recipes', async () => {
    getServerSessionSpy.mockResolvedValueOnce(getServerSessionStub);
    generateRecipeSpy.mockResolvedValueOnce(stubRecipeBatch);
    const { req, res } = mockRequestResponse('POST');
    const updatedreq = {
      ...req,
      body: { ingredients: ['a', 'b'], dietaryPreferences: ['keto'] },
    };
    await generateRecipes(updatedreq as any, res);
    expect(generateRecipeSpy).toHaveBeenCalledWith(
      ['a', 'b'],
      ['keto'],
      '6687d83725254486590fec59'
    );
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(stubRecipeBatch);
  });

  it('shall 500 on generation failure', async () => {
    getServerSessionSpy.mockResolvedValueOnce(getServerSessionStub);
    generateRecipeSpy.mockRejectedValueOnce('Error');
    const { req, res } = mockRequestResponse('POST');
    const updatedreq = { ...req, body: { ingredients: ['a'] } };
    await generateRecipes(updatedreq as any, res);
    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ error: 'Failed to generate recipes' });
  });
});