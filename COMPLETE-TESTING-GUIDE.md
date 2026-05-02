# MCP Server Generator - Complete Testing Guide

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Generator Testing](#generator-testing)
3. [Bob Prompt Testing](#bob-prompt-testing)
4. [Generated Server Testing](#generated-server-testing)
5. [Integration Testing](#integration-testing)
6. [Docker & Kubernetes Testing](#docker--kubernetes-testing)
7. [Quick Reference](#quick-reference)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Run All Tests

```bash
# Build and test the generator
npm run build
npm test

# Test Bob prompts
npm run test:bob:build

# Generate a test server
npm run dev

# Test the generated server
cd test-github-server
npm install
npm run build
npm test
```

### Expected Results

- ✅ Generator builds without errors
- ✅ Bob prompt tests pass with >80% score
- ✅ Generated server compiles and runs
- ✅ All tests pass

---

## 🔧 Generator Testing

### Phase 1: Build Verification

```bash
npm run build
```

**Expected Output:**
```
> mcp-server-generator@1.0.0 build
> tsc

✓ Compiled successfully
```

**Verify:**
- ✅ No TypeScript errors
- ✅ `dist/` directory created
- ✅ All files compiled

### Phase 2: CLI Testing

```bash
# Test help command
npm run dev -- --help

# Test version
npm run dev -- --version

# Test non-interactive mode
npm run dev -- generate -i examples/github-api.yaml -o ./test-server -l typescript
```

**Expected Output:**
```
╔═══════════════════════════════════════════════════════════╗
║   MCP Server Generator                                    ║
║   Generate production-ready MCP servers from APIs         ║
╚═══════════════════════════════════════════════════════════╝

✓ API specification parsed successfully
✓ API analysis complete (4 tools, 0 resources)
✓ Server code generated successfully

✨ MCP Server generated successfully!
```

### Phase 3: Interactive Mode Testing

```bash
npm run dev
```

**Test Scenarios:**

1. **TypeScript Generation**
   - Input: `examples/github-api.yaml`
   - Language: `typescript`
   - Auth: `bearer`
   - All features: `Yes`

2. **Python Generation**
   - Input: `examples/github-api.yaml`
   - Language: `python`
   - Auth: `apikey`
   - All features: `Yes`

3. **Minimal Generation**
   - Input: `examples/github-api.yaml`
   - Language: `typescript`
   - Auth: `none`
   - Features: `No` to Docker/K8s

---

## 🤖 Bob Prompt Testing

### Overview

The Bob prompt design consists of three stages:

1. **Prompt 1: API Analysis** - Maps API endpoints to MCP primitives
2. **Prompt 2: Code Generation** - Generates production-ready code
3. **Prompt 3: Test Generation** - Creates comprehensive test suites

### Run Bob Tests

```bash
# Build and test
npm run test:bob:build

# Or just test (if already built)
npm run test:bob
```

### Stage 1: API Analysis Testing

**What It Tests:**
- ✅ Correct mapping of GET endpoints to MCP Resources
- ✅ Correct mapping of POST/PUT/DELETE/PATCH to MCP Tools
- ✅ Parameter extraction and validation
- ✅ Response format identification
- ✅ Authentication requirement detection

**Key Decision Rules:**
- GET → **Resource** (provides data)
- POST/PUT/DELETE/PATCH → **Tool** (performs action)

**Expected Output:**
```json
{
  "endpoints": [
    {
      "path": "/users/{username}",
      "method": "GET",
      "mcpType": "resource",
      "parameters": [...],
      "responseFormat": "application/json",
      "authRequired": true,
      "reasoning": "GET endpoint provides data - mapped to MCP Resource"
    }
  ],
  "summary": {
    "totalEndpoints": 4,
    "toolsCount": 0,
    "resourcesCount": 4,
    "authMethods": ["bearer", "apikey"]
  }
}
```

### Stage 2: Code Generation Testing

**What It Tests:**
- ✅ Error handling (try/catch blocks)
- ✅ Input validation (Zod for TypeScript, Pydantic for Python)
- ✅ Authentication implementation
- ✅ Logging to stderr (not stdout)
- ✅ Correct transport protocol (STDIO/HTTP)
- ✅ Comprehensive code comments

**Quality Metrics:**
```typescript
{
  hasErrorHandling: boolean,      // 16.67% weight
  hasInputValidation: boolean,    // 16.67% weight
  hasAuthentication: boolean,     // 16.67% weight
  hasLogging: boolean,            // 16.67% weight
  hasCorrectTransport: boolean,   // 16.67% weight
  hasComments: boolean,           // 16.67% weight
  score: number                   // Overall score
}
```

**Example Output:**
```
✅ Code Quality Checks:
   ✓ Error Handling
   ✓ Input Validation
   ✓ Authentication
   ✓ Logging to stderr
   ✓ Correct Transport
   ✓ Comprehensive Comments

📊 Quality Score: 100%
```

### Stage 3: Test Generation Testing

**What It Tests:**
- ✅ Unit tests for each tool/resource
- ✅ Integration tests for the server
- ✅ Mock API responses
- ✅ Edge case handling
- ✅ Authentication tests
- ✅ Test coverage metrics

**Coverage Metrics:**
```typescript
{
  testCoverage: {
    tools: number,      // Number of tools in server
    resources: number,  // Number of resources in server
    total: number       // Total test cases
  }
}
```

**Example Output:**
```
✅ Test Suite Checks:
   ✓ Unit Tests
   ✓ Integration Tests
   ✓ Mock API Responses
   ✓ Edge Case Handling
   ✓ Authentication Tests

📊 Test Coverage:
   Total Test Cases: 12
   Tools in Server: 0
   Resources in Server: 4

📊 Quality Score: 100%
```

### Interpreting Bob Test Results

**Overall Score Ranges:**

| Score | Status | Action |
|-------|--------|--------|
| 90-100% | ✨ Excellent | Production ready |
| 80-89% | ✅ Good | Minor improvements |
| 70-79% | ⚠️ Fair | Review issues |
| <70% | ❌ Needs work | Major improvements needed |

**Example Test Results:**
```
🎯 Overall Score: 72%
⚠️  GOOD, but needs improvement in some areas.

✅ Prompt 1 (API Analysis): 100%
   - Correctly mapped 4 GET endpoints to Resources
   - Extracted all parameters
   - Identified authentication requirements

✅ Prompt 2 (Code Generation): 83%
   - Has error handling ✓
   - Has input validation ✓
   - Missing explicit authentication ✗
   - Has logging ✓
   - Has correct transport ✓
   - Has comments ✓

⚠️  Prompt 3 (Test Generation): 60%
   - Missing unit tests ✗
   - Has integration tests ✓
   - Missing mock responses ✗
   - Has edge cases ✓
   - Has auth tests ✓
```

### Common Issues and Fixes

#### Issue 1: Missing Authentication (Prompt 2)

**Symptom:** Score < 100%, "Missing: Authentication"

**Solution:**
```typescript
// Add to API client
headers: {
  'Authorization': `Bearer ${process.env.API_TOKEN}`,
  'Accept': 'application/json'
}
```

#### Issue 2: Missing Unit Tests (Prompt 3)

**Symptom:** Score low, "Missing: Unit Tests"

**Solution:**
```typescript
describe('Unit Tests', () => {
  describe('toolName', () => {
    it('should handle valid input', () => {
      // Test code
    });
  });
});
```

#### Issue 3: Missing Mock Responses (Prompt 3)

**Symptom:** Score low, "Missing: Mock API Responses"

**Solution:**
```typescript
beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data: 'mock' })
  });
});
```

---

## 🧪 Generated Server Testing

### TypeScript Server Testing

```bash
cd test-github-server

# Install dependencies
npm install

# Verify package.json
cat package.json
```

**Expected Dependencies:**
- `@modelcontextprotocol/sdk`
- `axios`
- `dotenv`
- `zod` (if validation enabled)
- `express` (if HTTP transport)

```bash
# Build
npm run build

# Verify build output
ls -la dist/
```

**Expected Files:**
- `dist/index.js`
- `dist/index.d.ts`
- `dist/index.js.map`

```bash
# Run tests
npm test
```

**Expected Output:**
```
PASS  tests/server.test.ts
  ✓ Server initializes correctly
  ✓ Tools are registered
  ✓ Resources are available
  ✓ Authentication works
  ✓ Error handling works

Tests: 5 passed, 5 total
Time: 2.5s
```

### Python Server Testing

```bash
cd test-github-server-python

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Verify dependencies
pip list
```

**Expected Packages:**
- `mcp`
- `httpx`
- `fastmcp`
- `python-dotenv`
- `pydantic` (if validation enabled)
- `fastapi`, `uvicorn` (if HTTP transport)

```bash
# Run tests
pytest

# With coverage
pytest --cov
```

**Expected Output:**
```
===== test session starts =====
collected 5 items

tests/test_server.py .....  [100%]

===== 5 passed in 1.23s =====
```

---

## 🔌 Integration Testing

### MCP Inspector Testing

#### Start MCP Inspector

```bash
cd test-github-server

# For TypeScript
npx @modelcontextprotocol/inspector dist/index.js

# For Python
npx @modelcontextprotocol/inspector python main.py
```

**Expected Output:**
```
MCP Inspector
Connected to: github-mcp-server

Available Tools:
  - getUser: Get user by username
  - listUserRepos: List user repositories
  - getRepository: Get repository details
  - listIssues: List repository issues

Available Resources:
  (none)

Type 'help' for commands
```

#### Test Tool Execution

```bash
# In MCP Inspector console
> call getUser {"username": "octocat"}
```

**Expected Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"login\":\"octocat\",\"id\":1,...}"
    }
  ]
}
```

#### Test Error Handling

```bash
# Test with invalid input
> call getUser {}
```

**Expected Response:**
```json
{
  "error": {
    "code": "INVALID_PARAMS",
    "message": "Missing required parameter: username"
  }
}
```

### Claude Desktop Integration

#### Configure Claude Desktop

**Location:** `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)

```json
{
  "mcpServers": {
    "github-test": {
      "command": "node",
      "args": ["/absolute/path/to/test-github-server/dist/index.js"],
      "env": {
        "API_TOKEN": "your-github-token-here"
      }
    }
  }
}
```

#### Test in Claude Desktop

1. **Restart Claude Desktop**
2. **Verify Connection**
   - Look for MCP icon in Claude
   - Should show "github-test" server

3. **Test Tools**
   ```
   User: "Can you get information about the octocat user on GitHub?"
   
   Claude: [Uses getUser tool]
   Result: User information displayed
   ```

4. **Test Multiple Tools**
   ```
   User: "List the repositories for user octocat"
   
   Claude: [Uses listUserRepos tool]
   Result: Repository list displayed
   ```

---

## 🐳 Docker & Kubernetes Testing

### Docker Testing

#### Build Docker Image

```bash
cd test-github-server

# Build image
docker build -t test-github-server .
```

**Expected Output:**
```
[+] Building 45.2s (12/12) FINISHED
 => [internal] load build definition
 => => transferring dockerfile
 => [internal] load .dockerignore
 => [stage-0 1/4] FROM node:20-alpine
 => [stage-0 2/4] COPY package*.json ./
 => [stage-0 3/4] RUN npm ci
 => [stage-0 4/4] COPY src ./src
 => [stage-1 1/3] COPY --from=builder /app/dist ./dist
 => exporting to image
 => => naming to docker.io/library/test-github-server
```

#### Run Docker Container

```bash
# Run with environment variables
docker run -e API_TOKEN=your-token test-github-server

# Run with docker-compose
docker-compose up
```

**Expected Output:**
```
test-github-server | Server started on STDIO
test-github-server | Listening for MCP requests...
```

#### Test Docker Health Check

```bash
# Check container health
docker ps

# Should show "healthy" status
```

> Note: Current validation confirmed the generated Docker image built and the container started successfully for `mcp-server-test`.

### Kubernetes Testing

#### Update Secrets

```bash
cd test-github-server/k8s

# Edit configmap.yaml
# Replace YOUR_API_TOKEN_HERE with actual token
```

#### Deploy to Kubernetes

```bash
# Apply configurations
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml

# Verify deployment
kubectl get deployments
kubectl get pods
```

**Expected Output:**
```
NAME                  READY   STATUS    RESTARTS   AGE
test-github-server    2/2     Running   0          30s
```

#### Check Logs

```bash
# View logs
kubectl logs -f deployment/test-github-server

# Check health
kubectl get pods -o wide
```

---

## 📚 Quick Reference

### Testing Commands

```bash
# Generator Tests
npm run build                    # Build generator
npm test                         # Run unit tests
npm run dev                      # Interactive generation

# Bob Prompt Tests
npm run test:bob:build          # Build and test Bob prompts
npm run test:bob                # Test Bob prompts (no build)

# Generated Server Tests
cd test-github-server
npm install                      # Install dependencies
npm run build                    # Build server
npm test                         # Run tests
npm start                        # Start server

# Docker Tests
docker build -t server .         # Build image
docker run server                # Run container
docker-compose up                # Run with compose

# Kubernetes Tests
kubectl apply -f k8s/            # Deploy to K8s
kubectl get pods                 # Check status
kubectl logs <pod>               # View logs
```

### Quality Score Ranges

| Score | Status | Action |
|-------|--------|--------|
| 90-100% | ✨ Excellent | Production ready |
| 80-89% | ✅ Good | Minor improvements |
| 70-79% | ⚠️ Fair | Review issues |
| <70% | ❌ Needs work | Major improvements needed |

### MCP Mapping Rules

```
GET /resource        → MCP Resource (read data)
POST /resource       → MCP Tool (create)
PUT /resource/{id}   → MCP Tool (update)
DELETE /resource/{id}→ MCP Tool (delete)
PATCH /resource/{id} → MCP Tool (partial update)

Query { data }       → MCP Resource (read data)
Mutation { action }  → MCP Tool (perform action)
```

### Code Quality Checklist

- [ ] Error handling (try/catch)
- [ ] Input validation (Zod/Pydantic)
- [ ] Authentication headers
- [ ] Logging to stderr
- [ ] Correct transport (STDIO/HTTP)
- [ ] Comprehensive comments

### Test Coverage Checklist

- [ ] Unit tests for each tool/resource
- [ ] Integration tests
- [ ] Mock API responses
- [ ] Edge case handling
- [ ] Authentication tests
- [ ] Error scenario tests

---

## 🐛 Troubleshooting

### Generator Issues

**Problem:** Build fails
```bash
# Solution: Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

**Problem:** Template not found
```bash
# Solution: Check template paths
ls -la src/templates/
```

### Generated Server Issues

**Problem:** TypeScript compilation errors
```bash
# Solution: Check tsconfig.json
cat tsconfig.json
# Verify all dependencies installed
npm install
```

**Problem:** Python import errors
```bash
# Solution: Verify virtual environment
which python
pip list
# Reinstall dependencies
pip install -r requirements.txt
```

### MCP Inspector Issues

**Problem:** Cannot connect
```bash
# Solution: Check server is running
ps aux | grep node
# Check STDIO output
node dist/index.js
```

**Problem:** Tools not showing
```bash
# Solution: Check server registration
# Verify tools are registered in code
grep -r "registerTool" src/
```

### Docker Issues

**Problem:** Build fails
```bash
# Solution: Check Dockerfile
cat Dockerfile
# Build with verbose output
docker build --progress=plain -t test-server .
```

**Problem:** Container exits immediately
```bash
# Solution: Check logs
docker logs <container-id>
# Run interactively
docker run -it test-server sh
```

### Kubernetes Issues

**Problem:** Pods not starting
```bash
# Solution: Check events
kubectl describe pod <pod-name>
# Check logs
kubectl logs <pod-name>
```

**Problem:** Health checks failing
```bash
# Solution: Check probe configuration
kubectl describe deployment test-github-server
# Test health endpoint manually
kubectl exec -it <pod-name> -- curl localhost:3000/health
```

### Bob Prompt Issues

**Problem:** Low quality score
```bash
# Solution: Review specific issues
npm run test:bob
# Check the detailed output for missing features
# Update templates or prompts accordingly
```

**Problem:** Wrong MCP type mapping
```bash
# Solution: Verify endpoint has side effects
# GET → Resource (no side effects)
# POST/PUT/DELETE → Tool (has side effects)
```

---

## 📊 Success Criteria

### Generator
- ✅ Builds without errors
- ✅ Generates valid code
- ✅ Creates all required files
- ✅ CLI works correctly

### Bob Prompts
- ✅ API analysis score: 100%
- ✅ Code generation score: ≥80%
- ✅ Test generation score: ≥80%
- ✅ Overall score: ≥80%

### Generated Server
- ✅ Compiles/runs without errors
- ✅ Tests pass (>80% coverage)
- ✅ MCP Inspector connects
- ✅ Tools work correctly
- ✅ Authentication works
- ✅ Error handling works

### Integration
- ✅ Claude Desktop integration works
- ✅ Docker builds and runs
- ⚠️ Kubernetes manifests generated; runtime deployment not executed in this run
- ✅ Health checks pass
- ✅ Logs are accessible

---

## 🎯 Performance Benchmarks

### Generator Performance
- Build time: < 10 seconds
- Generation time: < 5 seconds
- Memory usage: < 200MB

### Generated Server Performance
- Startup time: < 2 seconds
- Tool execution: < 500ms
- Memory usage: < 100MB
- Docker image size: < 200MB

---

## 📝 Best Practices

1. **Always test after generation**
   ```bash
   npm run dev generate
   npm run test:bob
   ```

2. **Review issues carefully**
   - Don't ignore warnings
   - Fix issues before deploying

3. **Maintain high scores**
   - Target: ≥ 80% overall
   - Update templates if scores drop

4. **Use real APIs**
   - Test with actual API specs
   - Validate against production requirements

5. **Iterate on prompts**
   - If scores are low, refine the prompts
   - Update templates based on feedback

---

## 🚀 Next Steps

After successful testing:

1. **Document Issues**
   - Create GitHub issues for bugs
   - Document workarounds

2. **Performance Optimization**
   - Profile slow operations
   - Optimize template rendering
   - Reduce Docker image size

3. **Additional Testing**
   - Load testing
   - Security testing
   - Cross-platform testing

4. **Release Preparation**
   - Update version numbers
   - Create release notes
   - Tag release

---

## 📖 Resources

- [MCP Specification](https://modelcontextprotocol.io)
- [OpenAPI Specification](https://swagger.io/specification/)
- [GraphQL Schema](https://graphql.org/learn/schema/)
- [Zod Documentation](https://zod.dev)
- [Pydantic Documentation](https://docs.pydantic.dev)

---

**Happy Testing! 🎉**

For issues or questions, open a GitHub issue.

**Made with Bob** 🤖

*Last Updated: 2026-05-01*