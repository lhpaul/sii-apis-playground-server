import axios, { AxiosStatic } from 'axios';
import { apiRequest } from '../api-requests.utils';
import { LOG_IDS } from '../api-requests.constants';
import { maskFields } from '../../mask/mask.utils';
import { processLoggerMock } from '../../mocks/process-logger.mocks';
import { IApiRequestValues, IRequestOptions } from '../api-requests.utils.interfaces';
import { IProcessLogger } from '../../../definitions/logging.interfaces';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<AxiosStatic>;

// Mock the maskFields utility
jest.mock('../../mask/mask.utils', () => ({
  maskFields: jest.fn().mockImplementation((obj: Record<string, any>, _fields: string[]) => obj)
}));

// Mock the processLoggerMock
jest.mock('../../mocks/process-logger.mocks', () => ({
  processLoggerMock: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    fatal: jest.fn(),
    trace: jest.fn(),
    silent: jest.fn(),
    currentStep: '',
    level: 'info',
    initTime: 0,
    metadata: {},
    startStep: jest.fn(),
    endStep: jest.fn(),
    getStepElapsedTime: jest.fn(),
    getTotalElapsedTime: jest.fn()
  }
}));

describe(apiRequest.name, () => {
  let mockLogger: jest.Mocked<IProcessLogger>;
  const baseRequestValues: IApiRequestValues = {
    method: 'GET',
    url: 'https://api.example.com/test',
    headers: { 'Authorization': 'Bearer token' },
    params: { id: '123' },
    payload: { data: 'test' }
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      fatal: jest.fn(),
      trace: jest.fn(),
      silent: jest.fn(),
      currentStep: '',
      level: 'info',
      initTime: 0,
      metadata: {},
      startStep: jest.fn(),
      endStep: jest.fn(),
      getStepElapsedTime: jest.fn(),
      getTotalElapsedTime: jest.fn()
    } as unknown as jest.Mocked<IProcessLogger>;
  });

  describe('Successful requests', () => {
    it('should make a successful API request and log the response', async () => {
      // Setup mock response
      const mockResponse = {
        status: 200,
        headers: { 'content-type': 'application/json' },
        data: { result: 'success' }
      };
      (mockedAxios as unknown as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Make the request
      const result = await apiRequest(baseRequestValues);

      // Verify axios was called with correct config
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.example.com/test',
        headers: { 'Authorization': 'Bearer token' },
        params: { id: '123' },
        data: { data: 'test' }
      });

      // Verify success logging
      expect(processLoggerMock.info).toHaveBeenCalledWith(
        expect.objectContaining({
          logId: LOG_IDS.API_REQUEST_START,
          data: {
            method: 'GET',
            url: 'https://api.example.com/test',
            headers: baseRequestValues.headers,
            params: baseRequestValues.params,
            payload: baseRequestValues.payload
          }
        }),
        'Making GET HTTP request to https://api.example.com/test'
      );

      expect(processLoggerMock.info).toHaveBeenCalledWith(
        expect.objectContaining({
          logId: LOG_IDS.API_REQUEST_SUCCESS,
          data: {
            method: 'GET',
            url: 'https://api.example.com/test',
            requestHeaders: baseRequestValues.headers,
            params: baseRequestValues.params,
            requestPayload: baseRequestValues.payload,
            responseHeaders: mockResponse.headers,
            responsePayload: mockResponse.data
          }
        }),
        'HTTP request to https://api.example.com/test responded successfully with status 200'
      );

      // Verify result
      expect(result).toEqual({
        status: 200,
        data: { result: 'success' }
      });
    });

    it('should use custom logger when provided', async () => {
      const mockResponse = {
        status: 200,
        headers: {},
        data: {}
      };
      (mockedAxios as unknown as jest.Mock).mockResolvedValueOnce(mockResponse);

      const options: IRequestOptions = {
        logger: mockLogger
      };

      await apiRequest(baseRequestValues, options);

      expect(mockLogger.info).toHaveBeenCalled();
      expect(processLoggerMock.info).not.toHaveBeenCalled();
    });

    it('should mask sensitive data according to mask options', async () => {
      const mockResponse = {
        status: 200,
        headers: { 'content-type': 'application/json' },
        data: { result: 'success' }
      };
      (mockedAxios as unknown as jest.Mock).mockResolvedValueOnce(mockResponse);

      const options: IRequestOptions = {
        maskOptions: {
          requestHeaders: ['Authorization'],
          params: ['id'],
          requestPayloadFields: ['data'],
          responseHeaders: ['content-type'],
          responsePayloadFields: ['result']
        }
      };

      await apiRequest(baseRequestValues, options);

      const maskOptions = options.maskOptions!;
      expect(maskFields).toHaveBeenCalledWith(baseRequestValues.headers, maskOptions.requestHeaders);
      expect(maskFields).toHaveBeenCalledWith(baseRequestValues.params, maskOptions.params);
      expect(maskFields).toHaveBeenCalledWith(baseRequestValues.payload, maskOptions.requestPayloadFields);
      expect(maskFields).toHaveBeenCalledWith(mockResponse.headers, maskOptions.responseHeaders);
      expect(maskFields).toHaveBeenCalledWith(mockResponse.data, maskOptions.responsePayloadFields);
    });
  });

  describe('Failed requests', () => {
    it('should handle AxiosError and return error response', async () => {
      const mockError = {
        isAxiosError: true,
        message: 'Request failed',
        code: 'ECONNREFUSED',
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      };
      (mockedAxios as unknown as jest.Mock).mockRejectedValueOnce(mockError);

      const result = await apiRequest(baseRequestValues);

      expect(processLoggerMock.error).toHaveBeenCalledWith(
        expect.objectContaining({
          logId: LOG_IDS.API_REQUEST_ERROR,
          data: {
            method: 'GET',
            url: 'https://api.example.com/test',
            requestHeaders: baseRequestValues.headers,
            params: baseRequestValues.params,
            requestPayload: baseRequestValues.payload,
            error: {
              message: 'Request failed',
              code: 'ECONNREFUSED',
              status: 500,
              data: { error: 'Internal Server Error' }
            }
          }
        }),
        'HTTP GET request to https://api.example.com/test failed with error: Request failed'
      );

      expect(result).toEqual({
        status: 500,
        error: {
          code: 'ECONNREFUSED',
          message: 'Request failed',
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      });
    });

    it('should handle AxiosError without response', async () => {
      const mockError = {
        isAxiosError: true,
        message: 'Network Error',
        code: 'ERR_NETWORK'
      };
      (mockedAxios as unknown as jest.Mock).mockRejectedValueOnce(mockError);

      const result = await apiRequest(baseRequestValues);

      expect(processLoggerMock.error).toHaveBeenCalledWith(
        expect.objectContaining({
          logId: LOG_IDS.API_REQUEST_ERROR,
          data: {
            method: 'GET',
            url: 'https://api.example.com/test',
            requestHeaders: baseRequestValues.headers,
            params: baseRequestValues.params,
            requestPayload: baseRequestValues.payload,
            error: {
              message: 'Network Error',
              code: 'ERR_NETWORK',
              status: null,
              data: null
            }
          }
        }),
        'HTTP GET request to https://api.example.com/test failed with error: Network Error'
      );

      expect(result).toEqual({
        status: -1,
        error: {
          code: 'ERR_NETWORK',
          message: 'Network Error',
          status: null,
          data: null
        }
      });
    });

    it('should handle non-AxiosError', async () => {
      const mockError = new Error('Unexpected error');
      (mockedAxios as unknown as jest.Mock).mockRejectedValueOnce(mockError);

      const result = await apiRequest(baseRequestValues);

      expect(processLoggerMock.error).toHaveBeenCalledWith(
        expect.objectContaining({
          logId: LOG_IDS.API_REQUEST_ERROR,
          data: {
            method: 'GET',
            url: 'https://api.example.com/test',
            requestHeaders: baseRequestValues.headers,
            params: baseRequestValues.params,
            requestPayload: baseRequestValues.payload,
            error: {
              message: 'Unexpected error',
              code: 'unknown-error',
              status: null,
              data: null
            }
          }
        }),
        'HTTP GET request to https://api.example.com/test failed with error: Unexpected error'
      );

      expect(result).toEqual({
        status: -1,
        error: {
          code: 'unknown-error',
          message: 'Unexpected error',
          status: null,
          data: null
        }
      });
    });
  });
});
