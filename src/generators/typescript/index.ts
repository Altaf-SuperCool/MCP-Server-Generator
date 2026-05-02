import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { AnalyzedAPI } from '../../analyzers/bob.js';
import { GeneratorConfig } from '../../cli/prompts.js';
import { TemplateEngine, TemplateContext, pascalCase } from '../../templates/engine.js';

export async function generateTypeScriptServer(
  api: AnalyzedAPI,
  config: GeneratorConfig
): Promise<void> {
  const outputDir = config.outputPath;
  
  // Create directory structure
  createDirectoryStructure(outputDir);
  
  // Initialize template engine
  const templateEngine = new TemplateEngine();
  
  // Prepare template context
  const context: TemplateContext = {
    name: api.name,
    className: pascalCase(api.name),
    version: api.metadata.version,
    baseUrl: api.baseUrl,
    tools: api.tools,
    resources: api.resources,
    auth: extractAuthContext(api.authConfig, config),
    useZod: config.includeValidation !== false,
    useHttpTransport: config.transport === 'http',
    retryLogic: config.includeRetry !== false
  };
  
  // Generate main server file using template
  const serverCode = templateEngine.renderTypeScriptServer(context);
  writeFileSync(join(outputDir, 'src/index.ts'), serverCode);
  
  // Generate tests if requested
  if (config.includeTests) {
    const testCode = templateEngine.renderTypeScriptTest(context);
    writeFileSync(join(outputDir, 'tests/server.test.ts'), testCode);
    generateJestConfig(outputDir);
  }
  
  // Generate package.json
  generatePackageJson(api, config, outputDir);
  
  // Generate tsconfig.json
  generateTsConfig(outputDir);
  
  // Generate README
  generateReadme(api, config, outputDir);
  
  // Generate .env.example
  generateEnvExample(api, config, outputDir);
  
  // Generate .gitignore
  generateGitignore(outputDir);
  
  // Generate Docker files if requested
  if (config.includeDocker !== false) {
    generateDockerFiles(api, config, outputDir, templateEngine, context);
  }
  
  // Generate Kubernetes files if requested
  if (config.includeK8s) {
    generateKubernetesFiles(api, config, outputDir, templateEngine, context);
  }
}

function createDirectoryStructure(baseDir: string): void {
  const dirs = [
    '',
    'src',
    'src/tools',
    'src/resources',
    'src/types',
    'src/utils',
    'dist',
    'tests',
    'k8s'
  ];
  
  for (const dir of dirs) {
    mkdirSync(join(baseDir, dir), { recursive: true });
  }
}

function extractAuthContext(authConfig: any, config: GeneratorConfig): any {
  if (!config.authMethods || config.authMethods.length === 0) {
    return undefined;
  }
  
  const primaryAuth = config.authMethods[0];
  
  if (primaryAuth === 'apiKey') {
    return {
      type: 'apiKey',
      headerName: authConfig.config?.apiKey?.name || 'X-API-Key'
    };
  } else if (primaryAuth === 'bearer') {
    return {
      type: 'bearer'
    };
  } else if (primaryAuth === 'oauth2') {
    return {
      type: 'oauth2',
      flows: authConfig.config?.oauth2?.flows
    };
  } else if (primaryAuth === 'basic') {
    return {
      type: 'basic'
    };
  }
  
  return undefined;
}

