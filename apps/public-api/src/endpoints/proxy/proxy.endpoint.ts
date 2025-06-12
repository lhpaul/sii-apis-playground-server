import { createEndpoint, HTTP_METHODS_MAP } from '@repo/fastify';
import { FastifyInstance, RouteOptions } from 'fastify';

import { SII_SIMPLE_API_MASK_OPTIONS, URL } from './proxy.endpoint.constants';
import { proxyHandler } from './proxy.endpoint.handler';


export function proxyEndpointsBuilder(server: FastifyInstance): RouteOptions[] {
  return [
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.GET, HTTP_METHODS_MAP.CREATE, HTTP_METHODS_MAP.SET, HTTP_METHODS_MAP.DELETE, HTTP_METHODS_MAP.UPDATE],
      url: URL,
      handler: proxyHandler,
    }, {
      authenticate: false,
      maskOptions: {
        ...SII_SIMPLE_API_MASK_OPTIONS,
      }
    }),
  ];
}
