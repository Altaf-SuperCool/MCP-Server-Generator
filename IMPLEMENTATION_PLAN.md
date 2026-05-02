# MCP Server Generator - Implementation Plan

## Executive Summary

This document provides a detailed, step-by-step implementation plan for building the MCP Server Generator. Each section includes technical specifications, code examples, and acceptance criteria.

## Phase 1: Foundation Setup

### 1.1 Project Initialization

**Objective**: Set up the project structure and development environment.

**Tasks**:
1. Initialize Node.js project with TypeScript
2. Configure build tools and linting
3. Set up testing framework
4. Create directory structure

**Commands**:
```bash
npm init -y
npm install -D typescript @types/node ts-node
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier
npm install -D jest @types/jest ts-jest
npx tsc --init
```

**Configuration Files**:

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

`package.json` scripts:
```json
{
  "scripts": {
    "build": "tsc",
    "dev": "ts-node src/cli/index.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  }
}
```

**Acceptance Criteria**:
- ✅ Project compiles without errors
- ✅ Linting passes
- ✅ Test framework runs successfully
- ✅ Directory structure matches architecture

### 1.2 CLI Framework Setup

**Objective**: Create the command-line interface with interactive prompts.

**Dependencies**:
```bash
npm install commander inquirer chalk ora
npm install -D @types/inquirer
```

**Core CLI Structure** (`src/cli/index.ts`):
```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { generateServer } from './commands/generate';
import { version } from '../../package.json';

const program = new Command();

program
  .name('mcp-gen')
  .description('Generate MCP servers from API specifications')
  .version(version);

program
  .command('generate')
  .description('Generate a new MCP server')
  .option('-i, --input <path>', 'Path to API specification file')
  .option('-o, --output <path>', 'Output directory')
  .option('-l, --language <lang>', 'Target language (typescript|python)')
  .option('--no-interactive', 'Disable interactive mode')
  .action(generateServer);

program.parse();
```

**Interactive Prompts** (`src/cli/prompts.ts`):
```typescript
import inquirer from 'inquirer';

export interface GeneratorConfig {
  inputType: 'openapi' | 'graphql' | 'rest';
  inputPath: string;
  outputPath: string;
  language: 'typescript' | 'python';
  serverName: string;
  authMethods: string[];
  transports: string[];
  includeTests: boolean;
  includeDocker: boolean;
  includeK8s: boolean;
}

export async function promptForConfig(): Promise<GeneratorConfig> {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'inputType',
      message: 'What type of API specification do you have?',
      choices: [
        { name: 'OpenAPI/Swagger', value: 'openapi' },
        { name: 'GraphQL Schema', value: 'graphql' },
        { name: 'REST Endpoint Descriptor', value: 'rest' }
      ]
    },
    {
      type: 'input',
      name: 'inputPath',
      message: 'Path to your API specification file:',
      validate: (input) => input.length > 0 || 'Path is required'
    },
    {
      type: 'input',
      name: 'outputPath',
      message: 'Output directory:',
      default: './generated-server'
    },
    {
      type: 'list',
      name: 'language',
      message: 'Target language:',
      choices: ['typescript', 'python']
    },
    {
      type: 'input',
      name: 'serverName',
      message: 'Server name:',
      default: 'my-mcp-server'
    },
    {
      type: 'checkbox',
      name: 'authMethods',
      message: 'Authentication methods to support:',
      choices: [
        { name: 'API Key', value: 'apikey', checked: true },
        { name: 'Bearer Token', value: 'bearer', checked: true },
        { name: 'OAuth2', value: 'oauth2' },
        { name: 'Basic Auth', value: 'basic' }
      ]
    },
    {
      type: 'checkbox',
      name: 'transports',
      message: 'Transport protocols:',
      choices: [
        { name: 'STDIO', value: 'stdio', checked: true },
        { name: 'HTTP', value: 'http', checked: true }
      ]
    },
    {
      type: 'confirm',
      name: 'includeTests',
      message: 'Generate test suite?',
      default: true
    },
    {
      type: 'confirm',
      name: 'includeDocker',
      message: 'Generate Docker configuration?',
      default: true
    },
    {
      type: 'confirm',
      name: 'includeK8s',
      message: 'Generate Kubernetes manifests?',
      default: false
    }
  ]);

  return answers;
}
```

