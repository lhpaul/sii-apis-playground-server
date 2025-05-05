import { RouteOptions } from 'fastify';

import { MASK_OPTIONS as SII_SIMPLE_API_MASK_OPTIONS } from '../../services/sii-simple-api/sii-simple-api.service.constants';
import { createEndpoint } from '../../utils/endpoints/endpoints.utils';
import { proxyHandler } from './proxy.endpoint.handler';

export const proxyEndpoint: RouteOptions = createEndpoint({
  method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  url: '/proxy/*',
  handler: proxyHandler,
}, {
  maskOptions: {
    ...SII_SIMPLE_API_MASK_OPTIONS
  }
});
