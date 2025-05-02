import { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi';

import { INTERNAL_ERROR_MESSAGE } from '../../constants/endpoints.constants';
import { IProcessLogger } from '../../interfaces/logging.interfaces';
import { SiiSimpleApiService } from '../../services/sii-simple-api';
import { MakeRequestError, ProxyService } from '../../services/proxy';
import { BAD_REQUEST_RESPONSES, HEADERS_TO_REMOVE, LOG_IDS, STEP_LABELS } from './proxy.endpoint.constants';

const supportedProxies: {[proxy: string]: () => ProxyService } = {
  'sii-simple-api': () => SiiSimpleApiService.getInstance(),
};
export const proxyHandler = async (request: Request, response: ResponseToolkit, _: Error | undefined, logger: IProcessLogger): Promise<ResponseObject> => {
  const { method, payload, params, headers } = request;

  if (method === 'options') {
    return response.response().code(200);
  }

  const destinationProxy = params.path.split('/')[0];
  if (!supportedProxies[destinationProxy]) {
    return response.response(BAD_REQUEST_RESPONSES.unsupported).code(400);
  }
  const errorCode = '01';
  const proxySvc = supportedProxies[destinationProxy]();
  try {
    logger.startStep(STEP_LABELS.PROXY_REQUEST);
    const result = await proxySvc.makeRequest({
      method,
      path: params.path.replace(destinationProxy, ''),
      payload,
      headers: _removeUnnecessaryHeaders(headers)
    }, { logger });
    logger.endStep(STEP_LABELS.PROXY_REQUEST);
    return response.response(result).code(200);
  } catch (error) {
    logger.endStep(STEP_LABELS.PROXY_REQUEST);
    if (error instanceof MakeRequestError && error.status) {
      return response.response({ code: error.code, message: error.message }).code(error.status);
    }
    logger.error(LOG_IDS.UNKNOWN_ERROR, {
      errorCode,
      error,
    }, `Unknown error: ${error}`);
    return response.response({ code: errorCode, message: INTERNAL_ERROR_MESSAGE }).code(500);
  }
}

function _removeUnnecessaryHeaders(headers: any): any {
  const modifiedHeaders = { ...headers };
  for (const header of HEADERS_TO_REMOVE) {
    delete modifiedHeaders[header];
  }
  return modifiedHeaders;
}