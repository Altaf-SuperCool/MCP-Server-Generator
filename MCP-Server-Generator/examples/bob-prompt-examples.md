# Bob Prompt Design Examples

This document provides practical examples of using the three-stage Bob prompt design for MCP server generation.

## Example 1: GitHub API Analysis

### Prompt 1: API Analysis

**Input:**
```yaml
# examples/github-api.yaml
openapi: 3.0.0
info:
  title: GitHub API (Simplified)
  version: 1.0.0
servers:
  - url: https://api.github.com
security:
  - bearerAuth: []
paths:
  /users/{username}:
    get:
      summary: Get a user
      operationId: getUser
      parameters:
        - name: username
          in: path
          required: true
          schema:
            type: string
```

**Bob's Analysis Output:**
```json
{
  "endpoint": "/users/{username}",
  "method": "GET",
  "mcpType": "resource",
  "reasoning": "GET endpoint provides data without side effects - mapped to MCP Resource",
  "parameters": [
    {
      "name": "username",
      "type": "string",
      "required": true,
      "location": "path"
    }
  ],
  "responseFormat": "application/json",
  "authRequired": true,
  "authType": "bearer"
}
```

### Prompt 2: Code Generation

**Bob Generates (TypeScript):**
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// Input validation schema
const getUserSchema = z.object({
  username: z.string().min(1, 'Username is required')
});

// Resource handler with error handling
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'resource://users/{username}',
      name: 'Get GitHub User',
      description: 'Retrieve information about a GitHub user',
      mimeType: 'application/json'
    }
  ]
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  try {
    // Validate input
    const { username } = getUserSchema.parse(request.params);
    
    // Make API call with authentication
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      contents: [{
        uri: request.params.uri,
        mimeType: 'application/json',
        text: JSON.stringify(data, null, 2)
      }]
    };
  } catch (error) {
    // Log to stderr (not stdout)
    console.error('Error fetching user:', error);
    throw error;
  }
});

// Start server with STDIO transport
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Prompt 3: Test Generation

**Bob Generates Tests:**
```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('GitHub MCP Server', () => {
  // Unit Tests
  describe('getUser tool', () => {
    it('should fetch user data successfully', async () => {
      const mockResponse = {
        login: 'octocat',
        id: 1,
        name: 'The Octocat'
      };
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });
      
      const result = await server.handleRequest({
        method: 'resources/read',
        params: { uri: 'resource://users/octocat' }
      });
      
      expect(result.contents[0].text).toContain('octocat');
    });
    
    // Edge case: Invalid username
    it('should handle invalid username', async () => {
      await expect(
        server.handleRequest({
          method: 'resources/read',
          params: { uri: 'resource://users/' }
        })
      ).rejects.toThrow('Username is required');
    });
    
    // Edge case: API error
    it('should handle API errors gracefully', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found'
      });
      
      await expect(
        server.handleRequest({
          method: 'resources/read',
          params: { uri: 'resource://users/nonexistent' }
        })
      ).rejects.toThrow('GitHub API error: Not Found');
    });
  });
  
  // Integration Tests
  describe('Server Integration', () => {
    it('should list all available resources', async () => {
      const result = await server.handleRequest({
        method: 'resources/list'
      });
      
      expect(result.resources).toHaveLength(4);
      expect(result.resources[0].name).toBe('Get GitHub User');
    });
  });
  
  // Authentication Tests
  describe('Authentication', () => {
    it('should include bearer token in requests', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch');
      
      await server.handleRequest({
        method: 'resources/read',
        params: { uri: 'resource://users/octocat' }
      });
      
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer')
          })
        })
      );
    });
  });
});
```

## Example 2: Stripe API with POST Endpoint

### Prompt 1: API Analysis

**Input:**
```yaml
paths:
  /charges:
    post:
      summary: Create a charge
      operationId: createCharge
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - amount
                - currency
              properties:
                amount:
                  type: integer
                currency:
                  type: string
                description:
                  type: string
```

**Bob's Analysis:**
```json
{
  "endpoint": "/charges",
  "method": "POST",
  "mcpType": "tool",
  "reasoning": "POST endpoint creates resources and has side effects - mapped to MCP Tool",
  "parameters": [
    {
      "name": "amount",
      "type": "number",
      "required": true
    },
    {
      "name": "currency",
      "type": "string",
      "required": true
    },
    {
      "name": "description",
      "type": "string",
      "required": false
    }
  ],
  "authRequired": true,
  "authType": "apikey"
}
```

### Prompt 2: Code Generation

**Bob Generates:**
```typescript
// Tool definition with Zod validation
const createChargeSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3-letter code'),
  description: z.string().optional()
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'createCharge') {
    try {
      // Validate input
      const params = createChargeSchema.parse(request.params.arguments);
      
      // Make API call with retry logic
      const response = await retryWithBackoff(async () => {
        return fetch('https://api.stripe.com/v1/charges', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.STRIPE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(params)
        });
      });
      
      if (!response.ok) {
        throw new Error(`Stripe API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error) {
      console.error('Error creating charge:', error);
      throw error;
    }
  }
});

