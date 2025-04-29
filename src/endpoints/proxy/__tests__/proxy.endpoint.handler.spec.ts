import { Request, ResponseToolkit } from '@hapi/hapi';

import { INTERNAL_ERROR_MESSAGE } from '../../../constants/endpoints.constants';
import { MakeProxyRequestErrorCode, MakeRequestError } from '../../../services/proxy';
import { SiiSimpleApiService } from '../../../services/sii-simple-api';
import { BAD_REQUEST_RESPONSES } from '../proxy.endpoint.constants';
import { proxyHandler } from '../proxy.endpoint.handler';

jest.mock('../../../services/sii-simple-api');

describe(proxyHandler.name, () => {
  let mockRequest: Partial<Request>;
  let mockResponseToolkit: Partial<ResponseToolkit>;
  let mockResponse: any;

  beforeEach(() => {
    mockResponse = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn(),
    };

    mockResponseToolkit = {
      response: jest.fn(() => mockResponse),
    };

    mockRequest = {
      method: 'get',
      params: { path: 'sii-simple-api/resource' },
      payload: undefined,
      headers: {},
    };

    jest.clearAllMocks();
  });

  describe('when the requests comes with no payload', () => {
    beforeEach(() => {
      
    });
    it('should return 200 for OPTIONS method', async () => {
      (mockRequest as any).method = 'options';
  
      await proxyHandler(mockRequest as Request, mockResponseToolkit as ResponseToolkit);
  
      expect(mockResponseToolkit.response).toHaveBeenCalled();
      expect(mockResponse.code).toHaveBeenCalledWith(200);
    });
  
    it('should return 400 for unsupported proxy', async () => {
      (mockRequest as any).params = { path: 'unsupported-proxy/resource' };
  
      await proxyHandler(mockRequest as Request, mockResponseToolkit as ResponseToolkit);
  
      expect(mockResponseToolkit.response).toHaveBeenCalledWith({
        code: BAD_REQUEST_RESPONSES.unsupported.code,
        message: BAD_REQUEST_RESPONSES.unsupported.message,
      });
      expect(mockResponse.code).toHaveBeenCalledWith(400);
    });
  
    it('should call the proxy service and return 200 on success', async () => {
      const mockMakeRequest = jest.fn().mockResolvedValue({ success: true });
      (SiiSimpleApiService.getInstance as jest.Mock).mockReturnValue({
        makeRequest: mockMakeRequest,
      });
  
      await proxyHandler(mockRequest as Request, mockResponseToolkit as ResponseToolkit);
  
      expect(mockMakeRequest).toHaveBeenCalledWith(
        mockRequest.method,
        '/resource',
        mockRequest.payload,
        mockRequest.headers
      );
      expect(mockResponseToolkit.response).toHaveBeenCalledWith({ success: true });
      expect(mockResponse.code).toHaveBeenCalledWith(200);
    });
  
    it('should return the error response from MakeRequestError with status', async () => {
      const errorMock = {
        code: MakeProxyRequestErrorCode.UNKNOWN_ERROR,
        message: 'Test error',
        status: 404,
        data: { error: 'Test error' },
      };
      const mockMakeRequest = jest.fn().mockRejectedValue(
        new MakeRequestError(errorMock)
      );
      (SiiSimpleApiService.getInstance as jest.Mock).mockReturnValue({
        makeRequest: mockMakeRequest,
      });
  
      await proxyHandler(mockRequest as Request, mockResponseToolkit as ResponseToolkit);
  
      expect(mockResponseToolkit.response).toHaveBeenCalledWith({
        code: errorMock.code,
        message: errorMock.message,
      });
      expect(mockResponse.code).toHaveBeenCalledWith(404);
    });
  
    it('should return 500 for unknown errors', async () => {
      const mockMakeRequest = jest.fn().mockRejectedValue(new Error('Unknown error'));
      (SiiSimpleApiService.getInstance as jest.Mock).mockReturnValue({
        makeRequest: mockMakeRequest,
      });
  
      await proxyHandler(mockRequest as Request, mockResponseToolkit as ResponseToolkit);
  
      expect(mockResponseToolkit.response).toHaveBeenCalledWith({
        code: '01',
        message: INTERNAL_ERROR_MESSAGE,
      });
      expect(mockResponse.code).toHaveBeenCalledWith(500);
    });
  });

});