import { ServerRoute } from '@hapi/hapi';
import { proxyHandler } from './proxy.endpoint.handler';

export const proxyEndpoint: ServerRoute = {
  method: '*',
  path: '/proxy/{path*}',
  handler: proxyHandler,
};
