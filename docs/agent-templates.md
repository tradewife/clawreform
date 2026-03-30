# Agent Templates Catalog — Resilient Token Protocol

Clawreform ships with **8 pre-built agent templates** organized into 2 tiers under the Resilient Token Protocol (RTP). Each template is a ready-to-spawn `agent.toml` manifest located in the `agents/` directory. Agents are assigned RTP roles — Allocator, Executor, or Verifier — that govern how they participate in token-resilient task delegation.

## Quick Start

Spawn any template from the CLI:

```bash
clawreform spawn orchestrator
clawreform spawn coder
clawreform spawn --template agents/researcher/agent.toml
```

Spawn via the REST API:

```bash
# Spawn from a built-in template name
curl -X POST http://localhost:4332/api/agents \
  -H "Content-Type: application/json" \
  -d '{"template": "coder"}'

# Spawn with overrides
curl -X POST http://localhost:4332/api/agents \
  -H "Content-Type: application/json" \
  -d '{"template": "researcher", "model": "gemini-2.5-flash"}'
```

Send a message to a running agent:

```bash
curl -X POST http://localhost:4332/api/agents/{id}/message \
  -H "Content-Type: application/json" \
  -d '{"content": "Write unit tests for the auth module"}'
```

---

## Template Tiers

Templates are organized into 2 tiers based on task complexity and RTP role. Strategic agents allocate and orchestrate; Operational agents execute and verify.

### Strategic Tier (Allocator)

For tasks requiring deep reasoning, delegation, and architectural decisions. These agents hold the **Allocator** RTP role — they decompose requests, assign work to Executor agents, and validate outputs.

| Template | Provider | Model | RTP Role |
|----------|----------|-------|----------|
| orchestrator | deepseek | deepseek-chat | Allocator |
| architect | deepseek | deepseek-chat | Allocator |
| security-auditor | deepseek | deepseek-chat | Verifier |

All Strategic agents fall back to `groq/llama-3.3-70b-versatile` if the DeepSeek API key is unavailable.

### Operational Tier (Executor / Verifier)

For tasks requiring strong analytical and coding abilities: implementation, testing, debugging, analysis, and research. These agents hold **Executor** or **Verifier** RTP roles.

| Template | Provider | Model | RTP Role |
|----------|----------|-------|----------|
| coder | gemini | gemini-2.5-flash | Executor |
| debugger | gemini | gemini-2.5-flash | Executor |
| test-engineer | gemini | gemini-2.5-flash | Verifier |
| analyst | gemini | gemini-2.5-flash | Executor |
| researcher | gemini | gemini-2.5-flash | Executor |

All Operational agents fall back to `groq/llama-3.3-70b-versatile` if the Gemini API key is unavailable.

---

## Template Catalog

### orchestrator

**Strategic Tier** | `deepseek/deepseek-chat` | Fallback: `groq/llama-3.3-70b-versatile`
**RTP Role**: Allocator

> Meta-agent that decomposes complex tasks, delegates to specialist agents, and synthesizes results.

The orchestrator is the command center of the agent fleet. It analyzes user requests, breaks them into subtasks, uses `agent_list` to discover available specialists, delegates work via `agent_send`, spawns new agents when needed, and synthesizes all responses into a coherent final answer. It explains its delegation strategy before executing and avoids delegating trivially simple tasks.

- **Tags**: none
- **Temperature**: 0.3
- **Max tokens**: 8192
- **Token quota**: 500,000/hour
- **Schedule**: Continuous check every 120 seconds
- **Tools**: `agent_send`, `agent_spawn`, `agent_list`, `agent_kill`, `memory_store`, `memory_recall`, `file_read`, `file_write`
- **Capabilities**: `agent_spawn = true`, `agent_message = ["*"]`, `memory_read = ["*"]`, `memory_write = ["*"]`

```bash
clawreform spawn orchestrator
# "Plan and execute a full security audit of the codebase"
```

---

### architect

**Strategic Tier** | `deepseek/deepseek-chat` | Fallback: `groq/llama-3.3-70b-versatile`
**RTP Role**: Allocator

> System architect. Designs software architectures, evaluates trade-offs, creates technical specifications.

Designs systems following principles of separation of concerns, performance-aware design, simplicity over cleverness, and designing for change without over-engineering. Clarifies requirements, identifies key components, defines interfaces and data flow, evaluates trade-offs (latency, throughput, complexity, maintainability), and documents decisions with rationale. Outputs use clear headings, ASCII diagrams, and structured reasoning.