**Acceptance Criteria**:
- ✅ CLI runs with `mcp-gen` command
- ✅ Interactive prompts collect all required information
- ✅ Non-interactive mode works with CLI flags
- ✅ Help text displays correctly
- ✅ Version command works

## Phase 2: Input Parsers

### 2.1 OpenAPI Parser

**Objective**: Parse OpenAPI 3.x and Swagger 2.0 specifications.

**Dependencies**:
```bash
npm install swagger-parser openapi-types
npm install -D @types/swagger-parser
```

**Implementation** (`src/parsers/openapi.ts`):
```typescript
import SwaggerParser from 'swagger-parser';
import { OpenAPIV3 } from 'openapi-types';

export interface ParsedEndpoint {
  path: string;
  method: string;
  operationId: string;
  summary?: string;
  description?: string;
  parameters: Parameter[];
  requestBody?: RequestBody;
  responses: Record<string, Response>;
  security?: SecurityRequirement[];
}

export interface ParsedAPI {
  title: string;
  version: string;
  baseUrl: string;
  endpoints: ParsedEndpoint[];
  schemas: Record<string, any>;
  securitySchemes: Record<string, SecurityScheme>;
}

export async function parseOpenAPI(filePath: string): Promise<ParsedAPI> {
  const api = await SwaggerParser.validate(filePath) as OpenAPIV3.Document;
  
  const endpoints: ParsedEndpoint[] = [];
  
  for (const [path, pathItem] of Object.entries(api.paths)) {
    if (!pathItem) continue;
    
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!isOperation(method)) continue;
      
      endpoints.push({
        path,
        method: method.toUpperCase(),
        operationId: operation.operationId || `${method}${path}`,
        summary: operation.summary,
        description: operation.description,
        parameters: parseParameters(operation.parameters),
        requestBody: parseRequestBody(operation.requestBody),
        responses: operation.responses,
        security: operation.security
      });
    }
  }
  
  return {
    title: api.info.title,
    version: api.info.version,
    baseUrl: getBaseUrl(api),
    endpoints,
    schemas: api.components?.schemas || {},
    securitySchemes: api.components?.securitySchemes || {}
  };
}

function isOperation(method: string): boolean {
  return ['get', 'post', 'put', 'delete', 'patch'].includes(method);
}

function getBaseUrl(api: OpenAPIV3.Document): string {
  if (api.servers && api.servers.length > 0) {
    return api.servers[0].url;
  }
  return '';
}

function parseParameters(params?: any[]): Parameter[] {
  if (!params) return [];
  return params.map(p => ({
    name: p.name,
    in: p.in,
    required: p.required || false,
    schema: p.schema,
    description: p.description
  }));
}

function parseRequestBody(body?: any): RequestBody | undefined {
  if (!body) return undefined;
  return {
    required: body.required || false,
    content: body.content
  };
}
```

**Acceptance Criteria**:
- ✅ Parses OpenAPI 3.x specifications
- ✅ Parses Swagger 2.0 specifications
- ✅ Extracts all endpoints with metadata
- ✅ Handles security schemes
- ✅ Validates specification format
- ✅ Provides clear error messages

### 2.2 GraphQL Parser

**Objective**: Parse GraphQL schema definitions.

**Dependencies**:
```bash
npm install graphql @graphql-tools/schema
```

