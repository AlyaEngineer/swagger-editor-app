export type RequestHistoryEntry = {
  createdAt: string;
  durationMs: number;
  endpoint: string;
  errorDetails: null | string;
  id: string;
  method: string;
  requestSize: number;
  responseSize: number;
  statusCode: number;
};

export type RequestHistoryResult = {
  entries: RequestHistoryEntry[];
  hasError: boolean;
};

export type SaveRequestHistoryData = {
  durationMs: number;
  endpoint: string;
  errorDetails: null | string;
  method: string;
  requestSize: number;
  responseSize: number;
  statusCode: number;
};
