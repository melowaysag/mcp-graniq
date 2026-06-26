import { describe, it, expect, vi } from "vitest";
import { createGraniqMCP, GraniqMCPError } from "./client.js";

function mockFetch(handler: (body: unknown) => { status?: number; json: unknown }) {
  return vi.fn(async (_url: string, init?: RequestInit) => {
    const body = JSON.parse((init?.body as string) ?? "{}");
    const r = handler(body);
    return new Response(JSON.stringify(r.json), {
      status: r.status ?? 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as unknown as typeof fetch;
}

describe("GraniqMCPClient — unit", () => {
  it("rejects missing or malformed token", () => {
    expect(() => createGraniqMCP({ token: "" })).toThrow(GraniqMCPError);
    expect(() => createGraniqMCP({ token: "bad" })).toThrow(/gmcp_/);
  });

  it("connect calls initialize and caches serverInfo", async () => {
    const fetchImpl = mockFetch((body) => {
      expect((body as { method: string }).method).toBe("initialize");
      return { json: { jsonrpc: "2.0", id: (body as { id: number }).id, result: { name: "graniq-mcp", version: "1.0.0", protocolVersion: "2024-11-05" } } };
    });
    const c = createGraniqMCP({ token: "gmcp_x", fetch: fetchImpl });
    const info = await c.connect();
    expect(info.name).toBe("graniq-mcp");
    expect(c.getServerInfo()).toEqual(info);
  });

  it("listTools caches result", async () => {
    let calls = 0;
    const fetchImpl = mockFetch((body) => {
      calls++;
      return { json: { jsonrpc: "2.0", id: (body as { id: number }).id, result: { tools: [{ name: "get_balance", description: "x", inputSchema: {} }] } } };
    });
    const c = createGraniqMCP({ token: "gmcp_x", fetch: fetchImpl });
    await c.listTools();
    await c.listTools();
    expect(calls).toBe(1);
    await c.listTools({ refresh: true });
    expect(calls).toBe(2);
  });

  it("callTool forwards arguments and returns result", async () => {
    const fetchImpl = mockFetch((body) => {
      const params = (body as { params: { name: string; arguments: unknown } }).params;
      expect(params.name).toBe("get_balance");
      expect(params.arguments).toEqual({ since: "2026-01-01" });
      return { json: { jsonrpc: "2.0", id: (body as { id: number }).id, result: { content: [{ type: "text", text: "R$ 1.234,00" }] } } };
    });
    const c = createGraniqMCP({ token: "gmcp_x", fetch: fetchImpl });
    const res = await c.callTool("get_balance", { since: "2026-01-01" });
    expect(res.content[0]?.text).toBe("R$ 1.234,00");
  });

  it("maps HTTP 401 → Unauthorized", async () => {
    const fetchImpl = vi.fn(async () => new Response("", { status: 401 })) as unknown as typeof fetch;
    const c = createGraniqMCP({ token: "gmcp_x", fetch: fetchImpl });
    await expect(c.connect()).rejects.toMatchObject({ code: -32001 });
  });

  it("maps HTTP 429 → Rate limited", async () => {
    const fetchImpl = vi.fn(async () => new Response("", { status: 429 })) as unknown as typeof fetch;
    const c = createGraniqMCP({ token: "gmcp_x", fetch: fetchImpl });
    await expect(c.connect()).rejects.toMatchObject({ code: -32029 });
  });

  it("propagates JSON-RPC error envelope", async () => {
    const fetchImpl = mockFetch((body) => ({
      json: { jsonrpc: "2.0", id: (body as { id: number }).id, error: { code: -32601, message: "Method not found" } },
    }));
    const c = createGraniqMCP({ token: "gmcp_x", fetch: fetchImpl });
    await expect(c.rpc("nope", {})).rejects.toMatchObject({ code: -32601, message: "Method not found" });
  });
});
