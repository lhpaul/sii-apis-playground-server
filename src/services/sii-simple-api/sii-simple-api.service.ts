import { IRequestOptions } from '../../utils/api-requests/api-requests.utils.interfaces';
import { ProxyService } from '../proxy/proxy.service';
import { MASK_OPTIONS, SII_SIMPLE_API_BASE_URL } from './sii-simple-api.service.constants';
import { SimpleApiConfig } from './sii-simple-api.service.interfaces';

export class SiiSimpleApiService extends ProxyService {
  private static instance: SiiSimpleApiService;
  public static getInstance(): SiiSimpleApiService {
    if (SiiSimpleApiService.instance) {
      return SiiSimpleApiService.instance;
    }
    SiiSimpleApiService.instance = new SiiSimpleApiService({
      baseUrl: SII_SIMPLE_API_BASE_URL,
    });
    return SiiSimpleApiService.instance;
  }
  constructor(config: SimpleApiConfig) {
    super(config);
  }

  override makeRequest(values: { method: string; path: string; payload?: any; headers?: any; }, options?: IRequestOptions): Promise<any> {
    return super.makeRequest(values, {
      ...options,
      maskOptions: {
        ...options?.maskOptions,
        ...MASK_OPTIONS
      }
    })
  }
}