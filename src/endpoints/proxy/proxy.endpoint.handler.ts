import { FastifyRequest, FastifyReply } from 'fastify';

import { INTERNAL_ERROR_MESSAGE } from '../../constants/endpoints.constants';
import { SiiSimpleApiService } from '../../services/sii-simple-api';
import { MakeRequestError, ProxyService } from '../../services/proxy';
import { BAD_REQUEST_RESPONSES, HEADERS_TO_REMOVE, LOG_IDS, STEP_LABELS } from './proxy.endpoint.constants';
import { RequestLogger } from '../../utils/request-logger/request-logger.class';

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

  const errorCode = '01';
  const proxySvc = supportedProxies[destinationProxy]();
  try {
    logger.startStep(STEP_LABELS.PROXY_REQUEST);
    const result = await proxySvc.makeRequest({
      method: method as string,
      path: path.replace(destinationProxy, ''),
      payload: body,
      headers: _removeUnnecessaryHeaders(headers as Record<string, string>)
    }, { logger });
    logger.endStep(STEP_LABELS.PROXY_REQUEST);
    return reply.code(200).send(result);
  } catch (error) {
    logger.endStep(STEP_LABELS.PROXY_REQUEST);
    if (error instanceof MakeRequestError && error.status) {
      return reply.code(error.status).send({ code: error.code, message: error.message });
    }
    logger.error({
      logId: LOG_IDS.UNKNOWN_ERROR,
      errorCode,
      error,
      step: logger.currentStep
    }, `Unknown error in step ${logger.currentStep}: ${error}`);
    return reply.code(500).send({ code: errorCode, message: INTERNAL_ERROR_MESSAGE });
  }
}

function _removeUnnecessaryHeaders(headers: Record<string, string>): Record<string, string> {
  const modifiedHeaders = { ...headers };
  for (const header of HEADERS_TO_REMOVE) {
    delete modifiedHeaders[header];
  }
  return modifiedHeaders;
}