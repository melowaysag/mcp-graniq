# Exemplo — Claude Desktop

1. Gere um token em **Settings → Conectar IA** no app Graniq. Copie o `gmcp_...`.
2. Gere a config:
   ```bash
   npx -y @graniq/mcp@latest config claude-desktop --token=gmcp_SEU_TOKEN
   ```
3. Cole o JSON impresso em:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%/Claude/claude_desktop_config.json`
4. Reinicie o Claude Desktop.
5. Pergunte: *"Quanto gastei com alimentação este mês?"* — Claude usará o tool `get_transactions` automaticamente.

### Snippet de referência
```json
{
  "mcpServers": {
    "graniq": {
      "command": "npx",
      "args": ["-y", "@graniq/mcp@latest", "stdio"],
      "env": {
        "GRANIQ_TOKEN": "gmcp_SEU_TOKEN",
        "GRANIQ_API_URL": "https://izfwjyzpwewirrqeuzlu.functions.supabase.co/mcp-server"
      }
    }
  }
}
```
