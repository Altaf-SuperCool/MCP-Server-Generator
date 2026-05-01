# MCP Server Generator

> An intelligent CLI tool that generates production-ready Model Context Protocol (MCP) servers from API specifications using IBM Bob AI.

## 🎉 Status: Production Ready! (Day 3 Complete)

The MCP Server Generator is now **production-ready** with full Docker/Kubernetes support, enhanced CLI, and comprehensive features!

## 📖 Overview

This repository contains comprehensive planning documentation for building an MCP Server Generator that can automatically create fully-functional MCP servers from API specifications in just 3 days.

## 🎯 What This Project Does

The MCP Server Generator will:
- Parse API specifications (OpenAPI, GraphQL, REST)
- Use IBM Bob AI to intelligently map endpoints to MCP primitives
- Generate complete server code in TypeScript or Python
- Include authentication, error handling, tests, and deployment configs
- Produce production-ready code in under 30 seconds

## 📚 Documentation Structure

### Quick Start
- **[PROJECT-SUMMARY.md](PROJECT-SUMMARY.md)** - Executive overview and quick reference
- **[3-DAY-QUICK-START.md](3-DAY-QUICK-START.md)** - Condensed 3-day implementation guide

### Detailed Planning
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Complete system architecture and design
- **[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)** - Detailed technical specifications with code examples

### This Document
- **README.md** - You are here! Navigation and overview

## 🚀 Quick Navigation

### For Project Managers
Start with [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) to understand:
- Project goals and scope
- Timeline and milestones
- Success metrics
- Resource requirements

