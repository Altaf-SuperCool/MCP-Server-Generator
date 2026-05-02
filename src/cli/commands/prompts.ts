import chalk from 'chalk';
import inquirer from 'inquirer';
import { readFileSync } from 'fs';
import { parseOpenAPI } from '../../parsers/openapi.js';
import { parseGraphQL } from '../../parsers/graphql.js';
import { 
  displayPromptsForManualUse,
  runBobPromptPipeline,
  BobPromptConfig 
} from '../../analyzers/bob-prompts.js';
import { GeneratorConfig } from '../prompts.js';

interface PromptsOptions {
  input?: string;
  language?: string;
  mode?: 'display' | 'auto';
  apiKey?: string;
}

export async function showPrompts(options: PromptsOptions) {
  console.log(chalk.blue.bold('\n🤖 Bob AI Prompt Generator\n'));
  
  // Get configuration
  let inputPath: string;
  let language: 'typescript' | 'python';
  let mode: 'display' | 'auto';
  
  if (!options.input) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'inputPath',
        message: 'Path to your API specification:',
        default: 'examples/github-api.yaml',
        validate: (input) => input.length > 0 || 'Path is required'
      },
      {
        type: 'list',
        name: 'language',
        message: 'Target language:',
        choices: ['typescript', 'python'],
        default: 'typescript'
      },
      {
        type: 'list',
        name: 'mode',
        message: 'How do you want to use the prompts?',
        choices: [
          {
            name: 'Display prompts (copy-paste to AI manually)',
            value: 'display'
          },
          {
            name: 'Auto-generate with AI API (requires API key)',
            value: 'auto'
          }
        ],
        default: 'display'
      }
    ]);
    
    inputPath = answers.inputPath;
    language = answers.language;
    mode = answers.mode;
  } else {
    inputPath = options.input;
    language = (options.language as 'typescript' | 'python') || 'typescript';
    mode = (options.mode as 'display' | 'auto') || 'display';
  }
  
  try {
    // Read and parse API spec
    console.log(chalk.cyan('📖 Reading API specification...'));
    const apiSpecContent = readFileSync(inputPath, 'utf-8');
    
    // Create config
    const config: GeneratorConfig = {
      inputType: inputPath.endsWith('.graphql') ? 'graphql' : 'openapi',
      inputPath,
      outputPath: './generated-server',
      language,
      serverName: 'my-mcp-server',
      authMethods: ['bearer', 'apikey'],
      transports: ['stdio'],
      transport: 'stdio',
      includeTests: true,
      includeDocker: true,
      includeK8s: false,
      includeValidation: true,
      includeRetry: true
    };
    
    if (mode === 'display') {
      // Display prompts for manual use
      console.log(chalk.green('✓ API specification loaded\n'));
      displayPromptsForManualUse(apiSpecContent, config);
      
      console.log(chalk.cyan.bold('💡 Next Steps:'));
      console.log(chalk.white('1. Copy each prompt above'));
      console.log(chalk.white('2. Paste into your AI assistant (Claude, ChatGPT, etc.)'));
      console.log(chalk.white('3. Follow the three-stage process'));
      console.log(chalk.white('4. Save the generated code to your project\n'));
      
    } else {
      // Auto-generate with AI
      let apiKey = options.apiKey || process.env.OPENAI_API_KEY || process.env.BOB_API_KEY;
      
      if (!apiKey) {
        const keyAnswer = await inquirer.prompt([
          {
            type: 'password',
            name: 'apiKey',
            message: 'Enter your OpenAI API key:',
            validate: (input) => input.length > 0 || 'API key is required'
          }
        ]);
        apiKey = keyAnswer.apiKey;
      }
      
      const bobConfig: BobPromptConfig = {
        apiKey,
        useAI: true,
        model: 'gpt-4'
      };
      
      console.log(chalk.cyan('🤖 Running Bob AI prompt pipeline...\n'));
      
      const result = await runBobPromptPipeline(apiSpecContent, config, bobConfig);
      
      console.log(chalk.green.bold('\n✨ Bob AI generation complete!\n'));
      
      console.log(chalk.cyan.bold('📊 Analysis Results:'));
      console.log(JSON.stringify(result.analysis, null, 2));
      
      console.log(chalk.cyan.bold('\n📝 Generated Server Code:'));
      console.log(chalk.gray('─'.repeat(80)));
      console.log(result.code.substring(0, 500) + '...');
      console.log(chalk.gray('─'.repeat(80)));
      
      console.log(chalk.cyan.bold('\n🧪 Generated Tests:'));
      console.log(chalk.gray('─'.repeat(80)));
      console.log(result.tests.substring(0, 500) + '...');
      console.log(chalk.gray('─'.repeat(80)));
      
      console.log(chalk.yellow.bold('\n💾 To save the generated code:'));
      console.log(chalk.white('1. Copy the code sections above'));
      console.log(chalk.white('2. Save to your project files'));
      console.log(chalk.white('3. Run npm install and npm test\n'));
    }
    
  } catch (error) {
    console.error(chalk.red('\n❌ Error:'));
    console.error(chalk.red((error as Error).message));
    process.exit(1);
  }
}

// Made with Bob