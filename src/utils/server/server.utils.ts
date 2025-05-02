import { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi';
import { maskFields } from '../mask/mask.utils';
import { LOG_IDS } from './server.utils.constants';

export function logOnRequest(request: Request, h: ResponseToolkit): symbol {
  request.logger.info({
    id: LOG_IDS.ON_REQUEST,
    data: {
      method: request.method,
      path: request.path,
    }
  }, `On Request event: ${request.method.toUpperCase()} ${request.path}`);
  return h.continue;
}

export function logOnPreHandler(request: Request, h: ResponseToolkit): symbol {
  const maskOptions = {
    params: [],
    query: [],
    requestPayloadFields: [],
    requestHeaders: [],
    ...(request.route.settings.bind as any)?.maskOptions
  };
  request.logger.info({
    id: LOG_IDS.ON_PRE_HANDLER,
    data: {
      method: request.method,
      path: request.route.path,
      params: maskFields(request.params, maskOptions.params),
      query: maskFields(request.query, maskOptions.query),
      payload: maskFields(request.payload, maskOptions.requestPayloadFields),
      headers: maskFields(request.headers, maskOptions.requestHeaders),
    }
  }, `onPreHandler event: ${request.route.path}`);
  return h.continue;
}

export function logOnPreResponse(request: Request, h: ResponseToolkit, err?: Error): symbol {
  const response = request.response as ResponseObject;
  if (err) {
    request.logger.error({
      id: LOG_IDS.ON_PRE_RESPONSE_ERROR,
      data: { error: err },
    }, `Error in onPreResponse: ${err.message}`);
    return h.continue;
  }
  const maskOptions = {
    responseHeaders: [],
    responsePayloadFields: [],
    ...(request.route.settings.bind as any)?.maskOptions
  };
  const responseTime = Date.now() - request.info.received;
  request.logger.info({
    id: LOG_IDS.ON_PRE_RESPONSE,
    data: {
      responseTime,
      statusCode: response.statusCode,
      responseHeaders: maskFields(response.headers, maskOptions.responseHeaders),
      responsePayload: maskFields(response.source, maskOptions.responsePayloadFields),
    }
  }, `onPreResponse event: statusCode: ${response.statusCode} responseTime: ${responseTime}ms`);
  return h.continue;
}