### For Developers
1. Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design
2. Follow [3-DAY-QUICK-START.md](3-DAY-QUICK-START.md) for implementation
3. Reference [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for detailed code examples

### For Stakeholders
Review [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) for:
- Expected outcomes
- Success criteria
- Technology stack
- Next steps

## 🏗️ Architecture at a Glance

```
┌─────────────────────────────────────────────────────┐
│                  MCP Generator CLI                  │
│                                                     │
│  User Input → Bob Analysis → Code Generation       │
│     ↓              ↓              ↓                 │
│  API Spec    Tool Mapping   MCP Server Code        │
│  (OpenAPI)   (Resources)    (TypeScript/Python)    │
└─────────────────────────────────────────────────────┘
```

**Key Innovation**: IBM Bob AI analyzes API specifications and intelligently maps endpoints to MCP primitives:
- GET endpoints → MCP Resources (read-only data)
- POST/PUT/DELETE → MCP Tools (actions)

## 📋 Implementation Roadmap

### Day 1: Core Generator (10 hours) ✅ COMPLETE
- ✅ Project setup and CLI framework
- ✅ OpenAPI parser implementation
- ✅ GraphQL parser implementation
- ✅ IBM Bob integration for intelligent mapping
- ✅ Basic code generation (TypeScript & Python)
- ✅ MCP Inspector testing

### Day 2: Features & Templates (10 hours) ✅ COMPLETE
- ✅ TypeScript and Python server templates
- ✅ Authentication layer (API Key, Bearer, OAuth2, Basic)
- ✅ Input validation (Zod/Pydantic)
- ✅ Retry logic with exponential backoff
- ✅ Error handling and structured responses
- ✅ Documentation generator (README, .env.example)
- ✅ Test suite generator (Jest/Pytest)

### Day 3: Polish & Production (8 hours) ✅ COMPLETE
- ✅ Docker support (multi-stage builds)
- ✅ docker-compose.yml configuration
- ✅ Kubernetes manifests (Deployment, Service, ConfigMap, Secrets)
- ✅ Enhanced CLI with beautiful UX (chalk, ora)
- ✅ Example project (GitHub API)
- ✅ Comprehensive documentation
- ✅ Production-ready output

**Total**: 28 working hours over 3 days - **ALL COMPLETE!**

## 🛠️ Technology Stack

### Generator Tool
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **CLI**: commander, inquirer, chalk, ora
- **Parsing**: swagger-parser, graphql, js-yaml
- **Templates**: Handlebars
- **Testing**: Jest

### Generated Servers
- **TypeScript**: @modelcontextprotocol/sdk + Zod + axios
- **Python**: mcp + FastMCP + Pydantic + httpx

## ✨ Key Features

### 🤖 Bob AI Prompt Integration (New!)
- ✅ **Display Mode** - Get prompts to copy-paste into any AI assistant (Claude, ChatGPT, etc.)
- ✅ **Auto Mode** - Automatically generate using OpenAI API
- ✅ **Three-Stage Strategy** - API Analysis → Code Generation → Test Generation
- ✅ **No Lock-in** - Works with any AI assistant, not just one provider
- ✅ **Full Control** - Review and customize at each stage

### 🎯 Input Support
- ✅ OpenAPI 3.x and Swagger 2.0 (JSON, YAML)
- ✅ GraphQL Schema Definition Language
- ✅ Custom REST endpoint descriptors
- ✅ URL or local file paths

### 💻 Output Languages
- ✅ **TypeScript** - Using @modelcontextprotocol/sdk with Zod validation
- ✅ **Python** - Using mcp with FastMCP and Pydantic validation

### 🔐 Authentication Methods
- ✅ API Key (header or query parameter)
- ✅ Bearer Token (Authorization header)
- ✅ OAuth2 (Authorization Code & Client Credentials)
- ✅ Basic Authentication (username/password)
- ✅ Environment variable configuration
- ✅ Kubernetes Secrets integration

### 🚀 Transport Protocols
- ✅ STDIO (standard input/output) - Default for MCP
- ✅ HTTP with Server-Sent Events (SSE)
- ✅ Configurable per deployment

### 📦 Generated Artifacts
- ✅ Complete server code with MCP SDK integration
- ✅ Unit and integration tests (Jest/Pytest)
- ✅ Comprehensive documentation (README, API docs)
- ✅ **Docker configuration** (multi-stage builds)
- ✅ **docker-compose.yml** for easy deployment
- ✅ **Kubernetes manifests** (Deployment, Service, ConfigMap, Secrets)
- ✅ package.json / requirements.txt with all dependencies
- ✅ .env.example for configuration
- ✅ .gitignore and .dockerignore

### 🎨 CLI Features
- ✅ Beautiful welcome banner
- ✅ Interactive prompts with validation
- ✅ Colorful output (chalk)
- ✅ Progress indicators (ora)
- ✅ Configuration summary
- ✅ Detailed next steps
- ✅ Help system with examples

### 🛡️ Production Features
- ✅ Input validation (Zod/Pydantic)
- ✅ Retry logic with exponential backoff
- ✅ Structured error handling
- ✅ Health checks for containers
- ✅ Resource limits for Kubernetes
- ✅ Non-root users for security
- ✅ Logging and monitoring ready

## 📊 Success Metrics

| Category | Metric | Target |
|----------|--------|--------|
| **Development** | Code Coverage | >85% |
| | Build Time | <2 min |
| | Test Execution | <5 min |
| **Generated Code** | Generation Time | <30s |
| | Code Quality | >85% |
| | Type Safety | 100% |
| **User Experience** | Time to First Server | <5 min |
| | Setup Success Rate | >95% |
| | Usability Score | >4/5 |

## 🎯 Expected Outcomes

By the end of Day 3, you will have:
- ✅ Working CLI tool that generates MCP servers
- ✅ Support for OpenAPI, GraphQL, and REST inputs
- ✅ TypeScript and Python code generation
- ✅ All authentication methods implemented
- ✅ Complete test suites
- ✅ Comprehensive documentation
- ✅ Docker and Kubernetes configurations
- ✅ Working example projects
- ✅ Demo video

## 🚦 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/Altaf-SuperCool/MCP-Server-Generator.git
cd MCP-Server-Generator

# Install dependencies
npm install

# Build the project
npm run build
```

### Quick Start - Two Ways to Generate Servers

#### Option 1: Traditional Generation (Automated)

```bash
# Interactive mode (recommended)
node dist/cli/index.js generate

# Follow the prompts to:
# 1. Select API type (OpenAPI/GraphQL/REST)
# 2. Provide API specification path
# 3. Choose output language (TypeScript/Python)
# 4. Configure authentication
# 5. Enable features (validation, retry, tests, Docker, K8s)
```

#### Option 2: Using Bob AI Prompts (New! 🤖)

```bash
# Display prompts to copy-paste into any AI assistant
node dist/cli/index.js prompts -i examples/github-api.yaml -m display

# Or auto-generate with OpenAI API
export OPENAI_API_KEY=sk-your-key
node dist/cli/index.js prompts -i examples/github-api.yaml -m auto
```

**See [USING-BOB-PROMPTS.md](USING-BOB-PROMPTS.md) for detailed guide on using prompts!**

### Example - Generate from GitHub API

```bash
# Use the included example
npm run dev

# When prompted:
# - Input type: OpenAPI
# - Input path: examples/github-api.yaml
# - Output: ./github-mcp-server
# - Language: typescript
# - Auth: bearer
# - Enable all features

# Then test it:
cd github-mcp-server
npm install
npm run build
npm test
npm start
```

### Non-Interactive Mode

```bash
# Generate with CLI options
npm run dev -- generate \
  -i examples/github-api.yaml \
  -o ./my-server \
  -l typescript
```
## 🧪 Testing

See **[COMPLETE-TESTING-GUIDE.md](COMPLETE-TESTING-GUIDE.md)** for comprehensive testing instructions including:
- Generator testing
- Bob prompt testing
- Generated server testing
- MCP Inspector integration
- Claude Desktop integration
- Docker and Kubernetes testing
- Troubleshooting guide


## 📖 Documentation Guide

### ARCHITECTURE.md (502 lines)
**Purpose**: Complete system design and architecture

**Contents**:
- System architecture with Mermaid diagrams
- Component descriptions
- Data flow visualization
- Technology stack details
- Implementation phases (8-week detailed plan)
- Success metrics
- Future enhancements

**Best For**: Understanding the overall system design and long-term vision

### IMPLEMENTATION_PLAN.md (1087 lines)
**Purpose**: Detailed technical specifications with code examples

**Contents**:
- Phase-by-phase implementation guide
- Complete code samples for each component
- Template structures and examples
- Testing strategies
- Success criteria for each phase

**Best For**: Developers who need detailed code examples and technical guidance

### 3-DAY-QUICK-START.md (197 lines)
**Purpose**: Condensed 3-day implementation roadmap

**Contents**:
- Hour-by-hour breakdown
- Quick reference commands
- Testing checklist
- Success criteria
- Next steps after completion

**Best For**: Quick reference during implementation

### PROJECT-SUMMARY.md (408 lines)
**Purpose**: Executive overview connecting all planning documents

**Contents**:
- Project goals and scope
- Document navigation
- Technology stack summary
- Todo list (21 items)
- Success metrics
- Next steps

**Best For**: Project managers and stakeholders

## 🎓 Learning Resources

### MCP Documentation
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
- [MCP Specification](https://modelcontextprotocol.io/)
- [FastMCP Guide](https://github.com/jlowin/fastmcp)

### API Specifications
- [OpenAPI Specification](https://swagger.io/specification/)
- [GraphQL Schema Language](https://graphql.org/learn/schema/)

### Best Practices
- [TypeScript Best Practices](https://typescript-eslint.io/)
- [Python Best Practices (PEP 8)](https://peps.python.org/pep-0008/)

## 💡 Pro Tips

1. **Start Simple**: Get basic generation working on Day 1 before adding features
2. **Test Early**: Test with MCP Inspector after each major component
3. **Use Templates**: Leverage Handlebars for maintainable code generation
4. **Bob Integration**: Let Bob handle complex mapping logic
5. **Incremental Development**: Build and test one feature at a time
6. **Real APIs**: Test with actual API specs (GitHub, Stripe, etc.)
7. **Documentation**: Generate docs alongside code for consistency

## 🤝 Contributing

This is planning documentation. Once implementation begins:
1. Follow the 3-day roadmap
2. Use code examples from IMPLEMENTATION_PLAN.md
3. Test incrementally
4. Document as you go

## 📞 Support

### Questions About Planning?
- Review [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) for overview
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for design decisions
- See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for technical details

### Ready to Implement?
- Follow [3-DAY-QUICK-START.md](3-DAY-QUICK-START.md)
- Reference code examples in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
- Test with MCP Inspector regularly

## 🏁 What's Next

### For Users
1. ✅ Clone and install the generator
2. ✅ Generate your first MCP server
3. ✅ Test with MCP Inspector
4. ✅ Deploy with Docker or Kubernetes
5. ✅ Integrate with Claude Desktop

### For Contributors
1. ⏳ Add more API parsers (REST, SOAP)
2. ⏳ Support more languages (Go, Rust)
3. ⏳ Add more authentication methods
4. ⏳ Create video tutorials
5. ⏳ Build community examples

## 📝 Todo List Summary

**21 tasks across 3 days**:
- Day 1: 7 tasks (Core generator)
- Day 2: 8 tasks (Features & templates)
- Day 3: 6 tasks (Polish & demo)

See [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) for the complete todo list.

## 📚 Documentation

- **[DAY-1-SUMMARY.md](DAY-1-SUMMARY.md)** - Day 1 implementation details
- **[DAY-2-SUMMARY.md](DAY-2-SUMMARY.md)** - Day 2 features and templates
- **[DAY-3-SUMMARY.md](DAY-3-SUMMARY.md)** - Day 3 Docker/K8s and polish
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture
- **[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)** - Technical specifications
- **[3-DAY-QUICK-START.md](3-DAY-QUICK-START.md)** - Quick reference guide

## 🎉 Project Complete!

The MCP Server Generator is now **production-ready** with:
- ✅ Complete architecture and implementation
- ✅ TypeScript and Python code generation
- ✅ All authentication methods
- ✅ Docker and Kubernetes support
- ✅ Beautiful CLI with excellent UX
- ✅ Comprehensive testing
- ✅ Full documentation
- ✅ Example projects

**Start generating MCP servers today! 🚀**

---

**Last Updated**: May 1, 2026
**Status**: ✅ Production Ready (Day 3 Complete)
**Version**: 1.0.0
**License**: ISC#   M C P - S e r v e r - G e n e r a t o r  
 