# Using Bob AI Prompts to Generate MCP Servers

## 🎯 Overview

This guide shows you how to use **Bob AI prompts** to generate MCP servers. You have two options:

1. **Display Mode** - Get prompts to copy-paste into any AI assistant (Claude, ChatGPT, etc.)
2. **Auto Mode** - Automatically generate using OpenAI API

## 🚀 Quick Start

### Option 1: Display Prompts (Recommended for Beginners)

This mode displays the three Bob prompts that you can copy-paste into any AI assistant.

```bash
# Build the project first
npm run build

# Display prompts for the GitHub API example
node dist/cli/index.js prompts -i examples/github-api.yaml -m display

# Or use interactive mode
node dist/cli/index.js prompts
```

**What you'll get:**
- ✅ Three complete prompts ready to copy-paste
- ✅ Works with Claude, ChatGPT, Gemini, or any AI assistant
- ✅ Full control over the generation process
- ✅ No API key required

### Option 2: Auto-Generate with AI API

This mode automatically runs all three prompts using the OpenAI API.

```bash
# Set your API key
export OPENAI_API_KEY=sk-...

# Auto-generate
node dist/cli/index.js prompts -i examples/github-api.yaml -m auto

# Or specify the key directly
node dist/cli/index.js prompts -i examples/github-api.yaml -m auto -k sk-...
```

**What you'll get:**
- ✅ Fully automated generation
- ✅ Analysis, code, and tests generated in seconds
- ✅ Requires OpenAI API key

## 📋 Three-Stage Bob Prompt Strategy

### Stage 1: API Analysis
**Purpose:** Analyze the API specification and map endpoints to MCP primitives

**What it does:**
- Reads your OpenAPI/GraphQL specification
- Identifies GET endpoints → Maps to MCP Resources (read-only data)
- Identifies POST/PUT/DELETE → Maps to MCP Tools (actions)
- Extracts all parameters (path, query, body)
- Detects authentication requirements

**Output:** JSON mapping of endpoints to MCP primitives

### Stage 2: Code Generation
**Purpose:** Generate production-ready MCP server code

**What it includes:**
- ✅ Complete server implementation (TypeScript or Python)
- ✅ Error handling with try/catch blocks
- ✅ Input validation (Zod for TypeScript, Pydantic for Python)
- ✅ Authentication (Bearer, API Key, OAuth2, Basic)
- ✅ Retry logic with exponential backoff
- ✅ Logging to stderr
- ✅ STDIO or HTTP transport
- ✅ Comprehensive comments

**Output:** Complete server code ready to use

### Stage 3: Test Generation
**Purpose:** Create comprehensive test suite

**What it includes:**
- ✅ Unit tests for each tool/resource
- ✅ Integration tests for the server
- ✅ Mock API responses
- ✅ Edge case handling
- ✅ Authentication tests
- ✅ Error scenario tests

**Output:** Complete test suite (Jest for TypeScript, Pytest for Python)

## 📖 Step-by-Step Guide

### Using Display Mode (Manual Copy-Paste)

#### Step 1: Generate the Prompts

```bash
node dist/cli/index.js prompts -i examples/github-api.yaml -m display -l typescript
```

This will display three prompts on your screen.

#### Step 2: Use Prompt 1 (API Analysis)

1. Copy the entire **Prompt 1** section
2. Paste it into your AI assistant (Claude, ChatGPT, etc.)
3. The AI will analyze the API and return a JSON mapping
4. Copy the JSON response

**Example Response:**
```json
{
  "endpoints": [
    {
      "path": "/users/{username}",
      "method": "GET",
      "mcpType": "resource",
      "name": "getUser",
      "description": "Retrieve information about a GitHub user",
      "parameters": [
        {
          "name": "username",
          "type": "string",
          "required": true,
          "location": "path"
        }
      ],
      "authentication": {
        "required": true,
        "type": "bearer"
      }
    }
  ]
}
```

#### Step 3: Use Prompt 2 (Code Generation)

1. Copy **Prompt 2**
2. Replace `"placeholder": "Insert analysis here"` with the JSON from Step 2
3. Paste into your AI assistant
4. The AI will generate complete server code
5. Save the code to `src/index.ts` (or `main.py` for Python)

#### Step 4: Use Prompt 3 (Test Generation)

1. Copy **Prompt 3**
2. Replace `// Insert server code here` with the code from Step 3
3. Paste into your AI assistant
4. The AI will generate comprehensive tests
5. Save the tests to `tests/server.test.ts` (or `test_server.py` for Python)

#### Step 5: Set Up and Run

```bash
# Create project directory
mkdir my-mcp-server
cd my-mcp-server

# Initialize project
npm init -y

# Install dependencies
npm install @modelcontextprotocol/sdk zod axios

# Install dev dependencies
npm install -D typescript @types/node jest @types/jest ts-jest

# Save the generated files
# - src/index.ts (server code)
# - tests/server.test.ts (test code)

# Build and test
npm run build
npm test

# Run the server
npm start
```