**Implementation** (`src/parsers/graphql.ts`):
```typescript
import { parse, buildSchema, GraphQLSchema } from 'graphql';
import { readFileSync } from 'fs';

export interface GraphQLField {
  name: string;
  type: string;
  args: GraphQLArgument[];
  description?: string;
}

export interface GraphQLArgument {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface ParsedGraphQL {
  queries: GraphQLField[];
  mutations: GraphQLField[];
  subscriptions: GraphQLField[];
  types: Record<string, any>;
}

export async function parseGraphQL(filePath: string): Promise<ParsedGraphQL> {
  const schemaString = readFileSync(filePath, 'utf-8');
  const schema = buildSchema(schemaString);
  
  const queryType = schema.getQueryType();
  const mutationType = schema.getMutationType();
  const subscriptionType = schema.getSubscriptionType();
  
  return {
    queries: queryType ? extractFields(queryType) : [],
    mutations: mutationType ? extractFields(mutationType) : [],
    subscriptions: subscriptionType ? extractFields(subscriptionType) : [],
    types: extractTypes(schema)
  };
}

function extractFields(type: any): GraphQLField[] {
  const fields = type.getFields();
  return Object.values(fields).map((field: any) => ({
    name: field.name,
    type: field.type.toString(),
    args: field.args.map((arg: any) => ({
      name: arg.name,
      type: arg.type.toString(),
      required: arg.type.toString().endsWith('!'),
      description: arg.description
    })),
    description: field.description
  }));
}

function extractTypes(schema: GraphQLSchema): Record<string, any> {
  const typeMap = schema.getTypeMap();
  const types: Record<string, any> = {};
  
  for (const [name, type] of Object.entries(typeMap)) {
    if (!name.startsWith('__')) {
      types[name] = type;
    }
  }
  
  return types;
}
```

**Acceptance Criteria**:
- ✅ Parses GraphQL SDL files
- ✅ Extracts queries, mutations, subscriptions
- ✅ Captures field arguments and types
- ✅ Handles custom types
- ✅ Validates schema syntax

### 2.3 REST Descriptor Parser

**Objective**: Parse custom REST endpoint descriptors.

**Implementation** (`src/parsers/rest.ts`):
```typescript
import { readFileSync } from 'fs';
import { parse as parseYAML } from 'yaml';

export interface RESTEndpoint {
  path: string;
  method: string;
  description?: string;
  parameters?: RESTParameter[];
  headers?: Record<string, string>;
  body?: any;
  response?: any;
}

export interface RESTParameter {
  name: string;
  in: 'query' | 'path' | 'header';
  type: string;
  required: boolean;
  description?: string;
}

export interface ParsedREST {
  name: string;
  baseUrl: string;
  endpoints: RESTEndpoint[];
  auth?: {
    type: string;
    config: Record<string, any>;
  };
}

export async function parseREST(filePath: string): Promise<ParsedREST> {
  const content = readFileSync(filePath, 'utf-8');
  const data = filePath.endsWith('.json') 
    ? JSON.parse(content)
    : parseYAML(content);
  
  validateRESTDescriptor(data);
  
  return {
    name: data.name,
    baseUrl: data.baseUrl,
    endpoints: data.endpoints.map(normalizeEndpoint),
    auth: data.auth
  };
}

function validateRESTDescriptor(data: any): void {
  if (!data.name) throw new Error('REST descriptor must have a name');
  if (!data.baseUrl) throw new Error('REST descriptor must have a baseUrl');
  if (!Array.isArray(data.endpoints)) {
    throw new Error('REST descriptor must have an endpoints array');
  }
}

function normalizeEndpoint(endpoint: any): RESTEndpoint {
  return {
    path: endpoint.path,
    method: (endpoint.method || 'GET').toUpperCase(),
    description: endpoint.description,
    parameters: endpoint.parameters || [],
    headers: endpoint.headers || {},
    body: endpoint.body,
    response: endpoint.response
  };
}
```

**REST Descriptor Format**:
```yaml
name: My REST API
baseUrl: https://api.example.com
auth:
  type: bearer
  config:
    tokenUrl: https://auth.example.com/token
endpoints:
  - path: /users
    method: GET
    description: List all users
    parameters:
      - name: limit
        in: query
        type: integer
        required: false
      - name: offset
        in: query
        type: integer
        required: false
    response:
      type: array
      items:
        type: object
  - path: /users/{id}
    method: GET
    description: Get user by ID
    parameters:
      - name: id
        in: path
        type: string
        required: true
```

