import { apiRequest } from '../../utils/http-requests/http-requests.utils';
import { MakeRequestError, MakeProxyRequestErrorCode } from './proxy.service.errors';
import { IProxyApiConfig } from './proxy.service.interfaces';

export class ProxyService {
  // private static instances: { [label: string]: ProxyService } = {};
  // public static getInstance(label: string = '', config?: IProxyApiConfig): ProxyService {
  //   if (ProxyService.instances[label]) {
  //     return ProxyService.instances[label];
  //   }
  //   if (!config) {
  //     throw new Error(CONFIG_NEEDED_FOR_FIRST_INSTANTIATION_MESSAGE)
  //   }
  //   ProxyService.instances[label] = new ProxyService(config);
  //   return ProxyService.instances[label];
  // }
  private baseUrl: string;
  private defaultHeaders?: {
    [key: string]: string;
  };

  constructor(config: IProxyApiConfig) {
    this.baseUrl = config.baseUrl;
    this.defaultHeaders = config.defaultHeaders;
  }

  /**
   * Make request to the proxied API
   * @param {string} method HTTP method
   * @param {string} path to make the request to
   * @param {any} data data to send in the request
   * @param {any} headers headers to send in the request
   * @returns {Promise<any>} response from the API
   */
  async makeRequest(method: string, path: string, data?: any, headers?: any): Promise<any> {
    const { data: responseData, error } = await apiRequest<any>({
      method,
      url: `${this.baseUrl}${path}`,
      data,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
    });
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