// Retry helper with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Max retries reached');
}
```

### Prompt 3: Test Generation

**Bob Generates:**
```typescript
describe('createCharge tool', () => {
  // Unit test with mock
  it('should create charge successfully', async () => {
    const mockCharge = {
      id: 'ch_123',
      amount: 1000,
      currency: 'usd',
      status: 'succeeded'
    };
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockCharge
    });
    
    const result = await server.handleRequest({
      method: 'tools/call',
      params: {
        name: 'createCharge',
        arguments: {
          amount: 1000,
          currency: 'usd'
        }
      }
    });
    
    expect(result.content[0].text).toContain('ch_123');
  });
  
  // Edge case: Invalid amount
  it('should reject negative amounts', async () => {
    await expect(
      server.handleRequest({
        method: 'tools/call',
        params: {
          name: 'createCharge',
          arguments: {
            amount: -100,
            currency: 'usd'
          }
        }
      })
    ).rejects.toThrow('Amount must be positive');
  });
  
  // Edge case: Invalid currency
  it('should reject invalid currency codes', async () => {
    await expect(
      server.handleRequest({
        method: 'tools/call',
        params: {
          name: 'createCharge',
          arguments: {
            amount: 1000,
            currency: 'INVALID'
          }
        }
      })
    ).rejects.toThrow('Currency must be 3-letter code');
  });
  
  // Retry logic test
  it('should retry on network errors', async () => {
    let attempts = 0;
    global.fetch = jest.fn().mockImplementation(() => {
      attempts++;
      if (attempts < 3) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ id: 'ch_123' })
      });
    });
    
    const result = await server.handleRequest({
      method: 'tools/call',
      params: {
        name: 'createCharge',
        arguments: { amount: 1000, currency: 'usd' }
      }
    });
    
    expect(attempts).toBe(3);
    expect(result.content[0].text).toContain('ch_123');
  });
});
```

## Example 3: GraphQL API

### Prompt 1: API Analysis

**Input:**
```graphql
type Query {
  user(id: ID!): User
  posts(limit: Int = 10): [Post!]!
}

type Mutation {
  createPost(title: String!, content: String!): Post!
  deletePost(id: ID!): Boolean!
}
```

**Bob's Analysis:**
```json
{
  "queries": [
    {
      "name": "user",
      "mcpType": "resource",
      "reasoning": "GraphQL Query provides data - mapped to MCP Resource",
      "parameters": [{ "name": "id", "type": "string", "required": true }]
    },
    {
      "name": "posts",
      "mcpType": "resource",
      "reasoning": "GraphQL Query provides data - mapped to MCP Resource",
      "parameters": [{ "name": "limit", "type": "number", "required": false }]
    }
  ],
  "mutations": [
    {
      "name": "createPost",
      "mcpType": "tool",
      "reasoning": "GraphQL Mutation modifies data - mapped to MCP Tool",
      "parameters": [
        { "name": "title", "type": "string", "required": true },
        { "name": "content", "type": "string", "required": true }
      ]
    }
  ]
}
```

## Testing the Prompts

### Run Comprehensive Tests

```bash
# Build and test
npm run test:bob:build

# Or just test (if already built)
npm run test:bob
```

### Test Individual Prompts

```typescript
import {
  testPrompt1_APIAnalysis,
  testPrompt2_CodeGeneration,
  testPrompt3_TestGeneration
} from './tests/bob-prompt-testing';

// Test your API
const analysis = await testPrompt1_APIAnalysis('./my-api.yaml');
console.log(`Mapped ${analysis.summary.toolsCount} tools and ${analysis.summary.resourcesCount} resources`);

// Validate generated code
const codeQuality = await testPrompt2_CodeGeneration('./generated/index.ts', 'typescript');
console.log(`Code quality: ${codeQuality.score}%`);

// Validate tests
const testQuality = await testPrompt3_TestGeneration('./generated/tests/server.test.ts', './generated/index.ts', 'typescript');
console.log(`Test coverage: ${testQuality.testCoverage.total} test cases`);
```

## Best Practices

1. **Always validate the analysis** - Check that GET → Resource and POST/PUT/DELETE → Tool mappings are correct
2. **Review generated code** - Ensure error handling, validation, and logging are present
3. **Run the test suite** - Verify comprehensive test coverage
4. **Iterate on prompts** - If quality scores are low, refine the prompts
5. **Use real APIs** - Test with actual API specifications from your project

## Common Patterns

### Pattern 1: Read-Only API (All Resources)
```
GET /users → Resource
GET /posts → Resource
GET /comments → Resource
```

### Pattern 2: CRUD API (Mixed)
```
GET /items → Resource
POST /items → Tool
PUT /items/{id} → Tool
DELETE /items/{id} → Tool
```

### Pattern 3: Action-Based API (All Tools)
```
POST /send-email → Tool
POST /process-payment → Tool
POST /generate-report → Tool
```

## Troubleshooting

### Issue: Wrong MCP Type Assignment

**Problem:** POST endpoint mapped to Resource instead of Tool

**Solution:** Check the endpoint's side effects. If it modifies data, it should be a Tool.

### Issue: Missing Parameters

**Problem:** Required parameters not extracted from API spec

**Solution:** Ensure parameters are properly defined in the OpenAPI spec with `required: true`

### Issue: Low Code Quality Score

**Problem:** Generated code missing error handling or validation

**Solution:** Update the code generation templates to include these features

---

**Made with Bob** 🤖