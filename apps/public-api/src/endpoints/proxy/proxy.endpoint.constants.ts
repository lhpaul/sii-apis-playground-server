import { MaskRequestOptions } from '@repo/shared/utils';

export const URL = '/proxy/*';

export const SII_SIMPLE_API_MASK_OPTIONS: MaskRequestOptions = {
  requestHeaders: ['authorization'],
  requestPayloadFields: ['RutUsuario', 'PasswordSII', 'RutEmpresa'],
  responseHeaders: ['authorization'],
};

export const BAD_REQUEST_RESPONSES = {
  unsupported: {
    code: 'unsupported',
    message: 'Unsupported proxy',
  }
};

export const STEPS = {
  PROXY_REQUEST: { id: 'proxy-request' },
};

export const HEADERS_TO_REMOVE = [
  'content-length',
  'host',
];

