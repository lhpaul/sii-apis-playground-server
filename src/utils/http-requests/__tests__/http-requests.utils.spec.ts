import axios from 'axios';
import { apiRequest } from '../http-requests.utils';

jest.mock('axios');

describe('Http Request Utils', () => {
  const mockUrl = 'https://test-api.example.com/endpoint';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe(apiRequest.name, () => {
    it('should make a successful request and return expected result', async () => {
      const mockResponseData = { id: 1, name: 'Test Data' };
      (axios as jest.MockedFunction<typeof axios>).mockResolvedValueOnce({
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });
      
      const result = await apiRequest({
        method: 'GET',
        url: mockUrl,
      });
      
      expect(axios).toHaveBeenCalledWith({
        method: 'GET',
        url: mockUrl,
        headers: {
          'Content-Type': 'application/json',
        },
        params: undefined,
        data: undefined,
      });
      
      expect(result).toEqual({
        data: mockResponseData,
      });
    });
    
    it('should pass data, headers and params correctly to axios', async () => {
      const mockResponseData = { result: 'success' };
      const mockParams = { filter: 'test' };
      const mockData = { field: 'value' };
      const mockHeaders = { 'Authorization': 'Bearer token123' };
      
      (axios as jest.MockedFunction<typeof axios>).mockResolvedValueOnce({
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });
      
      const result = await apiRequest({
        method: 'POST',
        url: mockUrl,
        data: mockData,
        headers: mockHeaders,
        params: mockParams,
      });
      
      expect(axios).toHaveBeenCalledWith({
        method: 'POST',
        url: mockUrl,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token123',
        },
        params: mockParams,
        data: mockData,
      });
      
      expect(result).toEqual({
        data: mockResponseData,
      });
    });
    
    it('should handle axios errors with response data correctly', async () => {
      const mockError = {
        code: 'ERR_BAD_REQUEST',
        message: 'Request failed with status code 400',
        response: {
          status: 400,
          data: { error: 'Bad request' },
        },
      };
      
      (axios as jest.MockedFunction<typeof axios>).mockRejectedValueOnce(mockError);
      
      const result = await apiRequest({
        method: 'GET',
        url: mockUrl,
      });
      
      expect(result).toEqual({
        error: {
          code: 'ERR_BAD_REQUEST',
          message: 'Request failed with status code 400',
          status: 400,
          data: { error: 'Bad request' },
        },
      });
    });
    
    it('should handle axios errors without response data correctly', async () => {
      const mockError = {
        code: 'ECONNREFUSED',
        message: 'Connection refused',
      };
      
      (axios as jest.MockedFunction<typeof axios>).mockRejectedValueOnce(mockError);
      
      const result = await apiRequest({
        method: 'GET',
        url: mockUrl,
      });
      
      expect(result).toEqual({
        error: {
          code: 'ECONNREFUSED',
          message: 'Connection refused',
          status: null,
          data: null,
        },
      });
    });
    
    it('should handle unknown errors correctly', async () => {
      const unknownError = new Error('Unknown error');
      
      (axios as jest.MockedFunction<typeof axios>).mockRejectedValueOnce(unknownError);
      
      const result = await apiRequest({
        method: 'GET',
        url: mockUrl,
      });
      
      expect(result).toEqual({
        error: {
          code: 'unknown-error',
          message: 'Unknown error',
          status: null, 
          data: null,
        },
      });
    });
  });
});