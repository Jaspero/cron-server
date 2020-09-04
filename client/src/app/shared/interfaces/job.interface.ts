export interface Job {
  _id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  schedule: string;
  timeZone: string;
  body?: any;
  headers?: any;
  lastRun?: number;
  runs?: number;
  nextRun?: number;
  storeBody?: boolean;
  storeHeaders?: boolean;
}
