export interface IgmsError {
  message: string;
  /**
   * https://www.igms.com/docs/airgms-api/errors.html
   *
   * 0  Generic Error\
   * 11 Problems with one of method parameters\
   * 12 Problems with Access Token\
   * 13 Problems with API application\
   * 14 Problems with Access Token scope\
   * 15 API method exists but not available for use right now\
   */
  code: 0 | 11 | 12 | 13 | 14 | 15;
  // ... may contain additional fields ...
}

export interface IgmsMeta {
  page?: number;
  has_next_page?: boolean;
}

/**
 * https://www.igms.com/docs/airgms-api/json-schema.html
 */
export interface IgmsResponse {
  data?: unknown;
  meta?: IgmsMeta;
  error?: IgmsError;
}