**Acceptance Criteria**:
- ✅ Parses JSON and YAML formats
- ✅ Validates required fields
- ✅ Normalizes endpoint definitions
- ✅ Handles authentication configuration
- ✅ Provides helpful error messages

## Phase 3: Analysis & Mapping

### 3.1 API Analyzer

**Objective**: Analyze parsed API data and prepare for code generation.

**Implementation** (`src/analyzers/api-analyzer.ts`):
```typescript
import { ParsedAPI } from '../parsers/openapi';
import { ParsedGraphQL } from '../parsers/graphql';
import { ParsedREST } from '../parsers/rest';

export interface AnalyzedAPI {
  name: string;
  baseUrl: string;
  tools: ToolDefinition[];
  resources: ResourceDefinition[];
  authConfig: AuthConfig;
  metadata: APIMetadata;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: any;
  endpoint: {
    method: string;
    path: string;
    parameters: any[];
    body?: any;
  };
}

export interface ResourceDefinition {
  name: string;
  description: string;
  uri: string;
  mimeType: string;
  endpoint: {
    method: string;
    path: string;
    parameters: any[];
  };
}

export class APIAnalyzer {
  analyze(parsedData: ParsedAPI | ParsedGraphQL | ParsedREST): AnalyzedAPI {
    if (this.isOpenAPI(parsedData)) {
      return this.analyzeOpenAPI(parsedData);
    } else if (this.isGraphQL(parsedData)) {
      return this.analyzeGraphQL(parsedData);
    } else {
      return this.analyzeREST(parsedData);
    }
  }
  
  private analyzeOpenAPI(api: ParsedAPI): AnalyzedAPI {
    const tools: ToolDefinition[] = [];
    const resources: ResourceDefinition[] = [];
    
    for (const endpoint of api.endpoints) {
      if (endpoint.method === 'GET') {
        resources.push(this.endpointToResource(endpoint));
      } else {
        tools.push(this.endpointToTool(endpoint));
      }
    }
    
    return {
      name: api.title,
      baseUrl: api.baseUrl,
      tools,
      resources,
      authConfig: this.extractAuthConfig(api.securitySchemes),
      metadata: {
        version: api.version,
        endpoints: api.endpoints.length,
        schemas: Object.keys(api.schemas).length
      }
    };
  }
  
  private endpointToTool(endpoint: any): ToolDefinition {
    return {
      name: this.generateToolName(endpoint),
      description: endpoint.description || endpoint.summary || '',
      inputSchema: this.generateInputSchema(endpoint),
      endpoint: {
        method: endpoint.method,
        path: endpoint.path,
        parameters: endpoint.parameters,
        body: endpoint.requestBody
      }
    };
  }
  
  private endpointToResource(endpoint: any): ResourceDefinition {
    return {
      name: this.generateResourceName(endpoint),
      description: endpoint.description || endpoint.summary || '',
      uri: `resource://${endpoint.path}`,
      mimeType: 'application/json',
      endpoint: {
        method: endpoint.method,
        path: endpoint.path,
        parameters: endpoint.parameters
      }
    };
  }
  
  private generateToolName(endpoint: any): string {
    if (endpoint.operationId) {
      return this.camelCase(endpoint.operationId);
    }
    const pathParts = endpoint.path.split('/').filter(Boolean);
    return this.camelCase(`${endpoint.method}_${pathParts.join('_')}`);
  }
  
  private generateResourceName(endpoint: any): string {
    const pathParts = endpoint.path.split('/').filter(Boolean);
    return pathParts.join('_');
  }
  
  private camelCase(str: string): string {
    return str.replace(/[-_](.)/g, (_, c) => c.toUpperCase());
  }
  
  private generateInputSchema(endpoint: any): any {
    const properties: Record<string, any> = {};
    const required: string[] = [];
    
    for (const param of endpoint.parameters || []) {
      properties[param.name] = {
        type: this.mapType(param.schema?.type || 'string'),
        description: param.description
      };
      if (param.required) {
        required.push(param.name);
      }
    }
    
    return {
      type: 'object',
      properties,
      required
    };
  }
  
  private mapType(type: string): string {
    const typeMap: Record<string, string> = {
      'integer': 'number',
      'int': 'number',
      'float': 'number',
      'double': 'number',
      'boolean': 'boolean',
      'string': 'string',
      'array': 'array',
      'object': 'object'
    };
    return typeMap[type] || 'string';
  }
  
  private extractAuthConfig(securitySchemes: any): AuthConfig {
    // Implementation for extracting auth configuration
    return {
      methods: [],
      config: {}
    };
  }
  
  private isOpenAPI(data: any): data is ParsedAPI {
    return 'endpoints' in data && 'schemas' in data;
  }
  
  private isGraphQL(data: any): data is ParsedGraphQL {
    return 'queries' in data && 'mutations' in data;
  }
  
  private analyzeGraphQL(api: ParsedGraphQL): AnalyzedAPI {
    // Implementation for GraphQL analysis
    throw new Error('Not implemented');
  }
  
  private analyzeREST(api: ParsedREST): AnalyzedAPI {
    // Implementation for REST analysis
    throw new Error('Not implemented');
  }
}
```

**Acceptance Criteria**:
- ✅ Correctly identifies tools vs resources
- ✅ Generates appropriate names
- ✅ Creates valid input schemas
- ✅ Extracts authentication configuration
- ✅ Handles all three input types

## Phase 4: Code Generation

### 4.1 TypeScript Generator

**Objective**: Generate complete TypeScript MCP server code.

**Template Structure** (`src/generators/typescript/templates/`):
- `server.hbs` - Main server file
- `tool.hbs` - Individual tool template
- `resource.hbs` - Individual resource template
- `auth.hbs` - Authentication middleware
- `transport.hbs` - Transport configuration

**Generator Implementation** (`src/generators/typescript/server.ts`):
```typescript
import Handlebars from 'handlebars';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { AnalyzedAPI } from '../../analyzers/api-analyzer';
import { GeneratorConfig } from '../../cli/prompts';