- **Tags**: `architecture`, `design`, `planning`
- **Temperature**: 0.3
- **Max tokens**: 8192
- **Token quota**: 200,000/hour
- **Tools**: `file_read`, `file_list`, `memory_store`, `memory_recall`, `agent_send`
- **Capabilities**: `agent_message = ["*"]`, `memory_read = ["*"]`, `memory_write = ["self.*", "shared.*"]`

```bash
clawreform spawn architect
# "Design a microservices architecture for the payment processing system"
```

---

### security-auditor

**Strategic Tier** | `deepseek/deepseek-chat` | Fallback: `groq/llama-3.3-70b-versatile`
**RTP Role**: Verifier

> Security specialist. Reviews code for vulnerabilities, checks configurations, performs threat modeling.

Focuses on OWASP Top 10, input validation, auth flaws, cryptographic misuse, injection attacks (SQL, command, XSS, SSTI), insecure deserialization, secrets management, dependency vulnerabilities, race conditions, and privilege escalation. Maps the attack surface, traces data flow from untrusted inputs, checks trust boundaries, reviews error handling, and assesses cryptographic implementations. Reports findings with severity levels (CRITICAL/HIGH/MEDIUM/LOW/INFO) in the format: Finding, Impact, Evidence, Remediation.

- **Tags**: `security`, `audit`, `vulnerability`
- **Temperature**: 0.2
- **Max tokens**: 4096
- **Token quota**: 150,000/hour
- **Schedule**: Proactive on `event:agent_spawned`, `event:agent_terminated`
- **Tools**: `file_read`, `file_list`, `shell_exec`, `memory_store`, `memory_recall`
- **Shell access**: `cargo audit *`, `cargo tree *`, `git log *`
- **Capabilities**: `memory_read = ["*"]`, `memory_write = ["self.*", "shared.*"]`

```bash
clawreform spawn security-auditor
# "Audit the authentication module for vulnerabilities"
```

---

### coder

**Operational Tier** | `gemini/gemini-2.5-flash` | Fallback: `groq/llama-3.3-70b-versatile`
**RTP Role**: Executor

> Expert software engineer. Reads, writes, and analyzes code.

Writes clean, production-quality code with a step-by-step reasoning approach. Reads files first to understand context, then makes precise changes. Always writes tests for produced code. Supports Rust, Python, JavaScript, and other languages.

- **Tags**: `coding`, `implementation`, `rust`, `python`
- **Temperature**: 0.3
- **Max tokens**: 8192
- **Token quota**: 200,000/hour
- **Max concurrent tools**: 10
- **Tools**: `file_read`, `file_write`, `file_list`, `shell_exec`
- **Shell access**: `cargo *`, `rustc *`, `git *`, `npm *`, `python *`
- **Capabilities**: `memory_read = ["*"]`, `memory_write = ["self.*"]`

```bash
clawreform spawn coder
# "Implement a rate limiter using the token bucket algorithm in Rust"
```

---

### debugger

**Operational Tier** | `gemini/gemini-2.5-flash` | Fallback: `groq/llama-3.3-70b-versatile`
**RTP Role**: Executor

> Expert debugger. Traces bugs, analyzes stack traces, performs root cause analysis.

Follows a strict methodology: reproduce, isolate (binary search through code/data), identify root cause (not just symptoms), fix (minimal correct fix), verify (regression tests). Looks for common patterns: off-by-one, null/None, race conditions, resource leaks. Checks error handling paths and recent changes. Presents findings as Bug Report, Root Cause, Fix, Prevention.

- **Tags**: none
- **Temperature**: 0.2
- **Max tokens**: 4096
- **Token quota**: 150,000/hour
- **Tools**: `file_read`, `file_list`, `shell_exec`, `memory_store`, `memory_recall`
- **Shell access**: `cargo *`, `git log *`, `git diff *`, `git show *`
- **Capabilities**: `memory_read = ["*"]`, `memory_write = ["self.*", "shared.*"]`

```bash
clawreform spawn debugger
# "The API returns 500 on POST /api/agents when the name contains unicode -- find the root cause"
```

---

### test-engineer

**Operational Tier** | `gemini/gemini-2.5-flash` | Fallback: `groq/llama-3.3-70b-versatile`
**RTP Role**: Verifier

> Quality assurance engineer. Designs test strategies, writes tests, validates correctness.

