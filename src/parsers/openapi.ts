import SwaggerParser from '@apidevtools/swagger-parser';
import { OpenAPIV3 } from 'openapi-types';

export interface Parameter {
  name: string;
  in: string;
  required: boolean;
  schema?: any;
  description?: string;
}

export interface RequestBody {
  required: boolean;
  content: any;
}

export interface Response {
  description?: string;
  content?: any;
}

export interface SecurityRequirement {
  [key: string]: string[];
}

export interface SecurityScheme {
  type: string;
  scheme?: string;
  bearerFormat?: string;
  in?: string;
  name?: string;
  flows?: any;
}

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
      
      const op = operation as OpenAPIV3.OperationObject;
      
      endpoints.push({
        path,
        method: method.toUpperCase(),
        operationId: op.operationId || `${method}${path.replace(/\//g, '_')}`,
        summary: op.summary,
        description: op.description,
        parameters: parseParameters(op.parameters),
        requestBody: parseRequestBody(op.requestBody),
        responses: op.responses as Record<string, Response>,
        security: op.security as SecurityRequirement[]
      });
    }
  }
  
  return {
    title: api.info.title,
    version: api.info.version,
    baseUrl: getBaseUrl(api),
    endpoints,
    schemas: (api.components?.schemas as Record<string, any>) || {},
    securitySchemes: (api.components?.securitySchemes as Record<string, SecurityScheme>) || {}
  };
}

function isOperation(method: string): boolean {
  return ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method);
}

function getBaseUrl(api: OpenAPIV3.Document): string {
  if (api.servers && api.servers.length > 0) {
    return api.servers[0].url;
  }
  return '';
}

function parseParameters(params?: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[]): Parameter[] {
  if (!params) return [];
  
  return params.map(p => {
    if ('$ref' in p) {
      // Handle reference objects - simplified for now
      return {
        name: 'ref',
        in: 'query',
        required: false,
        description: p.$ref
      };
    }
    
    return {
      name: p.name,
      in: p.in,
      required: p.required || false,
      schema: p.schema,
      description: p.description
    };
  });
}

function parseRequestBody(body?: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject): RequestBody | undefined {
  if (!body) return undefined;
  
  if ('$ref' in body) {
    // Handle reference objects - simplified for now
    return {
      required: false,
      content: { '$ref': body.$ref }
    };
  }
  
  return {
    required: body.required || false,
    content: body.content
  };
}

// Made with Bob