export class TypeScriptGenerator {
  private templates: Map<string, HandlebarsTemplateDelegate>;
  
  constructor() {
    this.templates = new Map();
    this.loadTemplates();
  }
  
  async generate(api: AnalyzedAPI, config: GeneratorConfig): Promise<void> {
    const outputDir = config.outputPath;
    
    // Create directory structure
    this.createDirectoryStructure(outputDir);
    
    // Generate main server file
    await this.generateServerFile(api, config, outputDir);
    
    // Generate tools
    await this.generateTools(api.tools, outputDir);
    
    // Generate resources
    await this.generateResources(api.resources, outputDir);
    
    // Generate authentication
    await this.generateAuth(api.authConfig, config, outputDir);
    
    // Generate transport configuration
    await this.generateTransport(config, outputDir);
    
    // Generate package.json
    await this.generatePackageJson(api, config, outputDir);
    
    // Generate tsconfig.json
    await this.generateTsConfig(outputDir);
  }
  
  private loadTemplates(): void {
    const templateDir = join(__dirname, 'templates');
    const templates = ['server', 'tool', 'resource', 'auth', 'transport'];
    
    for (const name of templates) {
      const content = readFileSync(join(templateDir, `${name}.hbs`), 'utf-8');
      this.templates.set(name, Handlebars.compile(content));
    }
  }
  
  private createDirectoryStructure(baseDir: string): void {
    const dirs = [
      'src',
      'src/tools',
      'src/resources',
      'src/auth',
      'src/transport',
      'src/utils',
      'tests'
    ];
    
    for (const dir of dirs) {
      mkdirSync(join(baseDir, dir), { recursive: true });
    }
  }
  
