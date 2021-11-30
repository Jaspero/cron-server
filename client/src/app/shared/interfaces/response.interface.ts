export interface Response {
  _id: string;
  status: number;
  account: string;
  body?: any;
  headers?: any;
  error?: string;
}
