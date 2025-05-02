import { ServerRoute } from '@hapi/hapi';
import { proxyHandler } from './proxy.endpoint.handler';
import { MASK_OPTIONS as SII_SIMPLE_API_MASK_OPTIONS } from '../../services/sii-simple-api/sii-simple-api.service.constants';
import { createEndpoint } from '../../utils/endpoints/endpoints.utils';

export const proxyEndpoint: ServerRoute = createEndpoint({
  method: '*',
  path: '/proxy/{path*}',
  handler: proxyHandler,
}, {
  maskOptions: {
    ...SII_SIMPLE_API_MASK_OPTIONS
  }
});
