// Public surface of @graniq/mcp.
export { GraniqMCPClient, GraniqMCPError, createGraniqMCP } from "./client.js";
export { runStdioBridge, type StdioBridgeOptions } from "./stdio.js";
export { runDoctor, runDiagnose, type DoctorReport, type DiagnoseReport, type CheckResult } from "./diagnostics.js";
export {
  generateConfig,
  ALL_TARGETS,
  type ConfigTarget,
  type ConfigGenInput,
  type GeneratedConfig,
} from "./configGenerators.js";
export {
  DEFAULT_API_URL,
  PROTOCOL_VERSION,
  PACKAGE_NAME,
  PACKAGE_VERSION,
  type GraniqMCPConfig,
  type ToolDescriptor,
  type ServerInfo,
  type CallToolResult,
} from "./types.js";
export { JsonRpcErrorCodes } from "./jsonrpc.js";
