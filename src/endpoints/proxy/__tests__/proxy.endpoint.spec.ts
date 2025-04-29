import { proxyEndpoint } from '../proxy.endpoint';
import { proxyHandler } from '../proxy.endpoint.handler';

describe('proxyEndpoint', () => {
  it('should have the correct method', () => {
    expect(proxyEndpoint.method).toBe('*');
  });

  it('should have the correct path', () => {
    expect(proxyEndpoint.path).toBe('/proxy/{path*}');
  });

  it('should have a handler defined', () => {
    expect(proxyEndpoint.handler).toBeDefined();
  });

  it('should use the correct handler function', () => {
    expect(proxyEndpoint.handler).toBe(proxyHandler);
  });
});