import { FastifyRequest, FastifyReply, RouteOptions, FastifyInstance } from 'fastify';

import { LOG_IDS } from './endpoints.utils.constants';
import { IEndpointOptions } from './endpoints.utils.interfaces';
import { maskFields } from '../mask/mask.utils';

export function createEndpoint(values: RouteOptions, options?: IEndpointOptions): RouteOptions {
  const { onRequest, onSend, ...rest } = values;
  return {
    ...rest,
    onRequest: function(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply, done: () => void) {
      _logOnRequest(request, options);
      if (Array.isArray(onRequest)) {
        onRequest.forEach(handler => handler.call(this, request, reply, done));
      } else if (onRequest) {
        onRequest.call(this, request, reply, done);
      }
      done();
    },
    onSend: function(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply, payload: any, next: () => void) {
      _logOnSend(request, reply, payload, options);
      if (Array.isArray(onSend)) {
        onSend.forEach(handler => handler.call(this, request, reply, payload, next));
      } else if (onSend) {
        onSend.call(this, request, reply, payload, next);
      }
      next();
    },
  }
}

function _logOnRequest(request: FastifyRequest, options?: IEndpointOptions) {
  const maskOptions = {
    params: [],
    query: [],
    requestPayloadFields: [],
    requestHeaders: [],
    ...options?.maskOptions
  };
  request.log.info({
    id: LOG_IDS.ON_REQUEST,
    data: {
      method: request.method,
      url: request.url,
      params: maskFields(request.params as Record<string, string>, maskOptions.params),
      query: maskFields(request.query as Record<string, string>, maskOptions.query),
      body: maskFields(request.body as Record<string, unknown>, maskOptions.requestPayloadFields),
      headers: maskFields(request.headers as Record<string, string>, maskOptions.requestHeaders),
    }
  }, `On Request: ${request.method.toUpperCase()} ${request.url}`);
}

function _logOnSend(request: FastifyRequest, reply: FastifyReply, payload: any, options?: IEndpointOptions) {
  const maskOptions = {
    responseHeaders: [],
    responsePayloadFields: [],
    ...options?.maskOptions
  };
  request.log.info({
    id: LOG_IDS.ON_SEND,
    data: {
      responseTime: reply.elapsedTime,
      statusCode: reply.statusCode,
      responseHeaders: maskFields(reply.getHeaders() as Record<string, string>, maskOptions.responseHeaders),
      responsePayload: maskFields(payload, maskOptions.responsePayloadFields),
    }
  }, `On Send: statusCode: ${reply.statusCode} responseTime: ${reply.elapsedTime}ms`);
}
