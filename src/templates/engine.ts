import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';

// In CommonJS (compiled TypeScript), __dirname is available globally
// Declare it for TypeScript
declare const __dirname: string;

// Register Handlebars helpers
Handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context, null, 2);
});

Handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

Handlebars.registerHelper('includes', function(array, value) {
  return array && array.includes(value);
});

Handlebars.registerHelper('contains', function(str: string, substring: string) {
  return str && str.includes(substring);
});

Handlebars.registerHelper('capitalize', function(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
});

Handlebars.registerHelper('pythonType', function(type: string) {
  const typeMap: Record<string, string> = {
    'string': 'str',
    'number': 'float',
    'integer': 'int',
    'boolean': 'bool',
    'array': 'list',
    'object': 'dict'
  };
  return typeMap[type] || 'Any';
});

export interface TemplateContext {
  name: string;
  className: string;
  version: string;
  baseUrl: string;
  tools: any[];
  resources: any[];
  auth?: {
    type: 'apiKey' | 'bearer' | 'oauth2' | 'basic';
    headerName?: string;
    flows?: any;
  };
  useZod?: boolean;
  usePydantic?: boolean;
  useHttpTransport?: boolean;
  retryLogic?: boolean;
}

export class TemplateEngine {
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();
  
  constructor() {
    this.loadTemplates();
  }
  
  private loadTemplates(): void {
    // Load TypeScript templates
    const tsServerTemplate = readFileSync(
      join(__dirname, 'typescript', 'server.hbs'),
      'utf-8'
    );
    this.templates.set('typescript-server', Handlebars.compile(tsServerTemplate));
    
    const tsTestTemplate = readFileSync(
      join(__dirname, 'typescript', 'test.hbs'),
      'utf-8'
    );
    this.templates.set('typescript-test', Handlebars.compile(tsTestTemplate));
    
    // Load Python templates
    const pyServerTemplate = readFileSync(
      join(__dirname, 'python', 'server.hbs'),
      'utf-8'
    );
    this.templates.set('python-server', Handlebars.compile(pyServerTemplate));
    
    const pyTestTemplate = readFileSync(
      join(__dirname, 'python', 'test.hbs'),
      'utf-8'
    );
    this.templates.set('python-test', Handlebars.compile(pyTestTemplate));
  }
  
  render(templateName: string, context: TemplateContext): string {
    // Check if template is already loaded
    let template = this.templates.get(templateName);
    
    // If not loaded, try to load it dynamically
    if (!template) {
      try {
        const templatePath = join(__dirname, `${templateName}`);
        const templateContent = readFileSync(templatePath, 'utf-8');
        template = Handlebars.compile(templateContent);
        this.templates.set(templateName, template);
      } catch (error) {
        throw new Error(`Template not found: ${templateName}`);
      }
    }
    
    return template(context);
  }
  
  renderTypeScriptServer(context: TemplateContext): string {
    return this.render('typescript-server', context);
  }
  
  renderPythonServer(context: TemplateContext): string {
    return this.render('python-server', context);
  }
  
  renderTypeScriptTest(context: TemplateContext): string {
    return this.render('typescript-test', context);
  }
  
  renderPythonTest(context: TemplateContext): string {
    return this.render('python-test', context);
  }
}

export function pascalCase(str: string): string {
  return str
    // Remove invalid characters (parentheses, special chars)
    .replace(/[^a-zA-Z0-9\s\-_]/g, '')
    // Convert to PascalCase
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^[a-z]/, (c) => c.toUpperCase());
}

export function escapeString(str: string): string {
  return str.replace(/'/g, "\\'").replace(/\n/g, ' ');
}

// Made with Bob
