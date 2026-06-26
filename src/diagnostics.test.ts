import { describe, it, expect, vi } from "vitest";
import { runDoctor } from "./diagnostics.js";

describe("doctor — integration", () => {
  it("flags failing server reachability", async () => {
    const fetchImpl = vi.fn(async () => new Response("", { status: 401 })) as unknown as typeof fetch;
    const report = await runDoctor({ token: "gmcp_x", fetch: fetchImpl });
    expect(report.ok).toBe(false);
    expect(report.checks.find((c) => c.name === "server_reachable")?.status).toBe("fail");
  });

  it("reports OK when server + tools respond", async () => {
    const fetchImpl = vi.fn(async (_url, init) => {
      const body = JSON.parse((init?.body as string) ?? "{}") as { id: number; method: string };
      const result =
        body.method === "initialize"
          ? { name: "graniq-mcp", version: "1.0.0", protocolVersion: "2024-11-05" }
          : { tools: [{ name: "get_balance", description: "x", inputSchema: {} }] };
      return new Response(JSON.stringify({ jsonrpc: "2.0", id: body.id, result }), { status: 200 });
    }) as unknown as typeof fetch;
    const report = await runDoctor({ token: "gmcp_x", fetch: fetchImpl });
    expect(report.ok).toBe(true);
    expect(report.checks.find((c) => c.name === "capabilities")?.status).toBe("ok");
  });

  it("warns on protocol version mismatch", async () => {
    const fetchImpl = vi.fn(async (_url, init) => {
      const body = JSON.parse((init?.body as string) ?? "{}") as { id: number; method: string };
      const result =
        body.method === "initialize"
          ? { name: "graniq-mcp", version: "1.0.0", protocolVersion: "2025-01-01" }
          : { tools: [] };
      return new Response(JSON.stringify({ jsonrpc: "2.0", id: body.id, result }), { status: 200 });
    }) as unknown as typeof fetch;
    const report = await runDoctor({ token: "gmcp_x", fetch: fetchImpl });
    expect(report.checks.find((c) => c.name === "protocol_version")?.status).toBe("warn");
  });
});
