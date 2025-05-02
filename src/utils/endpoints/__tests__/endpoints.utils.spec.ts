import { createEndpoint } from '../endpoints.utils';
import { ServerRoute } from '@hapi/hapi';

describe(createEndpoint.name, () => {
  it('should return a ServerRoute with merged values and options', () => {
    const values: ServerRoute = {
      method: 'GET',
      path: '/test',
      handler: jest.fn(),
      options: {
        bind: {
          key: 'value',
        },
      },
    };

    const options = {
      maskOptions: {
        requestHeaders: ['authorization']
      }
    };

    const result = createEndpoint(values, options);

    expect(result).toEqual({
      ...values,
      handler: expect.any(Function),
      options: {
        ...values.options,
        bind: {
          ...values.options?.bind,
          ...options,
        },
      },
    });
  });

  it('should wrap the handler with a logger', () => {
    const mockHandler = jest.fn();
    const values: ServerRoute = {
      method: 'POST',
      path: '/test',
      handler: mockHandler,
    };

    const result = createEndpoint(values);

    const mockRequest = {};
    const mockResponse = {};
    const mockError = null;

    (result.handler as any)(mockRequest, mockResponse, mockError);

    expect(mockHandler).toHaveBeenCalledWith(
      mockRequest,
      mockResponse,
      mockError,
      expect.any(Object) // Expecting an instance of RequestLogger
    );
  });

  it('should handle undefined options gracefully', () => {
    const values: ServerRoute = {
      method: 'GET',
      path: '/test',
      handler: jest.fn(),
    };

    const result = createEndpoint(values);

    expect(result.options).toEqual({
      bind: {},
    });
  });

  it('should handle undefined handler gracefully', () => {
    const values: ServerRoute = {
      method: 'GET',
      path: '/test',
    };

    const result = createEndpoint(values);

    expect(result.handler).toBeUndefined();
  });
});