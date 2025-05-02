import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { processLoggerMock } from '../mocks/process-logger.mocks';
import { maskFields } from '../mask/mask.utils';
import { ApiResponse, IApiRequestValues, IRequestOptions } from './api-requests.utils.interfaces';
import { LOG_IDS } from './api-requests.constants';

/**
 * Helper function to handle API requests with proper logging and error handling
 */
export async function apiRequest<T>(values: IApiRequestValues, options?: IRequestOptions): Promise<ApiResponse<T>> {
  const { method, url, payload: data, headers, params } = values;
  const logger = options?.logger ?? processLoggerMock;
  const maskOptions = {
    params: [],
    requestHeaders: [],
    requestPayloadFields: [],
    responseHeaders: [],
    responsePayloadFields: [],
    ...options?.maskOptions
  };
  const config: AxiosRequestConfig = {
    method,
    url,
    headers,
    params,
    data,
  };

  try {
    logger.info(LOG_IDS.API_REQUEST_START, {
      method,
      url,
      headers: maskFields(headers, maskOptions.requestHeaders),
      params: maskFields(params, maskOptions.params),
      payload: maskFields(data, maskOptions.requestPayloadFields),
    }, `Making ${method} HTTP request to ${url}`);
    const response: AxiosResponse = await axios(config);
    logger.info(LOG_IDS.API_REQUEST_SUCCESS, {
      method,
      url,
      requestHeaders:maskFields(headers, maskOptions.requestHeaders),
      params: maskFields(params, maskOptions.params),
      requestPayload: maskFields(data, maskOptions.requestPayloadFields),
      responseHeaders: maskFields(response.headers, maskOptions.responseHeaders),
      responsePayload: maskFields(response.data, maskOptions.responsePayloadFields),
    }, `HTTP request to ${url} responded successfully with status ${response.status}`);
    return {
      status: response.status,
      data: response.data as T,
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    logger.error(LOG_IDS.API_REQUEST_ERROR, {
      method,
      url,
      requestHeaders: maskFields(headers, maskOptions.requestHeaders),
      params: maskFields(params, maskOptions.params),
      requestPayload: maskFields(data, maskOptions.requestPayloadFields),
      error: {
        message: axiosError.message,
        code: axiosError.code || 'unknown-error',
        status: axiosError.response?.status || null,
        data: axiosError.response?.data || null,
      },
    }, `HTTP ${method} request to ${url} failed with error: ${axiosError.message}`);
    return {
      status: axiosError.response?.status || -1,
      error: {
        code: axiosError.code || 'unknown-error',
        message: axiosError.message,
        status: axiosError.response?.status || null,
        data: axiosError.response?.data || null,
      },
    };
  }
}
