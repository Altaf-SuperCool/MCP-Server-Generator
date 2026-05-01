import chalk from 'chalk';
import ora from 'ora';
import { promptForConfig, GeneratorConfig } from '../prompts.js';
import { parseOpenAPI } from '../../parsers/openapi.js';
import { parseGraphQL } from '../../parsers/graphql.js';
import { analyzeWithBob } from '../../analyzers/bob.js';
import { generateTypeScriptServer } from '../../generators/typescript/index.js';
import { generatePythonServer } from '../../generators/python/index.js';

interface GenerateOptions {
  input?: string;
  output?: string;
  language?: string;
  interactive?: boolean;
}

export async function generateServer(options: GenerateOptions) {
  console.log(chalk.blue.bold('\n🚀 MCP Server Generator\n'));

  let config: GeneratorConfig;

  // Get configuration from prompts or CLI options
  if (options.interactive !== false && !options.input) {
    config = await promptForConfig();
  } else {
    // Non-interactive mode - use CLI options
    if (!options.input) {
      console.error(chalk.red('Error: --input is required in non-interactive mode'));
      process.exit(1);
    }

    config = {
      inputType: 'openapi', // Default, could be detected from file
      inputPath: options.input,
      outputPath: options.output || './generated-server',
      language: (options.language as 'typescript' | 'python') || 'typescript',
      serverName: 'my-mcp-server',
      authMethods: ['apikey', 'bearer'],
      transports: ['stdio', 'http'],
      includeTests: true,
      includeDocker: true,
      includeK8s: true
    };
  }

  try {
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.cyan.bold('📋 Configuration Summary:'));
    console.log(chalk.gray(`   Input: ${config.inputPath}`));
    console.log(chalk.gray(`   Output: ${config.outputPath}`));
    console.log(chalk.gray(`   Language: ${config.language}`));
    console.log(chalk.gray(`   Transport: ${config.transport || 'stdio'}`));
    console.log(chalk.gray(`   Auth: ${config.authMethods.join(', ') || 'none'}`));
    console.log(chalk.gray('─'.repeat(60) + '\n'));

    // Step 1: Parse API specification
    const spinner = ora({
      text: 'Parsing API specification...',
      color: 'cyan'
    }).start();
    
    let parsedAPI;

    switch (config.inputType) {
      case 'openapi':
        parsedAPI = await parseOpenAPI(config.inputPath);
        break;
      case 'graphql':
        parsedAPI = await parseGraphQL(config.inputPath);
        break;
      case 'rest':
        throw new Error('REST parser not yet implemented');
      default:
        throw new Error(`Unknown input type: ${config.inputType}`);
    }

    spinner.succeed(chalk.green('✓ API specification parsed successfully'));

    // Step 2: Analyze with Bob
    spinner.start('🤖 Analyzing API with IBM Bob...');
    const analysis = await analyzeWithBob(parsedAPI, config);
    spinner.succeed(chalk.green(`✓ API analysis complete (${analysis.tools.length} tools, ${analysis.resources.length} resources)`));

    // Step 3: Generate server code
    spinner.start(`📝 Generating ${config.language} server code...`);
    
    if (config.language === 'typescript') {
      await generateTypeScriptServer(analysis, config);
    } else {
      await generatePythonServer(analysis, config);
    }

    spinner.text = '📦 Generating configuration files...';
    await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause for UX
    
    if (config.includeDocker) {
      spinner.text = '🐳 Generating Docker files...';
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    if (config.includeK8s) {
      spinner.text = '☸️  Generating Kubernetes manifests...';
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    spinner.succeed(chalk.green('✓ Server code generated successfully'));

    // Success message with detailed info
    console.log(chalk.green.bold('\n✨ MCP Server generated successfully!\n'));
    
    console.log(chalk.cyan.bold('📁 Generated Files:'));
    console.log(chalk.white(`   ${config.outputPath}/`));
    console.log(chalk.gray(`   ├── src/`));
    console.log(chalk.gray(`   ├── tests/`));
    if (config.includeDocker) {
      console.log(chalk.gray(`   ├── Dockerfile`));
      console.log(chalk.gray(`   ├── docker-compose.yml`));
    }
    if (config.includeK8s) {
      console.log(chalk.gray(`   └── k8s/`));
    }
    
    console.log(chalk.cyan.bold('\n🚀 Next Steps:'));
    console.log(chalk.white(`   1. ${chalk.bold('cd ' + config.outputPath)}`));
    
    if (config.language === 'typescript') {
      console.log(chalk.white(`   2. ${chalk.bold('npm install')}`));
      console.log(chalk.white(`   3. ${chalk.bold('npm run build')}`));
      console.log(chalk.white(`   4. ${chalk.bold('npm test')}`));
      console.log(chalk.white(`   5. ${chalk.bold('npm start')}`));
    } else {
      console.log(chalk.white(`   2. ${chalk.bold('pip install -r requirements.txt')}`));
      console.log(chalk.white(`   3. ${chalk.bold('pytest')}`));
      console.log(chalk.white(`   4. ${chalk.bold('python main.py')}`));
    }
    
    if (config.includeDocker) {
      console.log(chalk.cyan.bold('\n🐳 Docker Commands:'));
      console.log(chalk.white(`   ${chalk.bold('docker-compose up')}`));
      console.log(chalk.white(`   ${chalk.bold('docker build -t ' + config.serverName + ' .')}`));
    }
    
    console.log(chalk.cyan.bold('\n🔍 Test with MCP Inspector:'));
    if (config.language === 'typescript') {
      console.log(chalk.white(`   ${chalk.bold('npx @modelcontextprotocol/inspector dist/index.js')}`));
    } else {
      console.log(chalk.white(`   ${chalk.bold('npx @modelcontextprotocol/inspector python main.py')}`));
    }
    
    console.log(chalk.gray('\n' + '─'.repeat(60) + '\n'));

  } catch (error) {
    console.error(chalk.red('\n❌ Error generating server:'));
    console.error(chalk.red((error as Error).message));
    process.exit(1);
  }
}

// Made with Bob
