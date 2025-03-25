export interface TApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: TApiError;
  [key: string]: any;
}

export interface TApiError {
  code: string;
  message: string;
  invalidFields?: TInvalidFields[];
  data?: any;
  [key: string]: any;
}

export interface TInvalidFields {
  field: string;
  messages: string;
}
