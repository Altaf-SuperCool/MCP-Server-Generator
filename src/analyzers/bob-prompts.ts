/**
 * Bob AI Prompt Integration for MCP Server Generation
 * 
 * This module implements the three-stage prompt strategy:
 * 1. API Analysis - Map endpoints to MCP primitives
 * 2. Code Generation - Generate production-ready server code
 * 3. Test Generation - Create comprehensive test suites
 */

import axios from 'axios';
import { ParsedAPI } from '../parsers/openapi.js';
import { ParsedGraphQL } from '../parsers/graphql.js';
import { GeneratorConfig } from '../cli/prompts.js';

export interface BobPromptConfig {
  apiKey?: string;
  endpoint?: string;
  model?: string;
  useAI?: boolean; // Toggle between AI and rule-based
}

/**
 * Stage 1: API Analysis Prompt
 * Analyzes API specification and maps endpoints to MCP primitives
 */
export function getPrompt1_APIAnalysis(apiSpec: string): string {
  return `You are an expert at analyzing API specifications and mapping them to MCP primitives.

Given this API specification:
${apiSpec}

Analyze each endpoint and determine:
1. Should it be an MCP Tool (performs action) or Resource (provides data)?
   - GET endpoints → MCP Resources (read-only data)
   - POST/PUT/DELETE/PATCH → MCP Tools (actions with side effects)
2. What parameters does it need?
3. What is the expected response format?
4. Are there authentication requirements?

Output a JSON mapping in this exact format:
{
  "endpoints": [
    {
      "path": "/endpoint/path",
      "method": "GET",
      "mcpType": "resource",
      "name": "descriptiveName",
      "description": "What this endpoint does",
      "parameters": [
        {
          "name": "paramName",
          "type": "string",
          "required": true,
          "location": "path|query|header"
        }
      ],
      "authentication": {
        "required": true,
        "type": "bearer|apikey|oauth2|basic"
      }
    }
  ]
}

Rules:
- Use camelCase for names
- Be descriptive but concise
- Identify all parameters including path, query, and body params
- Detect authentication from security schemes`;
}

/**
 * Stage 2: Code Generation Prompt
 * Generates production-ready MCP server code
 */
export function getPrompt2_CodeGeneration(
  analysis: any,
  language: 'typescript' | 'python',
  config: GeneratorConfig
): string {
  const validationLib = language === 'typescript' ? 'Zod' : 'Pydantic';
  const authTypes = config.authMethods.join(', ');
  const transport = config.transport || 'stdio';

  return `Generate a production-ready MCP server in ${language} with the following requirements:

API Analysis:
${JSON.stringify(analysis, null, 2)}

Requirements:
1. **Error Handling**: Wrap all API calls in try/catch blocks
2. **Input Validation**: Use ${validationLib} to validate all inputs
3. **Authentication**: Implement ${authTypes} authentication
4. **Logging**: Log to stderr (not stdout) for debugging
5. **Transport**: Use ${transport.toUpperCase()} transport protocol
6. **Retry Logic**: Implement exponential backoff for failed requests (max 3 retries)
7. **Comments**: Add comprehensive JSDoc/docstring comments

Code Structure:
${language === 'typescript' ? `
- Use @modelcontextprotocol/sdk
- Create a class-based server
- Use Zod for schema validation
- Use axios for HTTP requests
- Export async run() method
` : `
- Use mcp and FastMCP
- Use Pydantic for validation
- Use httpx for async HTTP requests
- Implement proper async/await patterns
`}

Authentication Implementation:
${authTypes.includes('bearer') ? '- Add Bearer token to Authorization header' : ''}
${authTypes.includes('apikey') ? '- Add API key to headers or query params' : ''}
${authTypes.includes('oauth2') ? '- Implement OAuth2 flow' : ''}
${authTypes.includes('basic') ? '- Add Basic auth credentials' : ''}

Generate ONLY the server code, no explanations. Include:
- All imports
- Validation schemas
- Server class
- Tool/Resource handlers
- Error handling
- Retry logic
- Main execution`;
}

/**
 * Stage 3: Test Generation Prompt
 * Creates comprehensive test suite
 */
