#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';

const BASE_URL = 'https://api.github.com';

// Zod schemas for validation

class GitHubAPISimplifiedServer {
  private server: Server;
  private axiosInstance: AxiosInstance;
  
  constructor() {
    this.server = new Server(
      {
        name: 'GitHub API (Simplified)',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );
    
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'GitHub API (Simplified)-MCP-Server/1.0.0',
      },
      timeout: 30000,
    });
    
    // Add retry logic
    this.setupRetryInterceptor();
    
    this.setupHandlers();
  }
  
  private setupRetryInterceptor(): void {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        if (!config || !config.retry) {
          config.retry = 0;
        }
        
        if (config.retry >= 3) {
          return Promise.reject(error);
        }
        
        config.retry += 1;
        const delay = Math.pow(2, config.retry) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.axiosInstance(config);
      }
    );
  }
  
  private setupHandlers(): void {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
      ]
    }));
    
    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        // Validate input
        switch (name) {
        }
        
        switch (name) {
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
    
    // List resources handler
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'resource:///users/{username}',
          name: 'getUser',
          description: 'Retrieve information about a GitHub user',
          mimeType: 'application/json'
        },
        {
          uri: 'resource:///users/{username}/repos',
          name: 'listUserRepos',
          description: 'List public repositories for a user',
          mimeType: 'application/json'
        },
        {
          uri: 'resource:///repos/{owner}/{repo}',
          name: 'getRepository',
          description: 'Get information about a repository',
          mimeType: 'application/json'
        },
        {
          uri: 'resource:///repos/{owner}/{repo}/issues',
          name: 'listIssues',
          description: 'List issues for a repository',
          mimeType: 'application/json'
        },
      ]
    }));
    
    // Read resource handler
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;
      
      try {
        if (uri === 'resource:///users/{username}') {
          return await this.getUser();
        }
        if (uri === 'resource:///users/{username}/repos') {
          return await this.listUserRepos();
        }
        if (uri === 'resource:///repos/{owner}/{repo}') {
          return await this.getRepository();
        }
        if (uri === 'resource:///repos/{owner}/{repo}/issues') {
          return await this.listIssues();
        }
        
        throw new Error(`Unknown resource: ${uri}`);
      } catch (error: any) {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: `Error: ${error.message}`
            }
          ]
        };
      }
    });
  }
  
  // Tool implementations
  
  // Resource implementations
  private async getUser(): Promise<any> {
    try {
      const response = await this.axiosInstance.request({
        method: 'GET',
        url: '/users/{username}',
      });
      
      return {
        contents: [
          {
            uri: 'resource:///users/{username}',
            mimeType: 'application/json',
            text: JSON.stringify(response.data, null, 2)
          }
        ]
      };
    } catch (error: any) {
      throw new Error(`Failed to read getUser: ${error.message}`);
    }
  }
  
  private async listUserRepos(): Promise<any> {
    try {
      const response = await this.axiosInstance.request({
        method: 'GET',
        url: '/users/{username}/repos',
      });
      
      return {
        contents: [
          {
            uri: 'resource:///users/{username}/repos',
            mimeType: 'application/json',
            text: JSON.stringify(response.data, null, 2)
          }
        ]
      };
    } catch (error: any) {
      throw new Error(`Failed to read listUserRepos: ${error.message}`);
    }
  }
  
  private async getRepository(): Promise<any> {
    try {
      const response = await this.axiosInstance.request({
        method: 'GET',
        url: '/repos/{owner}/{repo}',
      });
      
      return {
        contents: [
          {
            uri: 'resource:///repos/{owner}/{repo}',
            mimeType: 'application/json',
            text: JSON.stringify(response.data, null, 2)
          }
        ]
      };
    } catch (error: any) {
      throw new Error(`Failed to read getRepository: ${error.message}`);
    }
  }
  
  private async listIssues(): Promise<any> {
    try {
      const response = await this.axiosInstance.request({
        method: 'GET',
        url: '/repos/{owner}/{repo}/issues',
      });
      
      return {
        contents: [
          {
            uri: 'resource:///repos/{owner}/{repo}/issues',
            mimeType: 'application/json',
            text: JSON.stringify(response.data, null, 2)
          }
        ]
      };
    } catch (error: any) {
      throw new Error(`Failed to read listIssues: ${error.message}`);
    }
  }
  
  
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('GitHub API (Simplified) MCP server running on stdio');
  }
}

const server = new GitHubAPISimplifiedServer();
server.run().catch(console.error);