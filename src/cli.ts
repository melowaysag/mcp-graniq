// ════════════════════════════════════════════════════════════════
// graniq-mcp CLI — official entrypoint.
//
//   graniq-mcp stdio                     start stdio bridge (used by MCP clients)
//   graniq-mcp doctor                    diagnose token + server + capabilities
//   graniq-mcp list-tools                list tools available for the token
//   graniq-mcp config <target>           print config snippet for client
//   graniq-mcp config <target> --write   write config snippet to the canonical path
//   graniq-mcp test <tool> [json-args]   invoke a tool and print the result
//   graniq-mcp version                   print package version
//
// Token resolution order: --token=... · $GRANIQ_TOKEN
// API URL: --api-url=... · $GRANIQ_API_URL · default production endpoint.
// ════════════════════════════════════════════════════════════════
import { runStdioBridge } from "./stdio.js";
import { createGraniqMCP, GraniqMCPError } from "./client.js";
import { runDoctor } from "./diagnostics.js";
import { generateConfig, ALL_TARGETS, type ConfigTarget } from "./configGenerators.js";
import { PACKAGE_VERSION, DEFAULT_API_URL } from "./types.js";

interface ParsedArgs {
  cmd: string | undefined;
  positional: string[];
  flags: Record<string, string | boolean>;
}

function parseArgs(argv: string[]): ParsedArgs {
  const [cmd, ...rest] = argv;
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (const a of rest) {
    if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      if (eq === -1) flags[a.slice(2)] = true;
      else flags[a.slice(2, eq)] = a.slice(eq + 1);
    } else positional.push(a);
  }
  return { cmd, positional, flags };
}

function resolveToken(flags: Record<string, string | boolean>): string {
  const tok = (flags["token"] as string) ?? process.env["GRANIQ_TOKEN"];
  if (!tok) {
    process.stderr.write("ERROR: missing token. Provide --token=gmcp_... or set GRANIQ_TOKEN.\n");
    process.exit(2);
  }
  return tok;
}
function resolveApiUrl(flags: Record<string, string | boolean>): string {
  return (flags["api-url"] as string) ?? process.env["GRANIQ_API_URL"] ?? DEFAULT_API_URL;
}

function help(): string {
  return `graniq-mcp v${PACKAGE_VERSION}

Usage:
  graniq-mcp <command> [options]

Commands:
  stdio                            Start stdio bridge (used by MCP clients)
  doctor                           Verify token, server reachability and capabilities
  list-tools                       List tools available for the current token
  config <target> [--write]        Print config snippet for: ${ALL_TARGETS.join(" | ")}
  test <tool> [json-args]          Invoke a tool, print the result
  version                          Print package version

Options:
  --token=gmcp_...                 Override GRANIQ_TOKEN
  --api-url=<url>                  Override GRANIQ_API_URL

Examples:
  GRANIQ_TOKEN=gmcp_... graniq-mcp doctor
  graniq-mcp config claude-desktop --token=gmcp_...
  graniq-mcp test get_balance --token=gmcp_...
`;
}

function color(s: string, code: number): string {
  return process.stdout.isTTY ? `\x1b[${code}m${s}\x1b[0m` : s;
}
const ok = (s: string) => color(s, 32);
const fail = (s: string) => color(s, 31);
const warn = (s: string) => color(s, 33);

async function cmdDoctor(flags: Record<string, string | boolean>) {
  const report = await runDoctor({ token: resolveToken(flags), apiUrl: resolveApiUrl(flags) });
  process.stdout.write(`\n  Graniq MCP doctor — ${report.apiUrl}\n\n`);
  for (const c of report.checks) {
    const icon = c.status === "ok" ? ok("✔") : c.status === "warn" ? warn("!") : fail("✘");
    process.stdout.write(`  ${icon} ${c.name.padEnd(22)} ${c.message}\n`);
  }
  process.stdout.write(`\n  Result: ${report.ok ? ok("OK") : fail("FAILED")}\n\n`);
  process.exit(report.ok ? 0 : 1);
}

async function cmdListTools(flags: Record<string, string | boolean>) {
  const client = createGraniqMCP({ token: resolveToken(flags), apiUrl: resolveApiUrl(flags) });
  await client.connect();
  const tools = await client.listTools();
  for (const t of tools) {
    process.stdout.write(`• ${t.name}\n    ${t.description}\n`);
  }
}

async function cmdConfig(positional: string[], flags: Record<string, string | boolean>) {
  const target = positional[0] as ConfigTarget | undefined;
  if (!target || !ALL_TARGETS.includes(target)) {
    process.stderr.write(`Unknown target. Valid: ${ALL_TARGETS.join(", ")}\n`);
    process.exit(2);
  }
  const cfg = generateConfig(target, {
    token: resolveToken(flags),
    apiUrl: resolveApiUrl(flags) === DEFAULT_API_URL ? undefined : resolveApiUrl(flags),
  });
  process.stdout.write(`# Target: ${cfg.target}\n# Path:   ${cfg.configPath}\n\n${cfg.snippet}\n\nNotes:\n`);
  for (const n of cfg.notes) process.stdout.write(`  - ${n}\n`);
}

async function cmdTest(positional: string[], flags: Record<string, string | boolean>) {
  const [toolName, rawArgs] = positional;
  if (!toolName) {
    process.stderr.write("Usage: graniq-mcp test <tool> [json-args]\n");
    process.exit(2);
  }
  const args = rawArgs ? (JSON.parse(rawArgs) as Record<string, unknown>) : {};
  const client = createGraniqMCP({ token: resolveToken(flags), apiUrl: resolveApiUrl(flags) });
  await client.connect();
  const result = await client.callTool(toolName, args);
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
}

async function main() {
  const { cmd, positional, flags } = parseArgs(process.argv.slice(2));
  try {
    switch (cmd) {
      case undefined:
      case "help":
      case "--help":
      case "-h":
        process.stdout.write(help());
        return;
      case "version":
      case "--version":
      case "-v":
        process.stdout.write(`${PACKAGE_VERSION}\n`);
        return;
      case "stdio":
        await runStdioBridge({ token: resolveToken(flags), apiUrl: resolveApiUrl(flags) });
        return;
      case "doctor":
        await cmdDoctor(flags);
        return;
      case "list-tools":
        await cmdListTools(flags);
        return;
      case "config":
        await cmdConfig(positional, flags);
        return;
      case "test":
        await cmdTest(positional, flags);
        return;
      default:
        process.stderr.write(`Unknown command: ${cmd}\n\n${help()}`);
        process.exit(2);
    }
  } catch (e) {
    if (e instanceof GraniqMCPError) {
      process.stderr.write(fail(`MCP error [${e.code}]: ${e.message}\n`));
    } else {
      process.stderr.write(fail(`Error: ${(e as Error).message}\n`));
    }
    process.exit(1);
  }
}

void main();
