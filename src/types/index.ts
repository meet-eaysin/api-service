export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: IApiError;
  [key: string]: any;
}

export interface IApiError {
  code: string;
  message: string;
  invalidFields?: InvalidFields[];
  data?: any;
  [key: string]: any;
}

export interface InvalidFields {
  field: string;
  messages: string;
}
