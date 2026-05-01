#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { generateServer } from './commands/generate.js';
import { showPrompts } from './commands/prompts.js';

const packageJson = require('../../package.json');

// Display welcome banner
function getBanner() {
  return chalk.cyan.bold(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ${chalk.white.bold('MCP Server Generator')}                                ║
║   ${chalk.gray('Generate production-ready MCP servers from APIs')}      ║
║                                                           ║
║   ${chalk.yellow('Version:')} ${packageJson.version}                                      ║
║   ${chalk.yellow('Powered by:')} IBM Bob AI                               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
}

const program = new Command();

program
  .name('mcp-gen')
  .description(chalk.cyan('Generate production-ready MCP servers from API specifications'))
  .version(packageJson.version, '-v, --version', 'Output the current version')
  .helpOption('-h, --help', 'Display help for command')
  .addHelpText('before', getBanner)
  .addHelpText('after', `
${chalk.cyan.bold('Examples:')}
  ${chalk.gray('# Interactive mode (recommended)')}
  ${chalk.white('$ mcp-gen generate')}

  ${chalk.gray('# Non-interactive mode')}
  ${chalk.white('$ mcp-gen generate -i ./api.yaml -o ./my-server -l typescript')}

  ${chalk.gray('# Generate from OpenAPI spec')}
  ${chalk.white('$ mcp-gen generate -i https://api.example.com/openapi.json')}

${chalk.cyan.bold('Supported API Types:')}
  ${chalk.white('• OpenAPI/Swagger (JSON, YAML)')}
  ${chalk.white('• GraphQL Schema')}
  ${chalk.white('• REST Endpoint Descriptors')}

${chalk.cyan.bold('Features:')}
  ${chalk.white('✓ TypeScript & Python support')}
  ${chalk.white('✓ Multiple authentication methods')}
  ${chalk.white('✓ STDIO & HTTP transports')}
  ${chalk.white('✓ Input validation (Zod/Pydantic)')}
  ${chalk.white('✓ Automatic retry logic')}
  ${chalk.white('✓ Docker & Kubernetes support')}
  ${chalk.white('✓ Comprehensive test generation')}

${chalk.cyan.bold('Documentation:')}
  ${chalk.white('https://github.com/Altaf-SuperCool/MCP-Server-Generator')}
  `);

program
  .command('generate')
  .description('Generate a new MCP server from an API specification')
  .option('-i, --input <path>', 'Path or URL to API specification file (OpenAPI, GraphQL)')
  .option('-o, --output <path>', 'Output directory for generated server', './generated-server')
  .option('-l, --language <lang>', 'Target language: typescript or python', 'typescript')
  .option('--no-interactive', 'Disable interactive prompts (use CLI options only)')
  .addHelpText('after', `
${chalk.cyan.bold('Generate Command Examples:')}
  ${chalk.gray('# Interactive mode with prompts')}
  ${chalk.white('$ mcp-gen generate')}

  ${chalk.gray('# Quick generation with defaults')}
  ${chalk.white('$ mcp-gen generate -i ./openapi.yaml')}

  ${chalk.gray('# Full customization')}
  ${chalk.white('$ mcp-gen generate -i ./api.yaml -o ./my-mcp-server -l python')}
  `)
  .action(generateServer);

program
  .command('prompts')
  .description('🤖 Generate Bob AI prompts for manual or automated MCP server generation')
  .option('-i, --input <path>', 'Path to API specification file')
  .option('-l, --language <lang>', 'Target language: typescript or python', 'typescript')
  .option('-m, --mode <mode>', 'Mode: display (show prompts) or auto (use AI API)', 'display')
  .option('-k, --api-key <key>', 'OpenAI API key for auto mode')
  .addHelpText('after', `
${chalk.cyan.bold('Prompts Command Examples:')}
  ${chalk.gray('# Interactive mode - choose options')}
  ${chalk.white('$ mcp-gen prompts')}

  ${chalk.gray('# Display prompts for manual copy-paste')}
  ${chalk.white('$ mcp-gen prompts -i ./api.yaml -m display')}

  ${chalk.gray('# Auto-generate with AI (requires API key)')}
  ${chalk.white('$ mcp-gen prompts -i ./api.yaml -m auto -k sk-...')}

  ${chalk.gray('# Use environment variable for API key')}
  ${chalk.white('$ export OPENAI_API_KEY=sk-...')}
  ${chalk.white('$ mcp-gen prompts -i ./api.yaml -m auto')}

${chalk.cyan.bold('Three-Stage Bob Prompt Strategy:')}
  ${chalk.white('Stage 1: API Analysis - Maps endpoints to MCP primitives')}
  ${chalk.white('Stage 2: Code Generation - Generates production-ready server')}
  ${chalk.white('Stage 3: Test Generation - Creates comprehensive tests')}
  `)
  .action(showPrompts);

// Show banner if no arguments provided
if (process.argv.length === 2) {
  console.log(getBanner());
  program.help();
}

program.parse();

// Made with Bob
