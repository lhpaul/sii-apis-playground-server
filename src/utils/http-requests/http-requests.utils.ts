import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    status?: number | null;
    data?: any;
  };
}

/**
 * Helper function to handle API requests with proper error handling
 */
export async function apiRequest<T>(input: {
  method: string,
  url: string,
  data?: any,
  headers?: any,
  params?: any
}): Promise<ApiResponse<T>> {
  const { method, url, data, headers, params } = input;
  const config: AxiosRequestConfig = {
    method,
    url,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    params,
    data,
  };

  try {
    const response: AxiosResponse = await axios(config);
    return {
      data: response.data as T,
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    return {
      error: {
        code: axiosError.code || 'unknown-error',
        message: axiosError.message,
        status: axiosError.response?.status || null,
        data: axiosError.response?.data || null,
      },
    };
  }
}