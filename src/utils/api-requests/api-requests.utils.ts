import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { processLoggerMock } from '../mocks/process-logger.mocks';
import { maskFields } from '../mask/mask.utils';
import { ApiResponse, IApiRequestValues, IRequestOptions } from './api-requests.utils.interfaces';
import { DEFAULT_ERROR_CODE, LOGS } from './api-requests.constants';

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
  const startTime = Date.now();
  try {
    logger.info({
      logId: LOGS.API_REQUEST_START.logId,
      method,
      url,
      headers: maskFields(headers, maskOptions.requestHeaders),
      params: maskFields(params, maskOptions.params),
      payload: maskFields(data, maskOptions.requestPayloadFields),
    }, LOGS.API_REQUEST_START.logMessage({ method, url }));
    const response: AxiosResponse = await axios(config);
    const duration = Date.now() - startTime;
    logger.info({
      logId: LOGS.API_REQUEST_SUCCESS.logId,
      method,
      url,
      duration,
      requestHeaders:maskFields(headers, maskOptions.requestHeaders),
      params: maskFields(params, maskOptions.params),
      requestPayload: maskFields(data, maskOptions.requestPayloadFields),
      responseHeaders: maskFields(response.headers, maskOptions.responseHeaders),
      responsePayload: maskFields(response.data, maskOptions.responsePayloadFields),
    }, LOGS.API_REQUEST_SUCCESS.logMessage({ method, url, duration }));
    return {
      status: response.status,
      data: response.data as T,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const axiosError = error as AxiosError;
    logger.error({
      logId: LOGS.API_REQUEST_ERROR.logId,
      method,
      url,
      duration,
      requestHeaders: maskFields(headers, maskOptions.requestHeaders),
      params: maskFields(params, maskOptions.params),
      requestPayload: maskFields(data, maskOptions.requestPayloadFields),
      error: {
        message: axiosError.message,
        code: axiosError.code || DEFAULT_ERROR_CODE,
        status: axiosError.response?.status || null,
        data: axiosError.response?.data || null,
      },
    }, LOGS.API_REQUEST_ERROR.logMessage({ method, url, error: axiosError, duration }));
    return {
      status: axiosError.response?.status || -1,
      error: {
        code: axiosError.code || DEFAULT_ERROR_CODE,
        message: axiosError.message,
        status: axiosError.response?.status || null,
        data: axiosError.response?.data || null,
      },
    };
  }
}
