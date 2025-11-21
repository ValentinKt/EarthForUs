jest.mock('../logger', () => ({
  logger: {
    withContext: jest.fn(() => ({
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      group: jest.fn(() => ({ end: jest.fn() })),
      time: jest.fn(() => ({ end: jest.fn() })),
    })),
  },
}));

jest.mock('../errorReporter', () => ({
  report: jest.fn(),
}));

import { api, request } from '../api';

describe('API Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('request function', () => {
    it('should make a successful GET request', async () => {
      const mockResponse = { data: 'test' };
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValueOnce(mockResponse),
        text: jest.fn(),
      } as any);

      const result = await request('/test');
      
      expect(mockFetch).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should make a successful POST request with JSON body', async () => {
      const mockBody = { name: 'test' };
      const mockResponse = { id: 1, name: 'test' };
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValueOnce(mockResponse),
        text: jest.fn(),
      } as any);

      const result = await request('/test', { method: 'POST', body: mockBody });
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/test',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Headers),
          body: JSON.stringify(mockBody),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle 204 No Content response', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
        json: jest.fn(),
        text: jest.fn(),
      } as any);

      const result = await request('/test');
      expect(result).toBeUndefined();
    });

    it('should handle error response', async () => {
      const mockError = { error: 'Not found' };
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValueOnce(mockError),
        text: jest.fn(),
      } as any);

      await expect(request('/test')).rejects.toThrow('Not found');
    });

    it('should handle network errors', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(request('/test')).rejects.toThrow('Network error');
    });

    it('should handle FormData body', async () => {
      const mockFormData = new FormData();
      mockFormData.append('file', 'test');
      const mockResponse = { success: true };
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValueOnce(mockResponse),
        text: jest.fn(),
      } as any);

      const result = await request('/test', { method: 'POST', body: mockFormData });
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/test',
        expect.objectContaining({
          method: 'POST',
          body: mockFormData,
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle absolute URLs', async () => {
      const mockResponse = { data: 'test' };
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValueOnce(mockResponse),
        text: jest.fn(),
      } as any);

      await request('https://api.example.com/test');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.any(Object)
      );
    });
  });

  describe('api convenience methods', () => {
    it('should make GET request with api.get', async () => {
      const mockResponse = { data: 'test' };
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValueOnce(mockResponse),
        text: jest.fn(),
      } as any);

      const result = await api.get('/test');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/test',
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should make POST request with api.post', async () => {
      const mockBody = { name: 'test' };
      const mockResponse = { id: 1, name: 'test' };
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValueOnce(mockResponse),
        text: jest.fn(),
      } as any);

      const result = await api.post('/test', mockBody);
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockBody),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should make PUT request with api.put', async () => {
      const mockBody = { name: 'updated' };
      const mockResponse = { id: 1, name: 'updated' };
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValueOnce(mockResponse),
        text: jest.fn(),
      } as any);

      const result = await api.put('/test/1', mockBody);
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/test/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(mockBody),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should make DELETE request with api.del', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
        json: jest.fn(),
        text: jest.fn(),
      } as any);

      const result = await api.del('/test/1');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/test/1',
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(result).toBeUndefined();
    });
  });
});