function generatePackageJson(
  api: AnalyzedAPI,
  config: GeneratorConfig,
  outputDir: string
): void {
  const dependencies: Record<string, string> = {
    '@modelcontextprotocol/sdk': '^1.0.4',
    'axios': '^1.7.9',
    'dotenv': '^16.3.1'
  };
  
  if (config.transport === 'http') {
    dependencies['express'] = '^4.18.2';
  }
  
  if (config.includeValidation !== false) {
    dependencies['zod'] = '^3.22.4';
  }
  
  const packageJson = {
    name: config.serverName,
    version: '1.0.0',
    description: `MCP server for ${api.name}`,
    type: 'module',
    main: 'dist/index.js',
    bin: {
      [config.serverName]: './dist/index.js'
    },
    scripts: {
      build: 'tsc',
      start: 'node dist/index.js',
      dev: 'ts-node src/index.ts',
      test: 'jest'
    },
    dependencies,
    devDependencies: {
      '@types/node': '^22.10.2',
      '@types/express': '^4.17.21',
      'typescript': '^5.7.2',
      'ts-node': '^10.9.2',
      'jest': '^30.3.0',
      '@types/jest': '^30.0.0',
      'ts-jest': '^29.4.9'
    }
  };
  
  writeFileSync(
    join(outputDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}

function generateTsConfig(outputDir: string): void {
  const tsConfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'Node16',
      moduleResolution: 'node16',
      lib: ['ES2022'],
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      declaration: true,
      sourceMap: true,
      isolatedModules: true
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist', 'tests']
  };
  
  writeFileSync(
    join(outputDir, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );
}

function generateReadme(
  api: AnalyzedAPI,
  config: GeneratorConfig,
  outputDir: string
): void {
  const authSection = config.authMethods && config.authMethods.length > 0 
    ? `
## Authentication

This server requires authentication. Set the following environment variables:

${config.authMethods.map(method => {
  if (method === 'apiKey') return '- `API_KEY`: Your API key';
  if (method === 'bearer') return '- `API_TOKEN`: Your bearer token';
  if (method === 'oauth2') return '- `ACCESS_TOKEN`: Your OAuth2 access token';
  if (method === 'basic') return '- `API_USERNAME` and `API_PASSWORD`: Your credentials';
  return '';
}).join('\n')}

Copy \`.env.example\` to \`.env\` and fill in your credentials.
` : '';

  const readme = `# ${api.name} MCP Server

Generated MCP server for ${api.name}.

## Installation

\`\`\`bash
npm install
npm run build
\`\`\`
${authSection}
## Usage

### With MCP Inspector

\`\`\`bash
npx @modelcontextprotocol/inspector dist/index.js
\`\`\`

### With Claude Desktop

Add to your Claude Desktop configuration:

\`\`\`json
{
  "mcpServers": {
    "${config.serverName}": {
      "command": "node",
      "args": ["${process.cwd()}/${config.outputPath}/dist/index.js"]${config.authMethods && config.authMethods.length > 0 ? `,
      "env": {
        ${config.authMethods.map(method => {
          if (method === 'apiKey') return '"API_KEY": "your-api-key"';
          if (method === 'bearer') return '"API_TOKEN": "your-token"';
          if (method === 'oauth2') return '"ACCESS_TOKEN": "your-access-token"';
          if (method === 'basic') return '"API_USERNAME": "user", "API_PASSWORD": "pass"';
          return '';
        }).join(',\n        ')}
      }` : ''}
    }
  }
}
\`\`\`

## Available Tools

${api.tools.map(tool => `- **${tool.name}**: ${tool.description}`).join('\n')}

## Available Resources

${api.resources.map(resource => `- **${resource.name}**: ${resource.description}`).join('\n')}

## Development

\`\`\`bash
npm run dev
\`\`\`

## Testing

\`\`\`bash
npm test
\`\`\`

## Features

- ✅ ${config.transport === 'http' ? 'HTTP (SSE)' : 'STDIO'} transport
- ✅ ${config.includeValidation !== false ? 'Zod validation' : 'No validation'}
- ✅ ${config.includeRetry !== false ? 'Automatic retry logic' : 'No retry'}
- ✅ ${config.authMethods && config.authMethods.length > 0 ? `Authentication (${config.authMethods.join(', ')})` : 'No authentication'}
- ✅ Error handling
- ✅ TypeScript types
`;
  
  writeFileSync(join(outputDir, 'README.md'), readme);
}

function generateEnvExample(
  api: AnalyzedAPI,
  config: GeneratorConfig,
  outputDir: string
): void {
  if (!config.authMethods || config.authMethods.length === 0) {
    return;
  }
  
  const envVars: string[] = [];
  
  for (const method of config.authMethods) {
    if (method === 'apiKey') {
      envVars.push('API_KEY=your-api-key-here');
    } else if (method === 'bearer') {
      envVars.push('API_TOKEN=your-bearer-token-here');
    } else if (method === 'oauth2') {
      envVars.push('ACCESS_TOKEN=your-oauth2-access-token-here');
    } else if (method === 'basic') {
      envVars.push('API_USERNAME=your-username-here');
      envVars.push('API_PASSWORD=your-password-here');
    }
  }
  
  writeFileSync(join(outputDir, '.env.example'), envVars.join('\n') + '\n');
}

function generateJestConfig(outputDir: string): void {
  const jestConfig = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.ts'],
    collectCoverageFrom: [
      'src/**/*.ts',
      '!src/**/*.d.ts'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    transform: {
      '^.+\\.ts$': ['ts-jest', { tsconfig: { module: 'commonjs' } }]
    }
  };
  
  writeFileSync(
    join(outputDir, 'jest.config.json'),
    JSON.stringify(jestConfig, null, 2)
  );
}

function generateGitignore(outputDir: string): void {
  const gitignore = `node_modules/
dist/
*.log
.env
.DS_Store
coverage/
*.tsbuildinfo
`;
  
  writeFileSync(join(outputDir, '.gitignore'), gitignore);
}

function generateDockerFiles(
  api: AnalyzedAPI,
  config: GeneratorConfig,
  outputDir: string,
  templateEngine: TemplateEngine,
  context: TemplateContext
): void {
  // Generate Dockerfile
  const dockerfileContext = {
    ...context,
    serverName: config.serverName,
    apiBaseUrl: api.baseUrl,
    language: 'typescript'
  };
  
  const dockerfile = templateEngine.render('typescript/Dockerfile.hbs', dockerfileContext);
  writeFileSync(join(outputDir, 'Dockerfile'), dockerfile);
  
  // Generate docker-compose.yml
  const dockerCompose = templateEngine.render('docker-compose.hbs', dockerfileContext);
  writeFileSync(join(outputDir, 'docker-compose.yml'), dockerCompose);
  
  // Add .dockerignore
  const dockerignore = `node_modules/
dist/
*.log
.env
.git/
.gitignore
README.md
tests/
coverage/
*.md
`;
  writeFileSync(join(outputDir, '.dockerignore'), dockerignore);
}

function generateKubernetesFiles(
  api: AnalyzedAPI,
  config: GeneratorConfig,
  outputDir: string,
  templateEngine: TemplateEngine,
  context: TemplateContext
): void {
  const k8sContext = {
    ...context,
    serverName: config.serverName,
    apiBaseUrl: api.baseUrl,
    language: 'typescript'
  };
  
  // Generate deployment and service
  const deployment = templateEngine.render('k8s/deployment.hbs', k8sContext);
  writeFileSync(join(outputDir, 'k8s/deployment.yaml'), deployment);
  
  // Generate configmap and secrets
  const configmap = templateEngine.render('k8s/configmap.hbs', k8sContext);
  writeFileSync(join(outputDir, 'k8s/configmap.yaml'), configmap);
}

// Made with Bob
