import { FastifyInstance, RouteOptions } from 'fastify';

import { proxyEndpointsBuilder } from './endpoints/proxy/proxy.endpoint';

export const routesBuilder = (server: FastifyInstance): RouteOptions[] => {
  return [
    ...proxyEndpointsBuilder(server),
  ];
};

