import { FastifyRequest, FastifyReply, FastifyBaseLogger } from 'fastify';

import { RequestLogger } from '../../../utils/request-logger/request-logger.class';
import { MakeRequestError, ProxyService, MakeProxyRequestErrorCode } from '../../../services/proxy';
import { SiiSimpleApiService } from '../../../services/sii-simple-api';
import { BAD_REQUEST_RESPONSES, HEADERS_TO_REMOVE, STEPS } from '../proxy.endpoint.constants';
import { proxyHandler } from '../proxy.endpoint.handler';
import { IProcessStep } from '../../../definitions/logging.interfaces';

// Mock the services
jest.mock('../../../services/sii-simple-api');
jest.mock('../../../services/proxy', () => ({
  ...jest.requireActual('../../../services/proxy'),
  ProxyService: jest.fn().mockImplementation(() => ({
    makeRequest: jest.fn()
  }))
}));

describe('proxyHandler', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: Partial<RequestLogger>;
  let mockProxyService: jest.Mocked<ProxyService>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock logger
    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
      error: jest.fn(),
      lastStep: { id: '' } as IProcessStep,
      level: 'info',
      fatal: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      silent: jest.fn(),
      initTime: 0,
      getStepElapsedTime: jest.fn(),
      getTotalElapsedTime: jest.fn(),
      child: jest.fn().mockReturnThis()
    };

    // Setup mock request
    mockRequest = {
      method: 'GET',
      body: { test: 'data' },
      params: { '*': 'sii-simple-api/test' },
      headers: {
        'content-type': 'application/json',
        'host': 'localhost',
        'connection': 'keep-alive',
        'x-custom-header': 'value'
      },
      log: mockLogger as FastifyBaseLogger
    };

    // Setup mock reply
    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    // Setup mock proxy service
    mockProxyService = {
      makeRequest: jest.fn(),
      baseUrl: 'https://api.example.com'
    } as unknown as jest.Mocked<ProxyService>;

    // Mock the SiiSimpleApiService.getInstance
    (SiiSimpleApiService.getInstance as jest.Mock).mockReturnValue(mockProxyService);
  });

  it('should handle OPTIONS request', async () => {
    const request = { ...mockRequest, method: 'OPTIONS' } as FastifyRequest;

    await proxyHandler(request, mockReply as FastifyReply);

    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalled();
    expect(mockProxyService.makeRequest).not.toHaveBeenCalled();
  });

  it('should return 400 for unsupported proxy', async () => {
    const request = { ...mockRequest, params: { '*': 'unsupported-proxy/test' } } as FastifyRequest;

    await proxyHandler(request, mockReply as FastifyReply);

    expect(mockReply.code).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith(BAD_REQUEST_RESPONSES.unsupported);
    expect(mockProxyService.makeRequest).not.toHaveBeenCalled();
  });

  it('should make successful proxy request', async () => {
    const mockResponse = { data: 'success' };
    mockProxyService.makeRequest.mockResolvedValueOnce(mockResponse);

    await proxyHandler(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.PROXY_REQUEST.id, STEPS.PROXY_REQUEST.obfuscatedId);
    expect(mockProxyService.makeRequest).toHaveBeenCalledWith({
      method: 'GET',
      path: '/test',
      payload: { test: 'data' },
      headers: {
        'content-type': 'application/json',
        'connection': 'keep-alive',
        'x-custom-header': 'value'
      }
    }, { logger: mockLogger });
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.PROXY_REQUEST.id);
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith(mockResponse);
  });

  it('should handle MakeRequestError with status', async () => {
    const mockError = new MakeRequestError({
      code: MakeProxyRequestErrorCode.UNKNOWN_ERROR,
      message: 'Test error',
      status: 404
    });
    mockProxyService.makeRequest.mockRejectedValueOnce(mockError);

    await proxyHandler(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.PROXY_REQUEST.id);
    expect(mockReply.code).toHaveBeenCalledWith(mockError.status);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: MakeProxyRequestErrorCode.UNKNOWN_ERROR,
      message: mockError.message
    });
  });

  it('should throw unknown errors', async () => {
    const mockError = new Error('Unknown error');
    mockProxyService.makeRequest.mockRejectedValueOnce(mockError);

    await expect(proxyHandler(mockRequest as FastifyRequest, mockReply as FastifyReply))
      .rejects.toThrow(mockError);

    expect(mockLogger.endStep).toHaveBeenCalledWith('proxy-request');
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should remove unnecessary headers', async () => {
    const mockResponse = { data: 'success' };
    mockProxyService.makeRequest.mockResolvedValueOnce(mockResponse);

    // Add all headers that should be removed
    const request = {
      ...mockRequest,
      headers: {
        ...mockRequest.headers,
        ...HEADERS_TO_REMOVE.reduce((acc, header) => ({ ...acc, [header]: 'value' }), {})
      }
    } as FastifyRequest;

    await proxyHandler(request, mockReply as FastifyReply);

    const expectedHeaders = {
      'content-type': 'application/json',
      'connection': 'keep-alive',
      'x-custom-header': 'value'
    };

    expect(mockProxyService.makeRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expectedHeaders
      }),
      expect.any(Object)
    );
  });
});
