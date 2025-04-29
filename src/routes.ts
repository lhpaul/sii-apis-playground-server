import { ServerRoute } from '@hapi/hapi';
import { proxyEndpoint } from './endpoints/proxy/proxy.endpoint';

export const routes: ServerRoute[] = [
  proxyEndpoint,
];