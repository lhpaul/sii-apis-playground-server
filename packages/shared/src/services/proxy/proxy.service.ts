import { ExecutionLogger } from '../../definitions';
import { apiRequest } from '../../utils/api-requests/api-requests.utils';
import { RequestOptions } from '../../utils/api-requests/api-requests.utils.interfaces';
import { MakeRequestError, MakeProxyRequestErrorCode } from './proxy.service.errors';
import { IProxyApiConfig } from './proxy.service.interfaces';


export class ProxyService {
  private baseUrl: string;
  private defaultHeaders?: {
    [key: string]: string;
  };

  constructor(config: IProxyApiConfig) {
    this.baseUrl = config.baseUrl;
    this.defaultHeaders = config.defaultHeaders;
  }

  /**
 * Sends an HTTP request to the proxied API.
 *
 * @param values - An object containing the request details.
 * @param values.method - The HTTP method to use (e.g., 'GET', 'POST').
 * @param values.path - The endpoint path to make the request to, relative to the base URL.
 * @param values.payload - Optional data to include in the request body.
 * @param values.headers - Optional headers to include in the request.
 * @param options - Additional options for the request.
 * @param options.logger - Optional logger instance for logging request details.
 * @param options.maskOptions - Optional masking options for sensitive data in logs.
 * @returns A promise that resolves with the response data from the API.
 * @throws {MakeRequestError} If the request fails, an error is thrown with details about the failure.
 */
  async makeRequest(values: {
    method: string;
    path: string;
    payload?: any;
    headers?: any
  }, logger: ExecutionLogger, options?: RequestOptions): Promise<any> {
    const { method, path, payload, headers } = values;
    const { data: responseData, error } = await apiRequest<any>({
      method,
      url: `${this.baseUrl}${path}`,
      payload,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
    }, logger, options);
    if (error) {
      throw new MakeRequestError({
        message: error.message,
        code: MakeProxyRequestErrorCode.UNKNOWN_ERROR,
        data: error.data,
        status: error.status,
      });
    }
    return responseData;
  }
}