import { FastifyRequest, FastifyReply } from 'fastify';

import { SiiSimpleApiService } from '../../services/sii-simple-api';
import { MakeRequestError, ProxyService } from '../../services/proxy';
import { RequestLogger } from '../../utils/request-logger/request-logger.class';
import { BAD_REQUEST_RESPONSES, HEADERS_TO_REMOVE, STEPS } from './proxy.endpoint.constants';

const supportedProxies: {[proxy: string]: () => ProxyService } = {
  'sii-simple-api': () => SiiSimpleApiService.getInstance(),
};

export const proxyHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => { 
  const { method, body, params, headers } = request;

  const logger = request.log.child({ handler: proxyHandler.name }) as RequestLogger;

  if (method === 'OPTIONS') {
    return reply.code(200).send();
  }

  const path = (params as any)['*'];
  const destinationProxy = path.split('/')[0];
  if (!supportedProxies[destinationProxy]) {
    return reply.code(400).send(BAD_REQUEST_RESPONSES.unsupported);
  }

  const proxySvc = supportedProxies[destinationProxy]();
  try {
    logger.startStep(STEPS.PROXY_REQUEST.id, STEPS.PROXY_REQUEST.obfuscatedId);
    const result = await proxySvc.makeRequest({
      method: method as string,
      path: path.replace(destinationProxy, ''),
      payload: body,
      headers: _removeUnnecessaryHeaders(headers as Record<string, string>)
    }, { logger });
    logger.endStep(STEPS.PROXY_REQUEST.id);
    return reply.code(200).send(result);
  } catch (error) {
    logger.endStep(STEPS.PROXY_REQUEST.id);
    if (error instanceof MakeRequestError && error.status) {
      return reply.code(error.status).send({ code: error.code, message: error.message });
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