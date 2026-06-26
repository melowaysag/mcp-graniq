import { describe, it, expect, vi } from "vitest";
import { Readable, Writable } from "node:stream";
import { runStdioBridge } from "./stdio.js";

function collectStream() {
  const chunks: string[] = [];
  const stream = new Writable({
    write(chunk, _enc, cb) {
      chunks.push(chunk.toString("utf8"));
      cb();
    },
  });
  return { stream, chunks };
}

describe("stdio bridge — smoke", () => {
  it("forwards a single JSON-RPC line and pipes the response back", async () => {
    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse((init?.body as string) ?? "{}") as { id: number };
      expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer gmcp_x");
      return new Response(JSON.stringify({ jsonrpc: "2.0", id: body.id, result: { ok: true } }), { status: 200 });
    }) as unknown as typeof fetch;

    const stdin = Readable.from([Buffer.from(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "ping" }) + "\n")]);
    const { stream: stdout, chunks: out } = collectStream();
    const { stream: stderr } = collectStream();
    await runStdioBridge({ token: "gmcp_x", stdin, stdout, stderr, fetch: fetchImpl });
    const merged = out.join("");
    expect(JSON.parse(merged.trim())).toEqual({ jsonrpc: "2.0", id: 1, result: { ok: true } });
  });

  it("emits parse error for malformed lines", async () => {
    const stdin = Readable.from([Buffer.from("not-json\n")]);
    const { stream: stdout, chunks: out } = collectStream();
    const { stream: stderr } = collectStream();
    await runStdioBridge({ token: "gmcp_x", stdin, stdout, stderr, fetch: vi.fn() as unknown as typeof fetch });
    const parsed = JSON.parse(out.join("").trim()) as { error: { code: number } };
    expect(parsed.error.code).toBe(-32700);
  });

  it("swallows notification responses (HTTP 204)", async () => {
    const fetchImpl = vi.fn(async () => new Response(null, { status: 204 })) as unknown as typeof fetch;
    const stdin = Readable.from([Buffer.from(JSON.stringify({ jsonrpc: "2.0", method: "notify" }) + "\n")]);
    const { stream: stdout, chunks: out } = collectStream();
    const { stream: stderr } = collectStream();
    await runStdioBridge({ token: "gmcp_x", stdin, stdout, stderr, fetch: fetchImpl });
    expect(out.join("")).toBe("");
  });

  it("rejects bad token", async () => {
    const stdin = Readable.from([]);
    const { stream: stdout } = collectStream();
    const { stream: stderr } = collectStream();
    await expect(runStdioBridge({ token: "bad", stdin, stdout, stderr })).rejects.toThrow(/gmcp_/);
  });
});
