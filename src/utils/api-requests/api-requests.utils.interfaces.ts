import { IProcessLogger } from '../../definitions/logging.interfaces';

export interface IApiRequestValues {
  method: string,
  url: string,
  payload?: any,
  headers?: any,
  params?: any
}

export interface IMaskRequestOptions {
  params?: string[];
  query?: string[];
  requestPayloadFields?: string[];
  requestHeaders?: string[];
  responsePayloadFields?: string[];
  responseHeaders?: string[];
};
export interface IRequestOptions {
  logger?: IProcessLogger,
  maskOptions?: IMaskRequestOptions,
}

export interface ApiResponse<T> {
  status: number;
  data?: T;
  error?: {
    code: string;
    message: string;
    status?: number | null;
    data?: any;
  };
}