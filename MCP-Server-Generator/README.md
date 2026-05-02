# MCP Server Generator

> An intelligent CLI tool that generates production-ready Model Context Protocol (MCP) servers from API specifications using IBM Bob AI.

## Status

Production ready — Day 3 complete.

## Overview

`MCP Server Generator` converts API specifications into fully working MCP servers in TypeScript or Python. It supports OpenAPI, GraphQL, and REST inputs and generates production-ready output with authentication, validation, tests, Docker, and Kubernetes support.

## Documentation

- **[PROJECT-SUMMARY.md](PROJECT-SUMMARY.md)** — Executive overview and quick reference
- **[3-DAY-QUICK-START.md](3-DAY-QUICK-START.md)** — Condensed implementation guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — System design and architecture
- **[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)** — Detailed technical specifications
- **[USING-BOB-PROMPTS.md](USING-BOB-PROMPTS.md)** — Prompt usage guide

## Key Features

- Automatic MCP server generation from OpenAPI, GraphQL, or REST specs
- Output in **TypeScript** or **Python**
- Built-in authentication support (API Key, Bearer, OAuth2, Basic)
- Validation using **Zod** (TypeScript) or **Pydantic** (Python)
- Auto-generated tests for Jest and Pytest
- Docker and Kubernetes deployment templates
- Bob AI prompt integration for assisted generation
- CLI-driven workflow with interactive prompts and summaries

## Why This Project Is Unique

- **MCP-first generation**: Converts API specifications into MCP Resources and Tools rather than generic server scaffolding.
- **AI-assisted mapping**: Uses IBM Bob-style prompt workflows to analyze API semantics and choose the right MCP primitives.
- **Full-stack output**: Generates server code, validation, tests, documentation, Docker, and Kubernetes artifacts in one pass.
- **Flexible AI workflow**: Supports both manual prompt display and automated AI generation via OpenAI-compatible APIs.

## Design and Usability

- **Fast onboarding**: A single CLI command can generate a complete server project from a specification.
- **Guided developer experience**: Interactive prompts and help text make the tool easy to use for both junior and senior engineers.
- **Production-ready structure**: Generated output includes standard files like `README.md`, `.env.example`, `package.json`, and test suites.
- **Deployment-ready**: Built-in Docker and Kubernetes templates reduce time-to-production for cloud-native teams.
- **Clear adoption path**: Clone, install, generate, install dependencies, and run.

## Effectiveness and Efficiency

- **Solves a high-priority problem**: Rapidly converting API specs into working MCP services reduces manual implementation and integration risk.
- **Measurable impact**: Designed to generate code in under 30 seconds and support fast prototyping of API-driven services.
- **Scalable use cases**: Useful for internal platform teams, AI service builders, integration engineers, and MCP adopters.
- **Extensible architecture**: The generator can be extended to support more API formats, deployment targets, and enterprise workflows.

## Supported Inputs

- OpenAPI 3.x / Swagger 2.0 (JSON or YAML)
- GraphQL SDL
- Custom REST endpoint descriptors
- Local files or remote URLs

## Supported Outputs

- TypeScript MCP servers using `@modelcontextprotocol/sdk`
- Python MCP servers using `mcp`, `FastMCP`, and `Pydantic`
- Docker multi-stage builds
- `docker-compose.yml`
- Kubernetes manifests (Deployment, Service, ConfigMap, Secrets)

## Getting Started

### Installation

```bash
git clone https://github.com/Altaf-SuperCool/MCP-Server-Generator.git
cd MCP-Server-Generator
npm install
npm run build
```

### Generate a Server

```bash
node dist/cli/index.js generate
```

The CLI will prompt for:

- API specification type
- API spec location
- Output language
- Authentication and validation options
- Deployment and test settings

### Use Bob AI Prompts

Display prompts for any AI assistant:

```bash
node dist/cli/index.js prompts -i examples/github-api.yaml -m display
```

Auto-generate using OpenAI:

```bash
export OPENAI_API_KEY=sk-your-key
node dist/cli/index.js prompts -i examples/github-api.yaml -m auto
```

## Example Workflow

1. Run `npm run dev`
2. Choose `OpenAPI`
3. Set `examples/github-api.yaml` as the input
4. Choose output directory and language
5. Review generated project files

## Architecture at a Glance

```text
┌─────────────────────────────────────────────────────┐
│                  MCP Generator CLI                  │
│                                                     │
│  User Input → Bob Analysis → Code Generation       │
│     ↓              ↓              ↓                 │
│  API Spec    Tool Mapping   MCP Server Code        │
│  (OpenAPI)   (Resources)    (TypeScript/Python)    │
└─────────────────────────────────────────────────────┘
```

## Technology Stack

- Node.js 18+
- TypeScript
- Handlebars templates
- commander, inquirer, chalk, ora
- swagger-parser, graphql, js-yaml
- Jest for generator tests

Generated servers use:

- TypeScript: `@modelcontextprotocol/sdk`, `Zod`, `axios`
- Python: `mcp`, `FastMCP`, `Pydantic`, `httpx`

## Project Status

The generator is complete with the following functionality:

- CLI scaffolding and file generation
- OpenAPI and GraphQL parsing
- Bob AI prompt workflows
- Authentication and validation
- Test scaffolding
- Docker and Kubernetes output
- Documentation generation

## Additional Notes

Refer to `ARCHITECTURE.md`, `IMPLEMENTATION_PLAN.md`, and `3-DAY-QUICK-START.md` for deeper planning and implementation details.
