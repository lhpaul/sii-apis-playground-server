import { RouteOptions } from 'fastify';
import { proxyEndpoint } from './endpoints/proxy/proxy.endpoint';

export const routes: RouteOptions[] = [
  proxyEndpoint
];