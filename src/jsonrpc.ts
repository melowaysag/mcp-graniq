// ════════════════════════════════════════════════════════════════
// Minimal JSON-RPC 2.0 helpers — mirror of supabase/functions/_shared/mcp-jsonrpc.ts.
// Kept lean: client-side we only need to build requests and parse responses.
// ════════════════════════════════════════════════════════════════

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: number | string;
  method: string;
  params?: unknown;
}

export interface JsonRpcResponseOk<T = unknown> {
  jsonrpc: "2.0";
  id: number | string | null;
  result: T;
}

export interface JsonRpcResponseErr {
  jsonrpc: "2.0";
  id: number | string | null;
  error: { code: number; message: string; data?: unknown };
}

export type JsonRpcResponse<T = unknown> = JsonRpcResponseOk<T> | JsonRpcResponseErr;

export const JsonRpcErrorCodes = {
  ParseError: -32700,
  InvalidRequest: -32600,
  MethodNotFound: -32601,
  InvalidParams: -32602,
  InternalError: -32603,
  Unauthorized: -32001,
  RateLimited: -32029,
  Timeout: -32000,
} as const;

let counter = 0;
export function nextId(): number {
  counter = (counter + 1) % Number.MAX_SAFE_INTEGER;
  return counter;
}

export function isError<T>(res: JsonRpcResponse<T>): res is JsonRpcResponseErr {
  return (res as JsonRpcResponseErr).error !== undefined;
}
