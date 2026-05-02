/**
 * Bob Prompt Design Testing Suite
 * Tests the three-stage prompt design for MCP server generation
 */

import { parseOpenAPI } from '../src/parsers/openapi';
import { analyzeWithBob } from '../src/analyzers/bob';
import { GeneratorConfig } from '../src/cli/prompts';
import * as fs from 'fs/promises';
import * as path from 'path';

// ============================================================================
// PROMPT 1: API Analysis Testing
// ============================================================================

interface Prompt1Output {
  endpoints: Array<{
    path: string;
    method: string;
    mcpType: 'tool' | 'resource';
    parameters: any[];
    responseFormat: string;
    authRequired: boolean;
    reasoning: string;
  }>;
  summary: {
    totalEndpoints: number;
    toolsCount: number;
    resourcesCount: number;
    authMethods: string[];
  };
}

/**
 * Test Prompt 1: API Analysis
 * Validates that Bob correctly analyzes API specs and maps to MCP primitives
 */
export async function testPrompt1_APIAnalysis(apiSpecPath: string): Promise<Prompt1Output> {
  console.log('\n🔍 PROMPT 1: API ANALYSIS TEST\n');
  console.log('=' .repeat(60));
  
  // Parse the API specification
  const parsedAPI = await parseOpenAPI(apiSpecPath);
  
  // Create test config
  const config: GeneratorConfig = {
    inputType: 'openapi',
    inputPath: apiSpecPath,
    outputPath: './test-output',
    language: 'typescript',
    serverName: 'test-server',
    authMethods: ['bearer', 'apikey'],
    transports: ['stdio'],
    includeTests: true,
    includeDocker: false,
    includeK8s: false
  };
  
  // Analyze with Bob
  const analysis = await analyzeWithBob(parsedAPI, config);
  
  // Map to Prompt 1 output format
  const endpoints: Prompt1Output['endpoints'] = [];
  
  // Process resources (GET endpoints)
  for (const resource of analysis.resources) {
    endpoints.push({
      path: resource.endpoint.path,
      method: resource.endpoint.method,
      mcpType: 'resource',
      parameters: resource.endpoint.parameters,
      responseFormat: resource.mimeType,
      authRequired: analysis.authConfig.methods.length > 0,
      reasoning: `GET endpoint provides data - mapped to MCP Resource. Returns ${resource.mimeType} data.`
    });
  }
  
  // Process tools (POST/PUT/DELETE/PATCH endpoints)
  for (const tool of analysis.tools) {
    endpoints.push({
      path: tool.endpoint.path,
      method: tool.endpoint.method,
      mcpType: 'tool',
      parameters: tool.endpoint.parameters,
      responseFormat: 'application/json',
      authRequired: analysis.authConfig.methods.length > 0,
      reasoning: `${tool.endpoint.method} endpoint performs action - mapped to MCP Tool. Modifies server state.`
    });
  }
  
  const output: Prompt1Output = {
    endpoints,
    summary: {
      totalEndpoints: endpoints.length,
      toolsCount: analysis.tools.length,
      resourcesCount: analysis.resources.length,
      authMethods: analysis.authConfig.methods
    }
  };
  
  // Display results
  console.log('\n📊 Analysis Results:');
  console.log(`   Total Endpoints: ${output.summary.totalEndpoints}`);
  console.log(`   Tools (Actions): ${output.summary.toolsCount}`);
  console.log(`   Resources (Data): ${output.summary.resourcesCount}`);
  console.log(`   Auth Methods: ${output.summary.authMethods.join(', ')}`);
  
  console.log('\n📋 Endpoint Mapping:');
  for (const endpoint of endpoints) {
    console.log(`\n   ${endpoint.method} ${endpoint.path}`);
    console.log(`   → MCP Type: ${endpoint.mcpType.toUpperCase()}`);
    console.log(`   → Parameters: ${endpoint.parameters.length}`);
    console.log(`   → Auth Required: ${endpoint.authRequired}`);
    console.log(`   → Reasoning: ${endpoint.reasoning}`);
  }
  
  return output;
}

// ============================================================================
// PROMPT 2: Code Generation Testing
// ============================================================================

interface Prompt2Validation {
  hasErrorHandling: boolean;
  hasInputValidation: boolean;
  hasAuthentication: boolean;
  hasLogging: boolean;
  hasCorrectTransport: boolean;
  hasComments: boolean;
  issues: string[];
  score: number;
}

/**
 * Test Prompt 2: Code Generation
 * Validates generated code quality and best practices
 */
