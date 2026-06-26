// ════════════════════════════════════════════════════════════════
// stdio bridge — proxies JSON-RPC frames between a stdio MCP client
// (Claude Desktop, Cursor, Windsurf, VS Code) and the Graniq HTTP MCP server.
//
// Protocol on stdio: newline-delimited JSON (one JSON object per line).
// Per MCP spec, requests and notifications are forwarded as-is; the
// `Authorization` header is injected by the bridge so the client never
// needs to know about the PAT.
// ════════════════════════════════════════════════════════════════
import { DEFAULT_API_URL } from "./types.js";

export interface StdioBridgeOptions {
  token: string;
  apiUrl?: string;
  /** Streams (overridable for tests). */
  stdin?: NodeJS.ReadableStream;
  stdout?: NodeJS.WritableStream;
  stderr?: NodeJS.WritableStream;
  fetch?: typeof fetch;
  /** Resolves when the bridge stops (stdin EOF). */
  signal?: AbortSignal;
}

export async function runStdioBridge(opts: StdioBridgeOptions): Promise<void> {
  const token = opts.token;
  if (!token?.startsWith("gmcp_")) {
    throw new Error("GRANIQ_TOKEN must start with gmcp_");
  }
  const apiUrl = opts.apiUrl ?? DEFAULT_API_URL;
  const stdin = opts.stdin ?? process.stdin;
  const stdout = opts.stdout ?? process.stdout;
  const stderr = opts.stderr ?? process.stderr;
  const fetchImpl = opts.fetch ?? globalThis.fetch;

  const writeLine = (obj: unknown) => {
    stdout.write(JSON.stringify(obj) + "\n");
  };
  const logErr = (msg: string) => {
    stderr.write(`[graniq-mcp] ${msg}\n`);
  };

  let buffer = "";
  const handleLine = async (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let payload: unknown;
    try {
      payload = JSON.parse(trimmed);
    } catch {
      writeLine({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
      return;
    }
    try {
      const res = await fetchImpl(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      // Notifications => server returns 204; nothing to forward.
      if (res.status === 204) return;
      const text = await res.text();
      if (!text) return;
      // Forward verbatim to preserve id/error shape.
      stdout.write(text.endsWith("\n") ? text : text + "\n");
    } catch (e) {
      logErr(`forward failed: ${(e as Error).message}`);
      const id = (payload as { id?: number | string | null })?.id ?? null;
      writeLine({
        jsonrpc: "2.0",
        id,
        error: { code: -32000, message: `Bridge error: ${(e as Error).message}` },
      });
    }
  };

  return await new Promise<void>((resolve, reject) => {
    const onData = (chunk: Buffer | string) => {
      buffer += typeof chunk === "string" ? chunk : chunk.toString("utf8");
      let idx = buffer.indexOf("\n");
      while (idx !== -1) {
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        void handleLine(line);
        idx = buffer.indexOf("\n");
      }
    };
    const onEnd = () => {
      if (buffer.trim()) void handleLine(buffer);
      resolve();
    };
    const onErr = (e: Error) => reject(e);

    stdin.on("data", onData);
    stdin.once("end", onEnd);
    stdin.once("error", onErr);
    opts.signal?.addEventListener("abort", () => resolve(), { once: true });
  });
}
