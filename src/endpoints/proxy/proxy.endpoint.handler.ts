import { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi';

import { INTERNAL_ERROR_MESSAGE } from '../../constants/endpoints.constants';
import { SiiSimpleApiService } from '../../services/sii-simple-api';
import { MakeRequestError, ProxyService } from '../../services/proxy';
import { BAD_REQUEST_RESPONSES } from './proxy.endpoint.constants';

const supportedProxies: {[proxy: string]: () => ProxyService } = {
  'sii-simple-api': () => SiiSimpleApiService.getInstance(),
};
export const proxyHandler = async (request: Request, response: ResponseToolkit): Promise<ResponseObject> => {
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
    const result = await proxySvc.makeRequest(method, params.path.replace(destinationProxy, ''), payload, headers);
    return response.response(result).code(200);
  } catch (error) {
    if (error instanceof MakeRequestError) {
      if (error.status) {
        return response.response({ code: error.code, message: error.message }).code(error.status);
      }
    }
    return response.response({ code: errorCode, message: INTERNAL_ERROR_MESSAGE }).code(500);
  }
}