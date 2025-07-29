/**
 * @jest-environment node
 */
import handler from '../../../src/pages/api/chat-assistant';
import { mockRequestResponse } from '../../apiMocks';
import Recipe from '../../../src/models/recipe';
import aigenerated from '../../../src/models/aigenerated';
import * as nextAuth from 'next-auth';
import { stub_recipe_1, getServerSessionStub } from '../../stub';
import { NextApiRequest, NextApiResponse } from 'next';

// mock authOptions & session
jest.mock('../../../src/pages/api/auth/[...nextauth]', () => ({
  authOptions: { adapter: {}, providers: [], callbacks: {} },
}));
jest.mock('next-auth/next');

jest.mock('../../../src/lib/mongodb', () => ({
  connectDB: jest.fn(() => Promise.resolve()),
}));

// ---- NEW: stub openRouterChat ----
jest.mock('../../../src/lib/openRouter', () => ({
  openRouterChat: jest.fn(),
}));

describe('/api/chat-assistant endpoint', () => {
  let getServerSessionSpy: any;
  let openRouterChatSpy: any;

  beforeEach(() => {
    process.env = { ...process.env, API_REQUEST_LIMIT: '5' };
    getServerSessionSpy = jest.spyOn(nextAuth, 'getServerSession');
    openRouterChatSpy = jest.requireMock('../../../src/lib/openRouter').openRouterChat;
  });

  afterEach(() => jest.resetAllMocks());

  it('shall return 400 if inputs are missing', async () => {
    getServerSessionSpy.mockResolvedValueOnce(getServerSessionStub);
    const { req, res } = mockRequestResponse('POST');
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toEqual(
      JSON.stringify({ error: 'Message and recipeId are required.' })
    );
  });

  it('shall return 404 if recipe not found', async () => {
    aigenerated.countDocuments = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(4) });
    getServerSessionSpy.mockResolvedValueOnce(getServerSessionStub);
    Recipe.findById = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValueOnce(null) });

    const { req, res } = mockRequestResponse('POST');
    const updatedreq = { ...req, body: { message: 'test', recipeId: 'nonexistent' } };
    await handler(updatedreq as unknown as NextApiRequest, res);
    expect(res._getStatusCode()).toBe(404);
    expect(res._getData()).toEqual(JSON.stringify({ error: 'Recipe not found.' }));
  });

  it('shall respond with limit reached if user exceeded usage', async () => {
    getServerSessionSpy.mockResolvedValueOnce(getServerSessionStub);
    openRouterChatSpy.mockResolvedValueOnce('mock-ai-reply');
    aigenerated.countDocuments = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(6) });
    Recipe.findById = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValueOnce(stub_recipe_1) });

    const { req, res } = mockRequestResponse('POST');
    const updatedreq = { ...req, body: { message: 'test', recipeId: '123', history: ['first message'] } };
    
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toEqual(JSON.stringify({ reachedLimit: true }));
  });

  it('shall respond with assistant reply if everything succeeds', async () => {
    getServerSessionSpy.mockResolvedValueOnce(getServerSessionStub);
    openRouterChatSpy.mockResolvedValueOnce('mock-ai-reply');
    aigenerated.countDocuments = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(4) });
    Recipe.findById = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValueOnce(stub_recipe_1) });

    const { req, res } = mockRequestResponse('POST');
    const updatedreq = { ...req, body: { message: 'test', recipeId: '123', history: [] } };
    await handler(updatedreq as unknown as NextApiRequest, res);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toEqual(JSON.stringify({ reply: 'mock-ai-reply', totalTokens: 0 }));
  });

  it('shall handle internal server error gracefully', async () => {
    getServerSessionSpy.mockResolvedValueOnce(getServerSessionStub);
    Recipe.findById = jest.fn().mockReturnValue({ lean: jest.fn().mockRejectedValueOnce(null) });
    const { req, res } = mockRequestResponse('POST');
    const updatedreq = { ...req, body: { message: 'test', recipeId: 'nonexistent' } };
    await handler(updatedreq as unknown as NextApiRequest, res);
    expect(res._getStatusCode()).toBe(500);
    expect(res._getData()).toEqual(JSON.stringify({ error: 'Internal server error' }));
  });
});