export async function testPrompt2_CodeGeneration(
  generatedCodePath: string,
  language: 'typescript' | 'python'
): Promise<Prompt2Validation> {
  console.log('\n🔨 PROMPT 2: CODE GENERATION TEST\n');
  console.log('=' .repeat(60));
  
  const code = await fs.readFile(generatedCodePath, 'utf-8');
  const validation: Prompt2Validation = {
    hasErrorHandling: false,
    hasInputValidation: false,
    hasAuthentication: false,
    hasLogging: false,
    hasCorrectTransport: false,
    hasComments: false,
    issues: [],
    score: 0
  };
  
  // Check for error handling
  if (language === 'typescript') {
    validation.hasErrorHandling = /try\s*{[\s\S]*?}\s*catch/.test(code);
    validation.hasInputValidation = /z\.object|zod/.test(code);
    validation.hasAuthentication = /authorization|bearer|api[_-]?key/i.test(code);
    validation.hasLogging = /console\.error|logger\.error|stderr/.test(code);
    validation.hasCorrectTransport = /StdioServerTransport|stdio/.test(code);
    validation.hasComments = /\/\*\*[\s\S]*?\*\/|\/\//.test(code);
  } else {
    validation.hasErrorHandling = /try:[\s\S]*?except/.test(code);
    validation.hasInputValidation = /pydantic|BaseModel/.test(code);
    validation.hasAuthentication = /authorization|bearer|api[_-]?key/i.test(code);
    validation.hasLogging = /logging\.|logger\.|sys\.stderr/.test(code);
    validation.hasCorrectTransport = /stdio|StdioServerTransport/.test(code);
    validation.hasComments = /("""[\s\S]*?"""|#)/.test(code);
  }
  
  // Validate each requirement
  const checks = [
    { name: 'Error Handling', passed: validation.hasErrorHandling },
    { name: 'Input Validation', passed: validation.hasInputValidation },
    { name: 'Authentication', passed: validation.hasAuthentication },
    { name: 'Logging to stderr', passed: validation.hasLogging },
    { name: 'Correct Transport', passed: validation.hasCorrectTransport },
    { name: 'Comprehensive Comments', passed: validation.hasComments }
  ];
  
  console.log('\n✅ Code Quality Checks:');
  for (const check of checks) {
    const status = check.passed ? '✓' : '✗';
    const color = check.passed ? '\x1b[32m' : '\x1b[31m';
    console.log(`   ${color}${status}\x1b[0m ${check.name}`);
    
    if (!check.passed) {
      validation.issues.push(`Missing: ${check.name}`);
    } else {
      validation.score += 1;
    }
  }
  
  validation.score = Math.round((validation.score / checks.length) * 100);
  
  console.log(`\n📊 Quality Score: ${validation.score}%`);
  
  if (validation.issues.length > 0) {
    console.log('\n⚠️  Issues Found:');
    validation.issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  return validation;
}

// ============================================================================
// PROMPT 3: Test Generation Testing
// ============================================================================

interface Prompt3Validation {
  hasUnitTests: boolean;
  hasIntegrationTests: boolean;
  hasMockResponses: boolean;
  hasEdgeCases: boolean;
  hasAuthTests: boolean;
  testCoverage: {
    tools: number;
    resources: number;
    total: number;
  };
  issues: string[];
  score: number;
}

/**
 * Test Prompt 3: Test Generation
 * Validates test suite completeness and quality
 */
export async function testPrompt3_TestGeneration(
  testFilePath: string,
  serverCodePath: string,
  language: 'typescript' | 'python'
): Promise<Prompt3Validation> {
  console.log('\n🧪 PROMPT 3: TEST GENERATION TEST\n');
  console.log('=' .repeat(60));
  
  const testCode = await fs.readFile(testFilePath, 'utf-8');
  const serverCode = await fs.readFile(serverCodePath, 'utf-8');
  
  const validation: Prompt3Validation = {
    hasUnitTests: false,
    hasIntegrationTests: false,
    hasMockResponses: false,
    hasEdgeCases: false,
    hasAuthTests: false,
    testCoverage: {
      tools: 0,
      resources: 0,
      total: 0
    },
    issues: [],
    score: 0
  };
  
  // Check test types
  if (language === 'typescript') {
    validation.hasUnitTests = /describe\(['"].*unit.*['"]/i.test(testCode);
    validation.hasIntegrationTests = /describe\(['"].*integration.*['"]/i.test(testCode);
    validation.hasMockResponses = /jest\.mock|nock|mock/.test(testCode);
    validation.hasEdgeCases = /edge case|error|invalid|null|undefined/i.test(testCode);
    validation.hasAuthTests = /auth|token|bearer|api[_-]?key/i.test(testCode);
    
    // Count test cases
    const testMatches = testCode.match(/it\(['"]|test\(['"]/g);
    validation.testCoverage.total = testMatches ? testMatches.length : 0;
  } else {
    validation.hasUnitTests = /def test_.*unit|class.*Unit.*Test/i.test(testCode);
    validation.hasIntegrationTests = /def test_.*integration|class.*Integration.*Test/i.test(testCode);
    validation.hasMockResponses = /@mock|@patch|Mock\(|MagicMock/.test(testCode);
    validation.hasEdgeCases = /edge case|error|invalid|none|null/i.test(testCode);
    validation.hasAuthTests = /auth|token|bearer|api[_-]?key/i.test(testCode);
    
    // Count test cases
    const testMatches = testCode.match(/def test_/g);
    validation.testCoverage.total = testMatches ? testMatches.length : 0;
  }
  
  // Estimate coverage based on server code
  const toolMatches = serverCode.match(/server\.add_tool|addTool/g);
  const resourceMatches = serverCode.match(/server\.add_resource|addResource/g);
  
  validation.testCoverage.tools = toolMatches ? toolMatches.length : 0;
  validation.testCoverage.resources = resourceMatches ? resourceMatches.length : 0;
  
  // Validate each requirement
  const checks = [
    { name: 'Unit Tests', passed: validation.hasUnitTests },
    { name: 'Integration Tests', passed: validation.hasIntegrationTests },
    { name: 'Mock API Responses', passed: validation.hasMockResponses },
    { name: 'Edge Case Handling', passed: validation.hasEdgeCases },
    { name: 'Authentication Tests', passed: validation.hasAuthTests }
  ];
  
  console.log('\n✅ Test Suite Checks:');
  for (const check of checks) {
    const status = check.passed ? '✓' : '✗';
    const color = check.passed ? '\x1b[32m' : '\x1b[31m';
    console.log(`   ${color}${status}\x1b[0m ${check.name}`);
    
    if (!check.passed) {
      validation.issues.push(`Missing: ${check.name}`);
    } else {
      validation.score += 1;
    }
  }
  
  validation.score = Math.round((validation.score / checks.length) * 100);
  
  console.log(`\n📊 Test Coverage:`);
  console.log(`   Total Test Cases: ${validation.testCoverage.total}`);
  console.log(`   Tools in Server: ${validation.testCoverage.tools}`);
  console.log(`   Resources in Server: ${validation.testCoverage.resources}`);
  console.log(`\n📊 Quality Score: ${validation.score}%`);
  
  if (validation.issues.length > 0) {
    console.log('\n⚠️  Issues Found:');
    validation.issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  return validation;
}

// ============================================================================
// COMPREHENSIVE TEST RUNNER
// ============================================================================

export async function runComprehensiveBobTest() {
  console.log('\n' + '='.repeat(60));
  console.log('🤖 BOB PROMPT DESIGN COMPREHENSIVE TEST SUITE');
  console.log('='.repeat(60));
  
  const results = {
    prompt1: null as Prompt1Output | null,
    prompt2: null as Prompt2Validation | null,
    prompt3: null as Prompt3Validation | null,
    overallScore: 0
  };
  
  try {
    // Test Prompt 1: API Analysis
    results.prompt1 = await testPrompt1_APIAnalysis('./examples/github-api.yaml');
    
    // Test Prompt 2: Code Generation
    const serverPath = './test-github-server/src/index.ts';
    results.prompt2 = await testPrompt2_CodeGeneration(serverPath, 'typescript');
    
    // Test Prompt 3: Test Generation
    const testPath = './test-github-server/tests/server.test.ts';
    results.prompt3 = await testPrompt3_TestGeneration(testPath, serverPath, 'typescript');
    
    // Calculate overall score
    const scores = [
      results.prompt2?.score || 0,
      results.prompt3?.score || 0
    ];
    results.overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    
    // Final Report
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL REPORT');
    console.log('='.repeat(60));
    
    console.log('\n✅ Prompt 1 (API Analysis):');
    console.log(`   Endpoints Analyzed: ${results.prompt1?.summary.totalEndpoints}`);
    console.log(`   Tools Generated: ${results.prompt1?.summary.toolsCount}`);
    console.log(`   Resources Generated: ${results.prompt1?.summary.resourcesCount}`);
    
    console.log('\n✅ Prompt 2 (Code Generation):');
    console.log(`   Quality Score: ${results.prompt2?.score}%`);
    console.log(`   Issues: ${results.prompt2?.issues.length}`);
    
    console.log('\n✅ Prompt 3 (Test Generation):');
    console.log(`   Quality Score: ${results.prompt3?.score}%`);
    console.log(`   Test Cases: ${results.prompt3?.testCoverage.total}`);
    console.log(`   Issues: ${results.prompt3?.issues.length}`);
    
    console.log(`\n🎯 Overall Score: ${results.overallScore}%`);
    
    if (results.overallScore >= 80) {
      console.log('\n✨ EXCELLENT! Bob prompt design is working well.');
    } else if (results.overallScore >= 60) {
      console.log('\n⚠️  GOOD, but needs improvement in some areas.');
    } else {
      console.log('\n❌ NEEDS WORK. Review the issues above.');
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    return results;
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  }
}

// Export for use in other tests
export {
  Prompt1Output,
  Prompt2Validation,
  Prompt3Validation
};

// Made with Bob