  private async generateServerFile(
    api: AnalyzedAPI,
    config: GeneratorConfig,
    outputDir: string
  ): Promise<void> {
    const template = this.templates.get('server')!;
    const code = template({
      name: api.name,
      tools: api.tools,
      resources: api.resources,
      transports: config.transports
    });
    
    writeFileSync(join(outputDir, 'src/index.ts'), code);
  }
  
  private async generateTools(tools: any[], outputDir: string): Promise<void> {
    const template = this.templates.get('tool')!;
    
    for (const tool of tools) {
      const code = template(tool);
      const filename = `${tool.name}.ts`;
      writeFileSync(join(outputDir, 'src/tools', filename), code);
    }
  }
  
  // Additional generation methods...
}
```

**Server Template** (`src/generators/typescript/templates/server.hbs`):
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import tools
{{#each tools}}
import { {{name}} } from './tools/{{name}}.js';
{{/each}}

// Import resources
{{#each resources}}
import { {{name}} } from './resources/{{name}}.js';
{{/each}}

class {{pascalCase name}}Server {
  private server: Server;
  
  constructor() {
    this.server = new Server(
      {
        name: '{{name}}',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );
    
    this.setupHandlers();
  }
  
  private setupHandlers(): void {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {{#each tools}}
        {
          name: '{{name}}',
          description: '{{description}}',
          inputSchema: {{json inputSchema}}
        },
        {{/each}}
      ]
    }));
    
    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        {{#each tools}}
        case '{{name}}':
          return await {{name}}(request.params.arguments);
        {{/each}}
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
    
    // List resources handler
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {{#each resources}}
        {
          uri: '{{uri}}',
          name: '{{name}}',
          description: '{{description}}',
          mimeType: '{{mimeType}}'
        },
        {{/each}}
      ]
    }));
    
    // Read resource handler
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;
      
      {{#each resources}}
      if (uri === '{{uri}}') {
        return await {{name}}();
      }
      {{/each}}
      
      throw new Error(`Unknown resource: ${uri}`);
    });
  }
  
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('{{name}} MCP server running on stdio');
  }
}

const server = new {{pascalCase name}}Server();
server.run().catch(console.error);
```

**Acceptance Criteria**:
- ✅ Generates valid TypeScript code
- ✅ Code compiles without errors
- ✅ Follows MCP SDK patterns
- ✅ Includes proper error handling
- ✅ Code is well-formatted and readable

### 4.2 Python Generator

**Objective**: Generate complete Python MCP server code using FastMCP.

**Implementation** (`src/generators/python/server.ts`):
```typescript
export class PythonGenerator {
  async generate(api: AnalyzedAPI, config: GeneratorConfig): Promise<void> {
    // Similar structure to TypeScript generator
    // but generates Python code using FastMCP
  }
}
```

**Server Template** (`src/generators/python/templates/server.py.hbs`):
```python
from mcp.server.fastmcp import FastMCP
import httpx
from typing import Any, Dict

# Initialize FastMCP server
mcp = FastMCP("{{name}}")

# API client configuration
BASE_URL = "{{baseUrl}}"
client = httpx.AsyncClient(base_url=BASE_URL)

{{#each tools}}
@mcp.tool()
async def {{name}}({{#each inputSchema.properties}}{{@key}}: {{pythonType type}}{{#unless @last}}, {{/unless}}{{/each}}) -> Dict[str, Any]:
    """{{description}}"""
    response = await client.request(
        method="{{endpoint.method}}",
        url="{{endpoint.path}}",
        {{#if endpoint.body}}
        json={
            {{#each inputSchema.properties}}
            "{{@key}}": {{@key}},
            {{/each}}
        }
        {{/if}}
    )
    response.raise_for_status()
    return response.json()

{{/each}}

{{#each resources}}
@mcp.resource("{{uri}}")
async def {{name}}() -> str:
    """{{description}}"""
    response = await client.get("{{endpoint.path}}")
    response.raise_for_status()
    return response.text

{{/each}}

if __name__ == "__main__":
    mcp.run()
```

