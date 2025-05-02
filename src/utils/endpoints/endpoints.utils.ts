import { ServerRoute } from '@hapi/hapi';
import { IEndpointOptions } from './endpoints.utils.interfaces';
import { RequestLogger } from '../request-logger/request-logger.class';

export function createEndpoint(values: ServerRoute, options?: IEndpointOptions): ServerRoute {
  return {
    ...values,
    ...(values.handler && {
      handler: (request, response, err) => {
        const logger = new RequestLogger({ request });
        return (values.handler as any)(request, response, err, logger);
      }
    }),
    options: {
      ...values.options,
      bind: {
        ...values.options?.bind,
        ...options
      }
    }
  }
}
