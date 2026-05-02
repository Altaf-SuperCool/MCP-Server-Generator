import inquirer from 'inquirer';

export interface GeneratorConfig {
  inputType: 'openapi' | 'graphql' | 'rest';
  inputPath: string;
  outputPath: string;
  language: 'typescript' | 'python';
  serverName: string;
  authMethods: string[];
  transports: string[];
  transport?: 'stdio' | 'http'; // Primary transport
  includeTests: boolean;
  includeDocker: boolean;
  includeK8s: boolean;
  includeValidation?: boolean; // Zod/Pydantic validation
  includeRetry?: boolean; // Retry logic
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
      name: 'includeValidation',
      message: 'Include input validation (Zod/Pydantic)?',
      default: true
    },
    {
      type: 'confirm',
      name: 'includeRetry',
      message: 'Include automatic retry logic?',
      default: true
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
      default: true
    }
  ]);

  // Set primary transport (prefer stdio for MCP)
  const config = answers as GeneratorConfig;
  config.transport = config.transports.includes('stdio') ? 'stdio' : 'http';
  
  return config;
}

// Made with Bob
