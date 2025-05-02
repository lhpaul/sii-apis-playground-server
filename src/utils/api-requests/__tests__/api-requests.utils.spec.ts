import axios from 'axios';
import { IProcessLogger } from '../../../interfaces/logging.interfaces';
import { maskFields } from '../../mask/mask.utils';
import { apiRequest } from '../api-requests.utils';
import { LOG_IDS } from '../api-requests.constants';

jest.mock('../../mask/mask.utils');
jest.mock('axios');

describe('API Request Utils', () => {
  const mockUrl = 'https://test-api.example.com/endpoint';
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
  } as unknown as IProcessLogger;

  const maskFieldsMockImplementation =  (_: any) => ({ sensitiveField: '****' });
  
  beforeEach(() => {
    jest.clearAllMocks();
    (maskFields as jest.Mock).mockImplementation(maskFieldsMockImplementation);
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
        headers: undefined,
        params: undefined,
        data: undefined,
      });
      
      expect(result).toEqual({
        status: 200,
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
        payload: mockData,
        headers: mockHeaders,
        params: mockParams,
      });
      
      expect(axios).toHaveBeenCalledWith({
        method: 'POST',
        url: mockUrl,
        headers: {
          'Authorization': 'Bearer token123',
        },
        params: mockParams,
        data: mockData,
      });
      
      expect(result).toEqual({
        status: 200,
        data: mockResponseData,
      });
    });

    it('should use the logger when provided', async () => {
      (axios as jest.MockedFunction<typeof axios>).mockResolvedValueOnce({
        data: { id: 1, name: 'Test Data' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });
      
      await apiRequest({
        method: 'GET',
        url: mockUrl,
      }, { logger: mockLogger });
      
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should call the logger specifying the mask options', async () => {
      
      const maskOptions = {
        requestHeaders: ['Authorization'],
        params: ['filter'],
        requestPayloadFields: ['field'],
        responseHeaders: ['session'],
        responsePayloadFields: ['id'],
      };
      
      const mockApiResponse = {
        data: { id: 1, name: 'Test Data' },
        status: 200,
        statusText: 'OK',
        headers: { session: 'session' },
        config: {} as any,
      };
      (axios as jest.MockedFunction<typeof axios>).mockResolvedValueOnce(mockApiResponse);
      const values = {
        method: 'GET',
        url: mockUrl,
        headers: { Authorization: 'Bearer something' },
        params: { filter: 'test' },
        data: { field: 'value' },
      };
      await apiRequest(values, { logger: mockLogger, maskOptions });
      
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenNthCalledWith(1,
        LOG_IDS.API_REQUEST_START,
        expect.objectContaining({
          method: 'GET',
          url: mockUrl,
          headers: maskFieldsMockImplementation(values.headers),
          params: maskFieldsMockImplementation(values.params),
          payload: maskFieldsMockImplementation(values.data),
        }),
        expect.stringContaining(`Making GET HTTP request to ${mockUrl}`)
      );
      expect(mockLogger.info).toHaveBeenNthCalledWith(2,
        LOG_IDS.API_REQUEST_SUCCESS,
        expect.objectContaining({
          method: 'GET',
          url: mockUrl,
          requestHeaders: maskFieldsMockImplementation(values.headers),
          params: maskFieldsMockImplementation(values.params),
          requestPayload: maskFieldsMockImplementation(values.data),
          responseHeaders: maskFieldsMockImplementation(mockApiResponse.headers),
          responsePayload: maskFieldsMockImplementation(mockApiResponse.data)
          
        }),
        expect.stringContaining(`HTTP request to ${mockUrl} responded successfully with status ${mockApiResponse.status}`)
      );
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
        status: 400,
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
        status: -1,
        error: {
          code: 'ECONNREFUSED',
          message: 'Connection refused',
          status: null,
          data: null,
        },
      });
    });

    it('should mask the values when logging an error', async () =>{
      const maskOptions = {
        requestHeaders: ['Authorization'],
        params: ['filter'],
        requestPayloadFields: ['field'],
        responseHeaders: ['session'],
        responsePayloadFields: ['id'],
      };

      const mockError = {
        code: 'ERR_BAD_REQUEST',
        message: 'Request failed with status code 400',
        response: {
          status: 400,
          data: { error: 'Bad request' },
        },
      };
      
      (axios as jest.MockedFunction<typeof axios>).mockRejectedValueOnce(mockError);

      const values = {
        method: 'GET',
        url: mockUrl,
        headers: { Authorization: 'Bearer something' },
        params: { filter: 'test' },
        data: { field: 'value' },
      };
      
      await apiRequest(values, { logger: mockLogger, maskOptions });

      expect(mockLogger.error).toHaveBeenLastCalledWith(
        LOG_IDS.API_REQUEST_ERROR,
        expect.objectContaining({
          method: 'GET',
          url: mockUrl,
          requestHeaders: maskFieldsMockImplementation(values.headers),
          params: maskFieldsMockImplementation(values.params),
          requestPayload: maskFieldsMockImplementation(values.data),
          error: {
            message: mockError.message,
            code: mockError.code,
            status: mockError.response.status,
            data: mockError.response.data,
          }
        }),
        expect.stringContaining(`HTTP GET request to ${mockUrl} failed with error: ${mockError.message}`)
      );
    });
    
    it('should handle unknown errors correctly', async () => {
      const unknownError = new Error('Unknown error');
      
      (axios as jest.MockedFunction<typeof axios>).mockRejectedValueOnce(unknownError);
      
      const result = await apiRequest({
        method: 'GET',
        url: mockUrl,
      });
      
      expect(result).toEqual({
        status: -1,
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