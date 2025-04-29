export enum MakeProxyRequestErrorCode {
  UNKNOWN_ERROR = 'unknown-error',
}
export class MakeRequestError extends Error {
  code: MakeProxyRequestErrorCode;
  data?: any;
  status?: number | null;

  constructor(input: {
    code: MakeProxyRequestErrorCode,
    message?: string;
    data?: any;
    status?: number | null;
  }) {
    super(input.message);
    this.code = input.code;
    this.data = input.data;
    this.status = input.status;
  }
}