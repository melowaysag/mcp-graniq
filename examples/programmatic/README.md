# Exemplo — uso programático (Node/TypeScript)

```ts
import { createGraniqMCP } from "@graniq/mcp";

const client = createGraniqMCP({ token: process.env.GRANIQ_TOKEN! });

await client.connect();
const tools = await client.listTools();
console.log("Tools disponíveis:", tools.map((t) => t.name).join(", "));

const result = await client.callTool("get_transactions", {
  since: "2026-06-01",
  limit: 10,
});
for (const c of result.content) {
  if (c.type === "text") console.log(c.text);
}
```
