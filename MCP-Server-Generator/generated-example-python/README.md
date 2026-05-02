# GitHub API (Simplified) MCP Server

Generated MCP server for GitHub API (Simplified).

## Installation

```bash
pip install -r requirements.txt
```

## Authentication

This server requires authentication. Set the following environment variables:

- `API_KEY`: Your API key
- `API_TOKEN`: Your bearer token

Copy `.env.example` to `.env` and fill in your credentials.

## Usage

### Run the server

```bash
python main.py
```

### With Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "python",
      "args": ["C:\Users\v193570\OneDrive - United Airlines\Documents\AI World\PersonalGithub\MCP-Server-Generator/./generated-example-python/main.py"],
      "env": {
        "API_KEY": "your-api-key",
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
python main.py
```

## Testing

```bash
pytest
```

## Features

- ✅ STDIO transport
- ✅ Pydantic validation
- ✅ Automatic retry logic
- ✅ Authentication (apikey, bearer)
- ✅ Error handling
- ✅ Type hints
- ✅ Async/await support