**Acceptance Criteria**:
- ✅ Generates valid Python code
- ✅ Uses FastMCP correctly
- ✅ Includes type hints
- ✅ Follows Python conventions
- ✅ Code passes linting

## Phase 5: Testing & Documentation

### 5.1 Test Generator

**Objective**: Generate comprehensive test suites for generated servers.

**TypeScript Test Template**:
```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { {{pascalCase name}}Server } from '../src/index';

describe('{{name}} MCP Server', () => {
  let server: {{pascalCase name}}Server;
  
  beforeAll(async () => {
    server = new {{pascalCase name}}Server();
    await server.initialize();
  });
  
  afterAll(async () => {
    await server.close();
  });
  
  describe('Tools', () => {
    {{#each tools}}
    it('should execute {{name}} tool', async () => {
      const result = await server.callTool('{{name}}', {
        // Test arguments
      });
      expect(result).toBeDefined();
    });
    {{/each}}
  });
  
  describe('Resources', () => {
    {{#each resources}}
    it('should read {{name}} resource', async () => {
      const result = await server.readResource('{{uri}}');
      expect(result).toBeDefined();
    });
    {{/each}}
  });
});
```

**Acceptance Criteria**:
- ✅ Generates test files for all components
- ✅ Tests compile and run
- ✅ Includes unit and integration tests
- ✅ Provides good test coverage
- ✅ Includes mock data

### 5.2 Documentation Generator

**Objective**: Generate comprehensive documentation.

**README Template**:
```markdown
# {{name}} MCP Server

{{description}}

## Installation

\`\`\`bash
npm install
\`\`\`

## Configuration

Create a `.env` file:

\`\`\`env
{{#each authMethods}}
{{uppercase @key}}_TOKEN=your_token_here
{{/each}}
\`\`\`

## Usage

### STDIO Mode

\`\`\`bash
npm start
\`\`\`

### HTTP Mode

\`\`\`bash
npm run start:http
\`\`\`

## Available Tools

{{#each tools}}
### {{name}}

{{description}}

**Parameters:**
{{#each inputSchema.properties}}
- `{{@key}}` ({{type}}): {{description}}
{{/each}}

{{/each}}

## Available Resources

{{#each resources}}
### {{name}}

{{description}}

**URI:** `{{uri}}`

{{/each}}

## Development

\`\`\`bash
npm run dev
npm test
npm run lint
\`\`\`

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions.
```

**Acceptance Criteria**:
- ✅ README includes all necessary information
- ✅ API documentation is complete
- ✅ Examples are clear and working
- ✅ Deployment guide is comprehensive
- ✅ Troubleshooting section included

## Implementation Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: Foundation | 1 week | Project setup, CLI framework |
| Phase 2: Parsers | 1 week | OpenAPI, GraphQL, REST parsers |
| Phase 3: Analysis | 1 week | API analyzer, mapping engine |
| Phase 4: Generators | 2 weeks | TypeScript & Python generators |
| Phase 5: Testing | 1 week | Test generator, integration tests |
| Phase 6: Documentation | 1 week | Docs generator, examples |
| Phase 7: Polish | 1 week | Bug fixes, optimization |

**Total: 8 weeks**

## Success Metrics

1. **Functionality**
   - ✅ Generates working MCP servers from all input types
   - ✅ Generated code passes all tests
   - ✅ Supports all authentication methods
   - ✅ Both transports work correctly

2. **Quality**
   - ✅ Generated code is type-safe
   - ✅ Code follows best practices
   - ✅ Comprehensive error handling
   - ✅ Good test coverage (>80%)

3. **Usability**
   - ✅ Clear CLI interface
   - ✅ Helpful error messages
   - ✅ Complete documentation
   - ✅ Working examples

4. **Performance**
   - ✅ Generation completes in <30 seconds
   - ✅ Generated servers handle 1000+ req/sec
   - ✅ Low memory footprint

## Next Steps

1. Review and approve this implementation plan
2. Set up development environment
3. Begin Phase 1: Foundation Setup
4. Establish regular progress checkpoints
5. Create feedback loop for continuous improvement