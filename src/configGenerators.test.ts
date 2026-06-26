import { describe, it, expect } from "vitest";
import { generateConfig, ALL_TARGETS } from "./configGenerators.js";

describe("config generators — compatibility matrix", () => {
  it("rejects invalid token", () => {
    expect(() => generateConfig("claude-desktop", { token: "nope" })).toThrow(/gmcp_/);
  });

  for (const target of ALL_TARGETS) {
    it(`generates a parseable JSON snippet for ${target}`, () => {
      const cfg = generateConfig(target, { token: "gmcp_test" });
      const parsed = JSON.parse(cfg.snippet);
      // Claude/Cursor/Windsurf wrap in mcpServers; VS Code wraps in servers.
      const root = (parsed.mcpServers ?? parsed.servers) as Record<string, unknown>;
      expect(root).toBeTruthy();
      const server = root["graniq"] as { command: string; args: string[]; env: Record<string, string> };
      expect(server.command).toBe("npx");
      expect(server.args).toEqual(["-y", "@graniq/mcp@latest", "stdio"]);
      expect(server.env.GRANIQ_TOKEN).toBe("gmcp_test");
      expect(server.env.GRANIQ_API_URL).toMatch(/^https:\/\//);
      expect(cfg.notes.length).toBeGreaterThan(0);
      expect(cfg.configPath.length).toBeGreaterThan(0);
    });
  }

  it("honors custom serverName and apiUrl", () => {
    const cfg = generateConfig("cursor", { token: "gmcp_x", serverName: "graniq-prod", apiUrl: "https://example.com/mcp" });
    const parsed = JSON.parse(cfg.snippet) as { mcpServers: Record<string, { env: Record<string, string> }> };
    expect(parsed.mcpServers["graniq-prod"]).toBeTruthy();
    expect(parsed.mcpServers["graniq-prod"]?.env.GRANIQ_API_URL).toBe("https://example.com/mcp");
  });
});
