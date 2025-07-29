/**
 * @jest-environment node
 */
import saveRecipes from '../../../src/pages/api/save-recipes';
import Recipe from '../../../src/models/recipe';
import { mockRequestResponse } from '../../apiMocks';
import { stubRecipeBatch, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';
import * as openRouter from '../../../src/lib/openRouter'; // <-- NEW

// auth & session
jest.mock('../../../src/pages/api/auth/[...nextauth]', () => ({
  authOptions: { adapter: {}, providers: [], callbacks: {} },
}));
jest.mock('next-auth/next');

// db
jest.mock('../../../src/lib/mongodb', () => ({
  connectDB: () => Promise.resolve(),
}));

// openRouter mocks
jest.mock('../../../src/lib/openRouter', () => ({
  generateImages: jest.fn(),
  generateRecipeTags: () => Promise.resolve(),
}));

// s3
jest.mock('../../../src/lib/awss3', () => ({
  uploadImagesToS3: jest.fn(() =>
    Promise.resolve([
      { location: '6683b8908475eac9af5fe834', uploaded: true },
      { location: '6683b8908475eac9af5fe836', uploaded: false },
    ])
  ),
}));

describe('Saving recipes', () => {
  let getServerSessionSpy: any;

  beforeEach(() => {
    getServerSessionSpy = jest.spyOn(nextAuth, 'getServerSession');
  });

  afterEach(() => jest.resetAllMocks());

  it('rejects non-POST', async () => {
    getServerSessionSpy.mockResolvedValueOnce(getServerSessionStub);
    const { req, res } = mockRequestResponse('GET');
    await saveRecipes(req as any, res);
    expect(res.statusCode).toBe(405);
  });

  it('401 if not logged in', async () => {
    getServerSessionSpy.mockResolvedValueOnce(null);
    const { req, res } = mockRequestResponse('POST');
    await saveRecipes(req as any, res);
    expect(res.statusCode).toBe(401);
  });

  it('success path', async () => {
    getServerSessionSpy.mockResolvedValueOnce(getServerSessionStub);
    jest.spyOn(openRouter, 'generateImages').mockResolvedValueOnce([
      { imgLink: 'https://mock-img-1', name: 'recipe-1' },
      { imgLink: 'https://mock-img-2', name: 'recipe-2' },
    ]);

    Recipe.insertMany = jest.fn().mockResolvedValue(stubRecipeBatch);

    const { req, res } = mockRequestResponse('POST');
    const updatedreq: any = { ...req, body: { recipes: stubRecipeBatch } };
    await saveRecipes(updatedreq, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ status: 'Saved Recipes and generated the Images!' });
  });

  it('500 on DB failure', async () => {
    getServerSessionSpy.mockResolvedValueOnce(getServerSessionStub);
    Recipe.insertMany = jest.fn().mockRejectedValue(new Error('boom'));

    const { req, res } = mockRequestResponse('POST');
    const updatedreq: any = { ...req, body: { recipes: [] } };
    await saveRecipes(updatedreq, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ error: 'Failed to save recipes' });
  });
});