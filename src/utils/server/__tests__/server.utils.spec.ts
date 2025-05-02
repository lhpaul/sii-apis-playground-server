import { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi';
import { logOnRequest, logOnPreHandler, logOnPreResponse } from '../server.utils';
import { maskFields } from '../../mask/mask.utils';
import { ILogger } from '../../../interfaces/logging.interfaces';
import { LOG_IDS } from '../server.utils.constants';

jest.mock('../../mask/mask.utils');

describe('Server Utils', () => {
  let mockRequest: Partial<Request>;
  let mockResponseToolkit: Partial<ResponseToolkit>;
  let mockResponseObject: Partial<ResponseObject>;

  const maskFieldsMockImplementation =  (_: any) => ({ sensitiveField: '****' });

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      logger: {
        info: jest.fn(),
        error: jest.fn(),
      } as any,
      method: 'get',
      path: '/test-path',
      route: {
        path: '/test-path',
        settings: {
          bind: {
            maskOptions: {
              requestPayloadFields: ['sensitiveField'],
              requestHeaders: ['authorization'],
              responseHeaders: ['authorization']
            }
          },
        },
      } as any,
      params: { id: '123' },
      query: { search: 'test' },
      payload: { sensitiveField: 'secret', otherField: 'value' },
      headers: { authorization: 'Bearer token', otherHeader: 'value' },
      info: {
        responded: 200,
        received: 100,
      } as any,
    };

    mockResponseToolkit = {
      continue: Symbol('continue'),
    };

    mockResponseObject = {
      statusCode: 200,
      source: { sensitiveField: 'secret', otherField: 'value' },
    };

    (maskFields as jest.Mock).mockImplementation(maskFieldsMockImplementation);
  });

  describe(logOnRequest.name, () => {
    it('should log the on-request event and return h.continue', () => {
      const result = logOnRequest(mockRequest as Request, mockResponseToolkit as ResponseToolkit);
      expect((mockRequest.logger as ILogger).info).toHaveBeenCalledWith({
          id: LOG_IDS.ON_REQUEST,
          data: {
            method: 'get',
            path: '/test-path',
          },
        },
        'On Request event: GET /test-path'
      );
      expect(result).toBe(mockResponseToolkit.continue);
    });
  });

  describe(logOnPreHandler.name, () => {
    describe('when there is no maskRequest configuration set.', () => {
      beforeEach(() => {
        (mockRequest.route as any).settings.bind = undefined;
      });

      it('should log the on-pre-handler event and return h.continue', () => {
        const result = logOnPreHandler(mockRequest as Request, mockResponseToolkit as ResponseToolkit);
        expect((mockRequest.logger as ILogger).info).toHaveBeenCalledWith(
          {
            id: LOG_IDS.ON_PRE_HANDLER,
            data: {
              method: 'get',
              path: '/test-path',
              params: maskFieldsMockImplementation(mockRequest.params),
              query: maskFieldsMockImplementation(mockRequest.query),
              payload: maskFieldsMockImplementation(mockRequest.payload),
              headers: maskFieldsMockImplementation(mockRequest.headers),
            }
          },
          'onPreHandler event: /test-path'
        );
        expect(result).toBe(mockResponseToolkit.continue);
      });
    });
    describe('when there is a maskRequest configuration set.', () => {
      beforeEach(() => {
        (mockRequest.route as any).settings.bind.maskRequest = {
          payload: ['sensitiveField'],
          headers: ['authorization'],
        };
      });

      it('should log the on-pre-handler event and return h.continue', () => {
        const result = logOnPreHandler(mockRequest as Request, mockResponseToolkit as ResponseToolkit);
        expect((mockRequest.logger as ILogger).info).toHaveBeenCalledWith(
          {
            id: LOG_IDS.ON_PRE_HANDLER,
            data: {
              method: 'get',
              path: '/test-path',
              params: maskFieldsMockImplementation(mockRequest.params),
              query: maskFieldsMockImplementation(mockRequest.query),
              payload: maskFieldsMockImplementation(mockRequest.payload),
              headers: maskFieldsMockImplementation(mockRequest.headers),
            }
          },
          'onPreHandler event: /test-path'
        );
        expect(result).toBe(mockResponseToolkit.continue);
      });
    });
  });

  describe(logOnPreResponse.name, () => {
    beforeAll(() => {
      // this is so new Date().getTime responds with a fixe time so we can know which will be the response time
      jest.useFakeTimers().setSystemTime(new Date(200));
    });
    
    afterAll(() => {
        jest.useRealTimers();
    });
    beforeEach(() => {
      (mockRequest as any).response = mockResponseObject;
    });
    describe('when there is no maskResponse configuration set.', () => {
      beforeEach(() => {
        (mockRequest.route as any).settings.bind = undefined;
      });

      it('should log the on-pre-response event and return h.continue', () => {
        const result = logOnPreResponse(mockRequest as Request, mockResponseToolkit as ResponseToolkit);
        expect((mockRequest.logger as ILogger).info).toHaveBeenCalledWith(
          {
            id: LOG_IDS.ON_PRE_RESPONSE,
            data: {
              responseTime: 100,
              statusCode: 200,
              responseHeaders: maskFieldsMockImplementation(mockResponseObject.headers),
              responsePayload: maskFieldsMockImplementation(mockResponseObject.source),
            }
          },
          'onPreResponse event: statusCode: 200 responseTime: 100ms'
        );
        expect(result).toBe(mockResponseToolkit.continue);
      });
    });
    describe('when there is a maskResponse configuration set.', () => {
      beforeEach(() => {
        (mockRequest.route as any).settings.bind.maskResponse = {
          payload: ['sensitiveField'],
        };
      });

      it('should log the on-pre-response event and return h.continue', () => {
        const result = logOnPreResponse(mockRequest as Request, mockResponseToolkit as ResponseToolkit);
        expect((mockRequest.logger as ILogger).info).toHaveBeenCalledWith(
          {
            id: LOG_IDS.ON_PRE_RESPONSE,
            data: {
              responseTime: 100,
              statusCode: 200,
              responseHeaders: maskFieldsMockImplementation(mockResponseObject.headers),
              responsePayload: maskFieldsMockImplementation(mockResponseObject.source),
            }
          },
          'onPreResponse event: statusCode: 200 responseTime: 100ms'
        );
        expect(result).toBe(mockResponseToolkit.continue);
      });
    });

    it('should log an error if an error is passed and return h.continue', () => {
      const error = new Error('Test error');

      const result = logOnPreResponse(mockRequest as Request, mockResponseToolkit as ResponseToolkit, error);

      expect((mockRequest.logger as ILogger).error).toHaveBeenCalledWith(
        {
          id: LOG_IDS.ON_PRE_RESPONSE_ERROR,
          data: {
            error
          },
        },
        'Error in onPreResponse: Test error'
      );
      expect(result).toBe(mockResponseToolkit.continue);
    });
  });
});