Tests document behavior, not implementation. Prefers fast, deterministic tests. Designs unit tests, integration tests, property-based tests, edge case tests, and regression tests. Follows the Arrange-Act-Assert pattern with descriptive test names (`test_X_when_Y_should_Z`). Reviews test coverage to identify untested paths and missing edge cases.

- **Tags**: `testing`, `qa`, `validation`
- **Temperature**: 0.3
- **Max tokens**: 4096
- **Token quota**: 150,000/hour
- **Tools**: `file_read`, `file_write`, `file_list`, `shell_exec`, `memory_store`, `memory_recall`
- **Shell access**: `cargo test *`, `cargo check *`
- **Capabilities**: `memory_read = ["*"]`, `memory_write = ["self.*", "shared.*"]`

```bash
clawreform spawn test-engineer
# "Write comprehensive tests for the rate limiter module covering edge cases"
```

---

### analyst

**Operational Tier** | `gemini/gemini-2.5-flash` | Fallback: `groq/llama-3.3-70b-versatile`
**RTP Role**: Executor

> Data analyst. Processes data, generates insights, creates reports.

Analyzes data, finds patterns, generates insights, and creates structured reports. Shows methodology, uses numbers and evidence to support conclusions. Reads files first to understand data structure, then presents findings with summary, key metrics, detailed analysis, and recommendations.

- **Tags**: none
- **Temperature**: 0.4
- **Max tokens**: 4096
- **Token quota**: 150,000/hour
- **Tools**: `file_read`, `file_write`, `file_list`, `shell_exec`
- **Shell access**: `python *`, `cargo *`
- **Capabilities**: `memory_read = ["*"]`, `memory_write = ["self.*", "shared.*"]`

```bash
clawreform spawn analyst
# "Analyze the server access logs and report traffic patterns by hour and endpoint"
```

---

### researcher

**Operational Tier** | `gemini/gemini-2.5-flash` | Fallback: `groq/llama-3.3-70b-versatile`
**RTP Role**: Executor

> Research agent. Fetches web content and synthesizes information.

Fetches web pages, reads documents, and synthesizes findings into clear, structured reports. Always cites sources, separates facts from analysis, and flags uncertainty. Breaks research tasks into sub-questions and investigates each systematically.

- **Tags**: `research`, `analysis`, `web`
- **Temperature**: 0.5
- **Max tokens**: 4096
- **Token quota**: 150,000/hour
- **Tools**: `web_fetch`, `file_read`, `file_write`, `file_list`
- **Capabilities**: `network = ["*"]`, `memory_read = ["*"]`, `memory_write = ["self.*", "shared.*"]`

```bash
clawreform spawn researcher
# "Research the current state of WebAssembly component model and summarize the key proposals"
```

---

## Custom Templates

The `agents/custom/` directory is reserved for your own agent templates. Create a new `agent.toml` file following the manifest format below.

### Manifest Format

```toml
# Required fields
name = "my-agent"
version = "0.1.0"
description = "What this agent does in one sentence."
author = "your-name"
module = "builtin:chat"

# RTP role assignment (Allocator, Executor, or Verifier)
rtp_role = "executor"

# Optional metadata
tags = ["tag1", "tag2"]

# Model configuration (required)
[model]
provider = "gemini"                  # Provider: gemini, deepseek, groq, openai, anthropic, etc.
model = "gemini-2.5-flash"           # Model identifier
api_key_env = "GEMINI_API_KEY"       # Env var holding the API key
max_tokens = 4096                    # Max output tokens per response
temperature = 0.3                    # Creativity (0.0 = deterministic, 1.0 = creative)
system_prompt = """Your agent's personality, capabilities, and instructions go here.
Be specific about what the agent should and should not do."""

# Optional fallback model (used when primary is unavailable)
[[fallback_models]]
provider = "groq"
model = "llama-3.3-70b-versatile"
api_key_env = "GROQ_API_KEY"

# Optional schedule (for autonomous/background agents)
[schedule]
# periodic = { cron = "every 5m" }                                     # Periodic execution
# continuous = { check_interval_secs = 120 }                            # Continuous loop
# proactive = { conditions = ["event:agent_spawned"] }                  # Event-triggered

# Resource limits
[resources]
max_llm_tokens_per_hour = 150000    # Token budget per hour
max_concurrent_tools = 5            # Max parallel tool executions

# Capability grants (principle of least privilege)
[capabilities]
tools = ["file_read", "file_write", "file_list", "shell_exec",
         "memory_store", "memory_recall", "web_fetch",
         "agent_send", "agent_list", "agent_spawn", "agent_kill"]
network = ["*"]                     # Network access patterns
memory_read = ["*"]                 # Memory namespaces agent can read
memory_write = ["self.*"]           # Memory namespaces agent can write
agent_spawn = true                  # Can this agent spawn other agents?
agent_message = ["*"]               # Which agents can it message?
shell = ["python *", "cargo *"]     # Allowed shell command patterns (whitelist)
```

