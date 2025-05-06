export const BAD_REQUEST_RESPONSES = {
  unsupported: {
    code: 'unsupported',
    message: 'Unsupported proxy',
  }
};

export const STEPS = {
  PROXY_REQUEST: { id: 'proxy-request', obfuscatedId: '01' },
};

export const HEADERS_TO_REMOVE = [
  'content-length',
  'host',
];

