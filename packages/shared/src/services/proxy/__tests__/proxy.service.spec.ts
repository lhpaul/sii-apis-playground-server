import { ProxyService } from '../proxy.service';
import { apiRequest } from '../../../utils/api-requests/api-requests.utils';
import { MakeRequestError, MakeProxyRequestErrorCode } from '../proxy.service.errors';
import { IProxyApiConfig } from '../proxy.service.interfaces';
import { ExecutionLogger } from '../../../definitions';

jest.mock('../../../utils/api-requests/api-requests.utils');

describe(ProxyService.name, () => {
  const mockConfig: IProxyApiConfig = {
    baseUrl: 'https://api.example.com',
    defaultHeaders: { 'Content-Type': 'application/json' },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe(ProxyService.prototype.makeRequest.name, () => {
    const testPath = '/test-path/something';
    const testData = { key: 'value' };
    const customHeaders = { authorization: 'Bearer token' };
    const mockResponse = { data: { success: true } };
    const mockError = {
      message: 'Request failed',
      data: { error: 'Internal Server Error' },
      status: 500,
    };
    const mockLogger = {
      lastStep: { id: '1' },
      stepsCounter: 0,
      initTime: 0,
      startStep: jest.fn(),
      endStep: jest.fn(),
    } as unknown as ExecutionLogger;
    let proxyService: ProxyService;

    beforeAll(() => {
      proxyService = new ProxyService(mockConfig);
    });
    describe('when sending a request with no data', () => {
      const testMethod = 'GET';
      it('should make a successful request and return the response data', async () => {
        (apiRequest as jest.Mock).mockResolvedValue({ status: 200, data: mockResponse, error: null });
        const response = await proxyService.makeRequest({
          method: testMethod,
          path: testPath,
        }, mockLogger);
        expect(apiRequest).toHaveBeenCalledWith({
          method: testMethod,
          url: `${mockConfig.baseUrl}${testPath}`,
          payload: undefined,
          headers: mockConfig.defaultHeaders,
        }, undefined);
        expect(response).toEqual(mockResponse);
      });
      it('should throw a MakeRequestError if the request fails', async () => {
        (apiRequest as jest.Mock).mockResolvedValue({ data: null, error: mockError });
        try {
          await proxyService.makeRequest({
            method: testMethod,
            path: testPath,
          }, mockLogger);
          expect(true).toBeFalsy(); // This line should not be reached
        } catch (error: any) {
          expect(error).toBeInstanceOf(MakeRequestError);
          expect(error.message).toBe(mockError.message);
          expect(error.code).toBe(MakeProxyRequestErrorCode.UNKNOWN_ERROR);
          expect(error.data).toEqual(mockError.data);
          expect(error.status).toBe(mockError.status);
        }
        // Check that the apiRequest function was called with the correct parameters
        expect(apiRequest).toHaveBeenCalledWith({
          method: testMethod,
          url: `${mockConfig.baseUrl}${testPath}`,
          payload: undefined,
          headers: mockConfig.defaultHeaders,
        }, undefined);
      });
    });
    describe('when sending a request with data', () => {
      const testMethod = 'POST';
      it('should make a successful request and return the response data', async () => {
        (apiRequest as jest.Mock).mockResolvedValue({ data: mockResponse, error: null });

        const response = await proxyService.makeRequest({
          method: testMethod,
          path: testPath,
          payload: testData,
        }, mockLogger);
        expect(apiRequest).toHaveBeenCalledWith({
          method: testMethod,
          url: `${mockConfig.baseUrl}${testPath}`,
          payload: testData,
          headers: mockConfig.defaultHeaders,
        }, undefined);
        expect(response).toEqual(mockResponse);
      });

      it('should throw a MakeRequestError if the request fails', async () => {
        (apiRequest as jest.Mock).mockResolvedValue({ data: null, error: mockError });
        try {
          await proxyService.makeRequest({
            method: testMethod,
            path: testPath,
            payload: testData,
          }, mockLogger);
          expect(true).toBeFalsy(); // This line should not be reached
        } catch (error: any) {
          expect(error).toBeInstanceOf(MakeRequestError);
          expect(error.message).toBe(mockError.message);
          expect(error.code).toBe(MakeProxyRequestErrorCode.UNKNOWN_ERROR);
          expect(error.data).toEqual(mockError.data);
          expect(error.status).toBe(mockError.status);
        }
        // Check that the apiRequest function was called with the correct parameters
        expect(apiRequest).toHaveBeenCalledWith({
          method: testMethod,
          url: `${mockConfig.baseUrl}${testPath}`,
          payload: testData,
          headers: mockConfig.defaultHeaders,
        }, undefined);
      });
    });
    describe('when sending a request with custom headers', () => {
      const testMethod = 'POST';
      it('should include custom headers in the request', async () => {
        (apiRequest as jest.Mock).mockResolvedValue({ data: mockResponse, error: null });

        const response = await proxyService.makeRequest({
          method: testMethod,
          path: testPath,
          payload: testData,
          headers: customHeaders,
        }, mockLogger);
        expect(apiRequest).toHaveBeenCalledWith({
          method: testMethod,
          url: `${mockConfig.baseUrl}${testPath}`,
          payload: testData,
          headers: {
            ...mockConfig.defaultHeaders,
            ...customHeaders,
          },
        }, undefined);
        expect(response).toEqual(mockResponse);
      });
      it('should throw a MakeRequestError if the request fails', async () => {
        (apiRequest as jest.Mock).mockResolvedValue({ data: null, error: mockError });
        try {
          await proxyService.makeRequest({
            method: testMethod,
            path: testPath,
            payload: testData,
            headers: customHeaders,
          }, mockLogger);
          expect(true).toBeFalsy(); // This line should not be reached
        } catch (error: any) {
          expect(error).toBeInstanceOf(MakeRequestError);
          expect(error.message).toBe(mockError.message);
          expect(error.code).toBe(MakeProxyRequestErrorCode.UNKNOWN_ERROR);
          expect(error.data).toEqual(mockError.data);
          expect(error.status).toBe(mockError.status);
        }
        // Check that the apiRequest function was called with the correct parameters
        expect(apiRequest).toHaveBeenCalledWith({
          method: testMethod,
          url: `${mockConfig.baseUrl}${testPath}`,
          payload: testData,
          headers: {
            ...mockConfig.defaultHeaders,
            ...customHeaders,
          },
        }, undefined);
      });
    });
  });
});