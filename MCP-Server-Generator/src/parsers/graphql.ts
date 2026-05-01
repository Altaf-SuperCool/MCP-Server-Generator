import { buildSchema, GraphQLSchema, GraphQLObjectType, GraphQLField as GQLField } from 'graphql';
import { readFileSync } from 'fs';

export interface GraphQLArgument {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface ParsedGraphQLField {
  name: string;
  type: string;
  args: GraphQLArgument[];
  description?: string;
}

export interface ParsedGraphQL {
  queries: ParsedGraphQLField[];
  mutations: ParsedGraphQLField[];
  subscriptions: ParsedGraphQLField[];
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

function extractFields(type: GraphQLObjectType): ParsedGraphQLField[] {
  const fields = type.getFields();
  return Object.values(fields).map((field: GQLField<any, any>) => ({
    name: field.name,
    type: field.type.toString(),
    args: field.args.map((arg: any) => ({
      name: arg.name,
      type: arg.type.toString(),
      required: arg.type.toString().endsWith('!'),
      description: arg.description || undefined
    })),
    description: field.description || undefined
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

// Made with Bob
