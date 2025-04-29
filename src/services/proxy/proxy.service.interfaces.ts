export interface IProxyApiConfig {
  baseUrl: string;
  defaultHeaders?: {
    [key: string]: string;
  }
}