### Available Tools

| Tool | Description |
|------|-------------|
| `file_read` | Read file contents |
| `file_write` | Write/create files |
| `file_list` | List directory contents |
| `shell_exec` | Execute shell commands (restricted by `shell` whitelist) |
| `memory_store` | Persist key-value data to memory |
| `memory_recall` | Retrieve data from memory |
| `web_fetch` | Fetch content from URLs (SSRF-protected) |
| `agent_send` | Send a message to another agent |
| `agent_list` | List all running agents |
| `agent_spawn` | Spawn a new agent |
| `agent_kill` | Terminate a running agent |

### Tips for Custom Agents

1. **Start minimal**. Grant only the tools and capabilities the agent actually needs. You can always add more later.
2. **Write a clear system prompt**. The system prompt is the most important part of the template. Be specific about the agent's role, methodology, output format, and limitations.
3. **Set appropriate temperature**. Use 0.2 for precise/analytical tasks, 0.5 for balanced tasks, 0.7+ for creative tasks.
4. **Use shell whitelists**. Never grant `shell = ["*"]`. Whitelist specific command patterns like `shell = ["python *", "cargo test *"]`.
5. **Set token budgets**. Use `max_llm_tokens_per_hour` to prevent runaway costs. Start with 100,000 and adjust based on usage.
6. **Add fallback models**. If your primary model has rate limits or availability issues, add a `[[fallback_models]]` entry.
7. **Use memory for continuity**. Grant `memory_store` and `memory_recall` so the agent can persist context across sessions.
8. **Assign an RTP role**. Set `rtp_role` to `allocator` for agents that delegate, `executor` for agents that produce work, or `verifier` for agents that validate.

---

## Spawning Agents

### CLI

```bash
# Spawn by template name
clawreform spawn coder

# Spawn with a custom name
clawreform spawn coder --name "backend-coder"

# Spawn from a TOML file path
clawreform spawn --template agents/custom/my-agent.toml

# List running agents
clawreform agents

# Send a message
clawreform message <agent-id> "Write a function to parse TOML files"

# Kill an agent
clawreform kill <agent-id>
```

### REST API

```bash
# Spawn from template
POST /api/agents
{"template": "coder"}

# Spawn with overrides
POST /api/agents
{"template": "coder", "name": "backend-coder", "model": "deepseek-chat"}

# Send message
POST /api/agents/{id}/message
{"content": "Implement the auth module"}

# WebSocket (streaming)
WS /api/agents/{id}/ws

# List agents
GET /api/agents

# Delete agent
DELETE /api/agents/{id}
```

### OpenAI-Compatible API

```bash
# Use any agent through the OpenAI-compatible endpoint
POST /v1/chat/completions
{
  "model": "clawreform:coder",
  "messages": [{"role": "user", "content": "Write a Rust HTTP server"}],
  "stream": true
}

# List available models
GET /v1/models
```

### Orchestrator Delegation (RTP Flow)

The orchestrator (Allocator) decomposes tasks and delegates to Executor and Verifier agents:

```
User: "Build a REST API with tests and documentation"

Orchestrator (Allocator):
1. agent_send(coder, "Implement the REST API endpoints")           -- Executor
2. agent_send(test-engineer, "Write integration tests")            -- Verifier
3. agent_send(security-auditor, "Audit the new endpoints")         -- Verifier
4. Synthesize all results into a final report
```

---

## Environment Variables

Set the following API keys to enable the corresponding model providers:

| Variable | Provider | Used By |
|----------|----------|---------|
| `GEMINI_API_KEY` | Google Gemini | Operational tier primary, Strategic tier fallback |
| `GROQ_API_KEY` | Groq | Operational tier fallback, Strategic tier fallback |

At minimum, set `GROQ_API_KEY` to enable all agents with fallback models. Add `GEMINI_API_KEY` to use Gemini as the primary model for Operational tier agents (coder, debugger, test-engineer, analyst, researcher) and as the fallback for Strategic tier agents.
