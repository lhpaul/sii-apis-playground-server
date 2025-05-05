import { IMaskRequestOptions } from '../../utils/api-requests/api-requests.utils.interfaces';

export const SII_SIMPLE_API_BASE_URL = 'https://servicios.simpleapi.cl'; // Base URL for the API

export const MASK_OPTIONS: IMaskRequestOptions = {
  requestHeaders: ['authorization'],
  requestPayloadFields: ['RutUsuario', 'PasswordSII', 'RutEmpresa'],
  responseHeaders: ['authorization'],
};