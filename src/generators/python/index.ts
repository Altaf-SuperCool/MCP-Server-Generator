import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { AnalyzedAPI } from '../../analyzers/bob.js';
import { GeneratorConfig } from '../../cli/prompts.js';
import { TemplateEngine, TemplateContext } from '../../templates/engine.js';

export async function generatePythonServer(
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
    className: api.name.replace(/[-\s]/g, '_'),
    version: api.metadata.version,
    baseUrl: api.baseUrl,
    tools: api.tools,
    resources: api.resources,
    auth: extractAuthContext(api.authConfig, config),
    usePydantic: config.includeValidation !== false,
    useHttpTransport: config.transport === 'http',
    retryLogic: config.includeRetry !== false
  };
  
  // Generate main server file using template
  const serverCode = templateEngine.renderPythonServer(context);
  writeFileSync(join(outputDir, 'main.py'), serverCode);
  
  // Generate tests if requested
  if (config.includeTests) {
    const testCode = templateEngine.renderPythonTest(context);
    writeFileSync(join(outputDir, 'tests/test_server.py'), testCode);
    generatePytestConfig(outputDir);
  }
  
  // Generate requirements.txt
  generateRequirements(config, outputDir);
  
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
    'src/utils',
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
  
  if (primaryAuth === 'apiKey' || primaryAuth === 'apikey') {
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

function generateRequirements(config: GeneratorConfig, outputDir: string): void {
  const requirements = [
    'mcp>=1.0.0',
    'httpx>=0.27.0',
    'fastmcp>=0.1.0',
    'python-dotenv>=1.0.0'
  ];
  
  if (config.transport === 'http') {
    requirements.push('fastapi>=0.104.0');
    requirements.push('uvicorn>=0.24.0');
  }
  
  if (config.includeValidation !== false) {
    requirements.push('pydantic>=2.0.0');
  }
  
  if (config.includeTests) {
    requirements.push('pytest>=7.0.0');
    requirements.push('pytest-asyncio>=0.21.0');
    requirements.push('pytest-cov>=4.1.0');
  }
  
  writeFileSync(join(outputDir, 'requirements.txt'), requirements.join('\n') + '\n');
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
  if (method === 'apiKey' || method === 'apikey') return '- `API_KEY`: Your API key';
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
pip install -r requirements.txt
\`\`\`
${authSection}
## Usage

### Run the server

\`\`\`bash
python main.py
\`\`\`

### With Claude Desktop

Add to your Claude Desktop configuration:

\`\`\`json
{
  "mcpServers": {
    "${config.serverName}": {
      "command": "python",
      "args": ["${process.cwd()}/${config.outputPath}/main.py"]${config.authMethods && config.authMethods.length > 0 ? `,
      "env": {
        ${config.authMethods.map(method => {
          if (method === 'apiKey' || method === 'apikey') return '"API_KEY": "your-api-key"';
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
python main.py
\`\`\`

## Testing

\`\`\`bash
pytest
\`\`\`

## Features

- ✅ ${config.transport === 'http' ? 'HTTP' : 'STDIO'} transport
- ✅ ${config.includeValidation !== false ? 'Pydantic validation' : 'No validation'}
- ✅ ${config.includeRetry !== false ? 'Automatic retry logic' : 'No retry'}
- ✅ ${config.authMethods && config.authMethods.length > 0 ? `Authentication (${config.authMethods.join(', ')})` : 'No authentication'}
- ✅ Error handling
- ✅ Type hints
- ✅ Async/await support
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
    if (method === 'apiKey' || method === 'apikey') {
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

function generatePytestConfig(outputDir: string): void {
  const pytestIni = `[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts =
    --verbose
    --cov=.
    --cov-report=html
    --cov-report=term
asyncio_mode = auto
`;
  
  writeFileSync(join(outputDir, 'pytest.ini'), pytestIni);
  
  // Also create __init__.py in tests directory
  writeFileSync(join(outputDir, 'tests/__init__.py'), '');
}

function generateGitignore(outputDir: string): void {
  const gitignore = `__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.env
.venv
*.log
.DS_Store
.pytest_cache/
htmlcov/
.coverage
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
    language: 'python'
  };
  
  const dockerfile = templateEngine.render('python/Dockerfile.hbs', dockerfileContext);
  writeFileSync(join(outputDir, 'Dockerfile'), dockerfile);
  
  // Generate docker-compose.yml
  const dockerCompose = templateEngine.render('docker-compose.hbs', dockerfileContext);
  writeFileSync(join(outputDir, 'docker-compose.yml'), dockerCompose);
  
  // Add .dockerignore
  const dockerignore = `__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.env
.venv
*.log
.git/
.gitignore
README.md
tests/
htmlcov/
.coverage
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
    language: 'python'
  };
  
  // Generate deployment and service
  const deployment = templateEngine.render('k8s/deployment.hbs', k8sContext);
  writeFileSync(join(outputDir, 'k8s/deployment.yaml'), deployment);
  
  // Generate configmap and secrets
  const configmap = templateEngine.render('k8s/configmap.hbs', k8sContext);
  writeFileSync(join(outputDir, 'k8s/configmap.yaml'), configmap);
}

// Made with Bob
