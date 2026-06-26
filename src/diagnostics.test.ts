import { describe, it, expect, vi } from "vitest";
import { runDoctor, runDiagnose } from "./diagnostics.js";

describe("doctor — integration", () => {
  it("flags failing JSON-RPC initialize on 401", async () => {
    const fetchImpl = vi.fn(async () => new Response("", { status: 401 })) as unknown as typeof fetch;
    const report = await runDoctor({ token: "gmcp_xxxxxxxxxxxxxxxxxxxxxxxx", fetch: fetchImpl });
    expect(report.ok).toBe(false);
    expect(report.checks.find((c) => c.name === "jsonrpc_initialize")?.status).toBe("fail");
  });

  it("reports OK when server + tools respond", async () => {
    const fetchImpl = vi.fn(async (_url, init) => {
      const body = JSON.parse((init?.body as string) ?? "{}") as { id: number | string; method: string };
      const result =
        body.method === "initialize"
          ? { name: "graniq-mcp", version: "1.0.0", protocolVersion: "2024-11-05" }
          : body.method === "tools/list"
            ? { tools: [{ name: "get_balance", description: "x", inputSchema: {} }] }
            : { content: [{ type: "text", text: "ok" }] };
      return new Response(JSON.stringify({ jsonrpc: "2.0", id: body.id, result }), { status: 200 });
    }) as unknown as typeof fetch;
    const report = await runDoctor({ token: "gmcp_xxxxxxxxxxxxxxxxxxxxxxxx", fetch: fetchImpl });
    expect(report.ok).toBe(true);
    expect(report.checks.find((c) => c.name === "capabilities")?.status).toBe("ok");
    expect(report.checks.find((c) => c.name === "workspace_db")?.status).toBe("ok");
  });

  it("warns on protocol version mismatch", async () => {
    const fetchImpl = vi.fn(async (_url, init) => {
      const body = JSON.parse((init?.body as string) ?? "{}") as { id: number | string; method: string };
      const result =
        body.method === "initialize"
          ? { name: "graniq-mcp", version: "1.0.0", protocolVersion: "2025-01-01" }
          : { tools: [] };
      return new Response(JSON.stringify({ jsonrpc: "2.0", id: body.id, result }), { status: 200 });
    }) as unknown as typeof fetch;
    const report = await runDoctor({ token: "gmcp_xxxxxxxxxxxxxxxxxxxxxxxx", fetch: fetchImpl });
    expect(report.checks.find((c) => c.name === "protocol_version")?.status).toBe("warn");
  });
});

describe("diagnose — support bundle", () => {
  it("returns structured report with package + runtime + tools", async () => {
    const fetchImpl = vi.fn(async (_url, init) => {
      const body = JSON.parse((init?.body as string) ?? "{}") as { id: number | string; method: string };
      const result =
        body.method === "initialize"
          ? { name: "graniq-mcp", version: "1.0.0", protocolVersion: "2024-11-05" }
          : { tools: [{ name: "get_balance", description: "x", inputSchema: {} }] };
      return new Response(JSON.stringify({ jsonrpc: "2.0", id: body.id, result }), { status: 200 });
    }) as unknown as typeof fetch;
    const report = await runDiagnose({ token: "gmcp_xxxxxxxxxxxxxxxxxxxxxxxx", fetch: fetchImpl });
    expect(report.package.name).toBe("@graniq/mcp");
    expect(report.package.version).toBe("0.1.0-rc.1");
    expect(report.tools.length).toBeGreaterThan(0);
    expect(report.errors).toEqual([]);
    expect(typeof report.generatedAt).toBe("string");
  });
});
