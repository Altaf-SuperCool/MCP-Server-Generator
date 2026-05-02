# GitHub API (Simplified) MCP Server

Generated MCP server for GitHub API (Simplified).

## Installation

```bash
npm install
npm run build
```

## Authentication

This server requires authentication. Set the following environment variables:


- `API_TOKEN`: Your bearer token

Copy `.env.example` to `.env` and fill in your credentials.

## Usage

### With MCP Inspector

```bash
npx @modelcontextprotocol/inspector dist/index.js
```

### With Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "node",
      "args": ["C:\Users\v193570\OneDrive - United Airlines\Documents\AI World\PersonalGithub\MCP-Server-Generator/./generated-example-ts/dist/index.js"],
      "env": {
        ,
        "API_TOKEN": "your-token"
      }
    }
  }
}
```

## Available Tools



## Available Resources

- **getUser**: Retrieve information about a GitHub user
- **listUserRepos**: List public repositories for a user
- **getRepository**: Get information about a repository
- **listIssues**: List issues for a repository

## Development

```bash
npm run dev
```

## Testing

```bash
npm test
```

## Features

- ✅ STDIO transport
- ✅ Zod validation
- ✅ Automatic retry logic
- ✅ Authentication (apikey, bearer)
- ✅ Error handling
- ✅ TypeScript types