### Using Auto Mode (Automated)

#### Step 1: Set Up API Key

```bash
# Option 1: Environment variable
export OPENAI_API_KEY=sk-your-key-here

# Option 2: Pass directly
# (shown in next step)
```

#### Step 2: Run Auto-Generation

```bash
# With environment variable
node dist/cli/index.js prompts -i examples/github-api.yaml -m auto -l typescript

# Or with direct API key
node dist/cli/index.js prompts -i examples/github-api.yaml -m auto -k sk-your-key-here
```

#### Step 3: Review Output

The command will display:
- ✅ Analysis results (JSON mapping)
- ✅ Generated server code (preview)
- ✅ Generated tests (preview)

#### Step 4: Save and Use

Copy the generated code sections and save them to your project files.

## 🎨 Examples

### Example 1: GitHub API (TypeScript)

```bash
# Display prompts
node dist/cli/index.js prompts -i examples/github-api.yaml -m display -l typescript

# Or auto-generate
node dist/cli/index.js prompts -i examples/github-api.yaml -m auto -l typescript
```

### Example 2: Custom API (Python)

```bash
# Display prompts for your API
node dist/cli/index.js prompts -i ./my-api.yaml -m display -l python

# Or auto-generate
node dist/cli/index.js prompts -i ./my-api.yaml -m auto -l python
```

### Example 3: GraphQL API

```bash
# Display prompts for GraphQL
node dist/cli/index.js prompts -i ./schema.graphql -m display -l typescript
```

## 💡 Tips and Best Practices

### 1. Start with Display Mode
- Easier to understand the process
- Works with any AI assistant
- No API key required
- Full control over each stage

### 2. Review the Analysis
- Always check the Prompt 1 output
- Verify GET → Resource mappings
- Verify POST/PUT/DELETE → Tool mappings
- Ensure all parameters are captured

### 3. Customize the Prompts
- You can modify the prompts before using them
- Add specific requirements
- Request additional features
- Adjust code style preferences

### 4. Iterate if Needed
- If the generated code isn't perfect, refine the prompts
- Provide more context in the prompts
- Ask the AI to fix specific issues

### 5. Test Thoroughly
- Always run the generated tests
- Add more tests for your specific use cases
- Test with real API calls

## 🔧 Advanced Usage

### Custom Prompt Configuration

You can modify the prompts in `src/analyzers/bob-prompts.ts`:

```typescript
// Customize Prompt 1
export function getPrompt1_APIAnalysis(apiSpec: string): string {
  return `Your custom prompt here...`;
}

// Customize Prompt 2
export function getPrompt2_CodeGeneration(...): string {
  return `Your custom prompt here...`;
}

// Customize Prompt 3
export function getPrompt3_TestGeneration(...): string {
  return `Your custom prompt here...`;
}
```

### Using Different AI Services

The auto mode supports any OpenAI-compatible API:

```bash
# Use a custom endpoint
export OPENAI_API_KEY=your-key
export OPENAI_API_BASE=https://your-custom-endpoint.com/v1

node dist/cli/index.js prompts -i api.yaml -m auto
```

### Batch Processing

Generate prompts for multiple APIs:

```bash
# Create a script
for api in api1.yaml api2.yaml api3.yaml; do
  node dist/cli/index.js prompts -i $api -m display > prompts-$api.txt
done
```

## 🐛 Troubleshooting

### Issue: Prompts not displaying

**Solution:** Make sure you've built the project:
```bash
npm run build
```

### Issue: API key error in auto mode

**Solution:** Set the environment variable:
```bash
export OPENAI_API_KEY=sk-your-key-here
```

### Issue: Generated code has errors

**Solution:** 
1. Review the analysis from Prompt 1
2. Ensure the API spec is complete
3. Try regenerating with more specific prompts
4. Manually fix any issues

### Issue: Tests failing

**Solution:**
1. Check that dependencies are installed
2. Verify the server code is correct
3. Update test mocks if needed
4. Add missing test cases

## 📚 Resources

- **MCP Documentation:** https://modelcontextprotocol.io/
- **OpenAPI Specification:** https://swagger.io/specification/
- **Zod Validation:** https://zod.dev/
- **Jest Testing:** https://jestjs.io/

## 🎉 Success Checklist

After using Bob prompts, you should have:

- ✅ JSON analysis of your API
- ✅ Complete MCP server code
- ✅ Comprehensive test suite
- ✅ All dependencies listed
- ✅ Error handling implemented
- ✅ Input validation working
- ✅ Authentication configured
- ✅ Tests passing

## 🚀 Next Steps

1. **Test your server:**
   ```bash
   npx @modelcontextprotocol/inspector dist/index.js
   ```

2. **Integrate with Claude Desktop:**
   Add to your Claude config

3. **Deploy:**
   Use Docker or Kubernetes configs

4. **Share:**
   Publish your MCP server to npm or GitHub

---

**Made with Bob** 🤖

*Last Updated: 2026-05-01*