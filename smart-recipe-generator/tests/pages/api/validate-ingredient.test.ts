/**
 * @jest-environment node
 */
import validateIngredient from '../../../src/pages/api/validate-ingredient';
import Ingredient from '../../../src/models/ingredient';
import { mockRequestResponse } from '../../apiMocks';
import * as openRouter from '../../../src/lib/openRouter';
import * as nextAuth from 'next-auth';
import { getServerSessionStub } from '../../stub';

// auth & session
jest.mock('../../../src/pages/api/auth/[...nextauth]', () => ({
  authOptions: { adapter: {}, providers: [], callbacks: {} },
}));
jest.mock('next-auth/next');

// db
jest.mock('../../../src/lib/mongodb', () => ({
  connectDB: () => Promise.resolve(),
}));

// openRouter validation helper
jest.mock('../../../src/lib/openRouter', () => ({
  validateIngredient: jest.fn(() => Promise.resolve(null)),
}));

describe('validate-ingredient endpoint', () => {
  let getServerSessionSpy: any;
  let validateIngredientSpy: any;

  beforeEach(() => {
    getServerSessionSpy = jest.spyOn(nextAuth, 'getServerSession');
    validateIngredientSpy = jest.spyOn(openRouter, 'validateIngredient');
  });

  afterEach(() => jest.resetAllMocks());

  it('rejects non-POST', async () => {
    getServerSessionSpy.mockResolvedValueOnce(getServerSessionStub);
    const { req, res } = mockRequestResponse('GET');
    await validateIngredient(req as any, res);
    expect(res.statusCode).toBe(405);
  });

  it('401 if not logged in', async () => {
    getServerSessionSpy.mockResolvedValueOnce(null);
    const { req, res } = mockRequestResponse('POST');
    await validateIngredient(req as any, res);
    expect(res.statusCode).toBe(401);
  });

  it('400 if no ingredient name', async () => {
    getServerSessionSpy.mockResolvedValueOnce(getServerSessionStub);
    const { req, res } = mockRequestResponse('POST');
    const updatedreq: any = { ...req, body: {} };
    await validateIngredient(updatedreq, res);
    expect(res.statusCode).toBe(400);
  });

  it('responds with parsing error when helper returns null', async () => {
    getServerSessionSpy.mockResolvedValueOnce(getServerSessionStub);
    validateIngredientSpy.mockResolvedValueOnce(null);
    const { req, res } = mockRequestResponse('POST');
    const updatedreq: any = { ...req, body: { ingredientName: 'mockIngredient' } };
    await validateIngredient(updatedreq, res);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ message: 'Error with parsing response' });
  });

  it('responds invalid + suggestions', async () => {
    getServerSessionSpy.mockResolvedValueOnce(getServerSessionStub);
    validateIngredientSpy.mockResolvedValueOnce(
      JSON.stringify({ isValid: false, possibleVariations: ['var-1', 'var-2'] })
    );
    Ingredient.findOne = jest.fn().mockResolvedValue([]);
    const { req, res } = mockRequestResponse('POST');
    const updatedreq: any = { ...req, body: { ingredientName: 'mockIngredient' } };
    await validateIngredient(updatedreq, res);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      message: 'Invalid',
      suggested: ['var-1', 'var-2'],
    });
  });

  it('rejects duplicate ingredient', async () => {
    getServerSessionSpy.mockResolvedValueOnce(getServerSessionStub);
    validateIngredientSpy.mockResolvedValueOnce(
      JSON.stringify({ isValid: true, possibleVariations: ['var-1', 'var-2'] })
    );
    Ingredient.findOne = jest.fn().mockResolvedValue(true);
    const { req, res } = mockRequestResponse('POST');
    const updatedreq: any = { ...req, body: { ingredientName: 'mockIngredient' } };
    await validateIngredient(updatedreq, res);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      message: 'Error: This ingredient already exists',
    });
  });

  it('adds new ingredient when valid & unique', async () => {
    getServerSessionSpy.mockResolvedValueOnce(getServerSessionStub);
    validateIngredientSpy.mockResolvedValueOnce(
      JSON.stringify({ isValid: true, possibleVariations: ['var-1', 'var-2'] })
    );
    Ingredient.findOne = jest.fn().mockResolvedValue(false);
    Ingredient.create = jest.fn().mockResolvedValue('mock-added-ingredient');
    const { req, res } = mockRequestResponse('POST');
    const updatedreq: any = { ...req, body: { ingredientName: 'mockIngredient' } };
    await validateIngredient(updatedreq, res);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      message: 'Success',
      newIngredient: 'mock-added-ingredient',
      suggested: ['var-1', 'var-2'],
    });
  });

  it('500 on unexpected error', async () => {
    getServerSessionSpy.mockResolvedValueOnce(getServerSessionStub);
    validateIngredientSpy.mockRejectedValue(new Error('boom'));
    const { req, res } = mockRequestResponse('POST');
    const updatedreq: any = { ...req, body: { ingredientName: 'mockIngredient' } };
    await validateIngredient(updatedreq, res);
    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ error: 'Failed to add ingredient' });
  });
});