export function getPrompt3_TestGeneration(
  serverCode: string,
  language: 'typescript' | 'python'
): string {
  const testFramework = language === 'typescript' ? 'Jest' : 'Pytest';

  return `Create comprehensive tests for this MCP server using ${testFramework}:

Server Code:
${serverCode}

Generate tests that include:

1. **Unit Tests**: Test each tool and resource individually
   - Mock all external API calls
   - Test with valid inputs
   - Test with invalid inputs
   - Test edge cases

2. **Integration Tests**: Test the full server flow
   - Test server initialization
   - Test MCP protocol communication
   - Test multiple requests in sequence

3. **Mock API Responses**: Create realistic mock data
   - Success responses
   - Error responses (4xx, 5xx)
   - Network errors

4. **Edge Cases**:
   - Empty parameters
   - Invalid data types
   - Missing required fields
   - Rate limiting scenarios

5. **Authentication Tests**:
   - Test with valid credentials
   - Test with invalid credentials
   - Test with missing credentials

Test Structure:
${language === 'typescript' ? `
- Use Jest with @jest/globals
- Mock axios/fetch calls
- Use describe/it blocks
- Include beforeEach/afterEach setup
` : `
- Use pytest with fixtures
- Mock httpx calls
- Use async test functions
- Include setup/teardown
`}

Generate ONLY the test code, no explanations. Include:
- All imports
- Mock setup
- Test cases for each endpoint
- Edge case tests
- Authentication tests`;
}

/**
 * Execute Bob AI prompts using an AI service
 */
export async function executeBobPrompt(
  prompt: string,
  config: BobPromptConfig
): Promise<string> {
  // If AI is disabled, return a message
  if (!config.useAI) {
    return JSON.stringify({
      message: 'AI prompts disabled. Using rule-based generation.',
      prompt: prompt.substring(0, 200) + '...'
    });
  }

  // Default to OpenAI-compatible endpoint
  const endpoint = config.endpoint || 'https://api.openai.com/v1/chat/completions';
  const apiKey = config.apiKey || process.env.OPENAI_API_KEY || process.env.BOB_API_KEY;
  const model = config.model || 'gpt-4';

  if (!apiKey) {
    throw new Error('API key required for AI prompts. Set OPENAI_API_KEY or BOB_API_KEY environment variable.');
  }

  try {
    const response = await axios.post(
      endpoint,
      {
        model,
        messages: [
          {
            role: 'system',
            content: 'You are Bob, an expert AI assistant specialized in generating MCP servers from API specifications.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error: any) {
    throw new Error(`Bob AI prompt failed: ${error.message}`);
  }
}

/**
 * Run all three Bob prompts in sequence
 */
export async function runBobPromptPipeline(
  apiSpec: string,
  config: GeneratorConfig,
  bobConfig: BobPromptConfig
): Promise<{
  analysis: any;
  code: string;
  tests: string;
}> {
  console.error('🤖 Stage 1: Analyzing API with Bob...');
  const prompt1 = getPrompt1_APIAnalysis(apiSpec);
  const analysisResponse = await executeBobPrompt(prompt1, bobConfig);
  const analysis = JSON.parse(analysisResponse);

  console.error('🤖 Stage 2: Generating server code with Bob...');
  const prompt2 = getPrompt2_CodeGeneration(analysis, config.language, config);
  const code = await executeBobPrompt(prompt2, bobConfig);

  console.error('🤖 Stage 3: Generating tests with Bob...');
  const prompt3 = getPrompt3_TestGeneration(code, config.language);
  const tests = await executeBobPrompt(prompt3, bobConfig);

  return { analysis, code, tests };
}

/**
 * Display prompts for manual use (copy-paste to AI)
 */
export function displayPromptsForManualUse(
  apiSpec: string,
  config: GeneratorConfig
): void {
  console.log('\n' + '='.repeat(80));
  console.log('📋 BOB PROMPT 1: API ANALYSIS');
  console.log('='.repeat(80));
  console.log(getPrompt1_APIAnalysis(apiSpec));
  
  console.log('\n' + '='.repeat(80));
  console.log('📋 BOB PROMPT 2: CODE GENERATION');
  console.log('='.repeat(80));
  console.log('After getting the analysis from Prompt 1, use this prompt:');
  console.log(getPrompt2_CodeGeneration({ placeholder: 'Insert analysis here' }, config.language, config));
  
  console.log('\n' + '='.repeat(80));
  console.log('📋 BOB PROMPT 3: TEST GENERATION');
  console.log('='.repeat(80));
  console.log('After getting the code from Prompt 2, use this prompt:');
  console.log(getPrompt3_TestGeneration('// Insert server code here', config.language));
  
  console.log('\n' + '='.repeat(80));
  console.log('💡 USAGE INSTRUCTIONS');
  console.log('='.repeat(80));
  console.log('1. Copy Prompt 1 and paste it into your AI assistant (Claude, ChatGPT, etc.)');
  console.log('2. Copy the JSON analysis response');
  console.log('3. Use Prompt 2 with the analysis to generate server code');
  console.log('4. Use Prompt 3 with the server code to generate tests');
  console.log('5. Save the generated files to your project');
  console.log('='.repeat(80) + '\n');
}

// Made with Bob