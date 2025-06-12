import { FastifyRequest, FastifyReply } from 'fastify';

import { MakeRequestError, ProxyService, SiiSimpleApiService } from '@repo/shared/services';
import { HTTP_METHODS_MAP } from '@repo/fastify';
import { BAD_REQUEST_RESPONSES, HEADERS_TO_REMOVE, STEPS } from './proxy.endpoint.constants';

const supportedProxies: {[proxy: string]: () => ProxyService } = {
  'sii-simple-api': () => SiiSimpleApiService.getInstance(),
};

export const proxyHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => { 
  const logger = request.log.child({ handler: proxyHandler.name });
  const { method, body, params, headers } = request;

  if (method === HTTP_METHODS_MAP.OPTIONS) {
    return reply.code(200).send();
  }

  const path = (params as any)['*'];
  const destinationProxy = path.split('/')[0];
  if (!supportedProxies[destinationProxy]) {
    return reply.code(400).send(BAD_REQUEST_RESPONSES.unsupported);
  }

  const proxySvc = supportedProxies[destinationProxy]();
  try {
    logger.startStep(STEPS.PROXY_REQUEST.id);
    const result = await proxySvc.makeRequest({
      method: method as string,
      path: path.replace(destinationProxy, ''),
      payload: body,
      headers: _removeUnnecessaryHeaders(headers as Record<string, string>)
    }, logger);
    logger.endStep(STEPS.PROXY_REQUEST.id);
    return reply.code(200).send(result);
  } catch (error: any) {
    logger.endStep(STEPS.PROXY_REQUEST.id);
    if (error instanceof MakeRequestError && error.status) {
      return reply.code(error.status).send({ code: error.code, message: error.message, data: error.data });
    }
    throw error;
  }
}

function _removeUnnecessaryHeaders(headers: Record<string, string>): Record<string, string> {
  const modifiedHeaders = { ...headers };
  for (const header of HEADERS_TO_REMOVE) {
    delete modifiedHeaders[header];
  }
  return modifiedHeaders;
}