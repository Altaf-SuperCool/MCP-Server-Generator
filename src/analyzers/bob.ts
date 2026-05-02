import axios from 'axios';
import { ParsedAPI } from '../parsers/openapi.js';
import { ParsedGraphQL } from '../parsers/graphql.js';
import { GeneratorConfig } from '../cli/prompts.js';

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

export interface AuthConfig {
  methods: string[];
  config: Record<string, any>;
}

export interface APIMetadata {
  version: string;
  endpoints: number;
  schemas: number;
}

export interface AnalyzedAPI {
  name: string;
  baseUrl: string;
  tools: ToolDefinition[];
  resources: ResourceDefinition[];
  authConfig: AuthConfig;
  metadata: APIMetadata;
}

/**
 * Analyzes API specification using IBM Bob AI
 * For now, implements basic rule-based mapping:
 * - GET endpoints → MCP Resources
 * - POST/PUT/DELETE/PATCH → MCP Tools
 */
export async function analyzeWithBob(
  parsedData: ParsedAPI | ParsedGraphQL,
  config: GeneratorConfig
): Promise<AnalyzedAPI> {
  // Check if it's OpenAPI
  if ('endpoints' in parsedData) {
    return analyzeOpenAPI(parsedData, config);
  }
  
  // Check if it's GraphQL
  if ('queries' in parsedData) {
    return analyzeGraphQL(parsedData, config);
  }
  
  throw new Error('Unknown API format');
}

function analyzeOpenAPI(api: ParsedAPI, config: GeneratorConfig): AnalyzedAPI {
  const tools: ToolDefinition[] = [];
  const resources: ResourceDefinition[] = [];
  
  for (const endpoint of api.endpoints) {
    if (endpoint.method === 'GET') {
      // GET endpoints become resources
      resources.push({
        name: generateResourceName(endpoint),
        description: endpoint.description || endpoint.summary || `Get ${endpoint.path}`,
        uri: `resource://${endpoint.path}`,
        mimeType: 'application/json',
        endpoint: {
          method: endpoint.method,
          path: endpoint.path,
          parameters: endpoint.parameters
        }
      });
    } else {
      // POST/PUT/DELETE/PATCH become tools
      tools.push({
        name: generateToolName(endpoint),
        description: endpoint.description || endpoint.summary || `${endpoint.method} ${endpoint.path}`,
        inputSchema: generateInputSchema(endpoint),
        endpoint: {
          method: endpoint.method,
          path: endpoint.path,
          parameters: endpoint.parameters,
          body: endpoint.requestBody
        }
      });
    }
  }
  
  return {
    name: api.title,
    baseUrl: api.baseUrl,
    tools,
    resources,
    authConfig: extractAuthConfig(api.securitySchemes, config),
    metadata: {
      version: api.version,
      endpoints: api.endpoints.length,
      schemas: Object.keys(api.schemas).length
    }
  };
}

function analyzeGraphQL(api: ParsedGraphQL, config: GeneratorConfig): AnalyzedAPI {
  const tools: ToolDefinition[] = [];
  const resources: ResourceDefinition[] = [];
  
  // Queries become resources
  for (const query of api.queries) {
    resources.push({
      name: query.name,
      description: query.description || `Query ${query.name}`,
      uri: `resource://graphql/${query.name}`,
      mimeType: 'application/json',
      endpoint: {
        method: 'POST',
        path: '/graphql',
        parameters: query.args
      }
    });
  }
  
  // Mutations become tools
  for (const mutation of api.mutations) {
    tools.push({
      name: mutation.name,
      description: mutation.description || `Mutation ${mutation.name}`,
      inputSchema: generateGraphQLInputSchema(mutation),
      endpoint: {
        method: 'POST',
        path: '/graphql',
        parameters: mutation.args,
        body: { query: `mutation ${mutation.name}` }
      }
    });
  }
  
  return {
    name: 'GraphQL API',
    baseUrl: '',
    tools,
    resources,
    authConfig: { methods: config.authMethods, config: {} },
    metadata: {
      version: '1.0.0',
      endpoints: api.queries.length + api.mutations.length,
      schemas: Object.keys(api.types).length
    }
  };
}

function generateToolName(endpoint: any): string {
  if (endpoint.operationId) {
    return camelCase(endpoint.operationId);
  }
  const pathParts = endpoint.path.split('/').filter(Boolean);
  return camelCase(`${endpoint.method}_${pathParts.join('_')}`);
}

function generateResourceName(endpoint: any): string {
  if (endpoint.operationId) {
    return camelCase(endpoint.operationId);
  }
  const pathParts = endpoint.path.split('/').filter(Boolean);
  return pathParts.join('_') || 'root';
}

function camelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^[A-Z]/, (c) => c.toLowerCase());
}

function generateInputSchema(endpoint: any): any {
  const properties: Record<string, any> = {};
  const required: string[] = [];
  
  // Add path and query parameters
  for (const param of endpoint.parameters || []) {
    properties[param.name] = {
      type: mapType(param.schema?.type || 'string'),
      description: param.description
    };
    if (param.required) {
      required.push(param.name);
    }
  }
  
  // Add request body properties if present
  if (endpoint.requestBody?.content) {
    const jsonContent = endpoint.requestBody.content['application/json'];
    if (jsonContent?.schema?.properties) {
      Object.assign(properties, jsonContent.schema.properties);
      if (jsonContent.schema.required) {
        required.push(...jsonContent.schema.required);
      }
    }
  }
  
  return {
    type: 'object',
    properties,
    required: required.length > 0 ? required : undefined
  };
}

function generateGraphQLInputSchema(field: any): any {
  const properties: Record<string, any> = {};
  const required: string[] = [];
  
  for (const arg of field.args || []) {
    properties[arg.name] = {
      type: mapGraphQLType(arg.type),
      description: arg.description
    };
    if (arg.required) {
      required.push(arg.name);
    }
  }
  
  return {
    type: 'object',
    properties,
    required: required.length > 0 ? required : undefined
  };
}

function mapType(type: string): string {
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

function mapGraphQLType(type: string): string {
  const cleanType = type.replace(/[!\[\]]/g, '');
  const typeMap: Record<string, string> = {
    'Int': 'number',
    'Float': 'number',
    'Boolean': 'boolean',
    'String': 'string',
    'ID': 'string'
  };
  return typeMap[cleanType] || 'string';
}

function extractAuthConfig(securitySchemes: any, config: GeneratorConfig): AuthConfig {
  const methods = config.authMethods || [];
  const authConfig: Record<string, any> = {};
  
  // Extract configuration from security schemes
  if (securitySchemes) {
    for (const [name, scheme] of Object.entries(securitySchemes)) {
      const schemeObj = scheme as any;
      authConfig[name] = {
        type: schemeObj.type,
        scheme: schemeObj.scheme,
        bearerFormat: schemeObj.bearerFormat,
        in: schemeObj.in,
        name: schemeObj.name
      };
    }
  }
  
  return {
    methods,
    config: authConfig
  };
}

// Made with Bob
