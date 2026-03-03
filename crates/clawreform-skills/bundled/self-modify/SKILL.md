---
name: self-modify
description: Enable ClawReform to safely modify its own codebase
version: 0.1.0
author: ClawReform
tags: [self-modification, code-generation, safety]
---

# Self-Modification Skill

Enable ClawReform to safely modify its own codebase through natural language requests.

## Capabilities

- Analyze natural language feature requests
- Create modification plans with risk assessment
- Apply code changes with automatic backups
- Validate changes via build/test/clippy
- Auto-rollback on validation failure

## Usage

```
User: Add a /api/health/live endpoint for liveness probes
```

ClawReform will:
1. Analyze the request and identify affected files
2. Create a modification plan with risk level
3. Backup affected files
4. Apply the changes
5. Run cargo build + test + clippy
6. Rollback if validation fails

## Safety Features

- **Automatic Backups**: All files backed up before modification
- **Full Validation**: Build, test, and clippy must pass
- **Auto-Rollback**: Failed validation triggers automatic restore
- **Rate Limiting**: Max 5 files per modification
- **Approval System**: High-risk changes require confirmation

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/self-modify/analyze` | POST | Analyze request → create plan |
| `/api/self-modify/apply` | POST | Apply plan with validation |
| `/api/self-modify/rollback` | POST | Restore from backup |
| `/api/self-modify/status` | GET | Get current status |
| `/api/self-modify/history` | GET | Get modification history |

## Examples

### Add a New API Endpoint
```
"Add a /api/metrics endpoint that returns system metrics"
```

### Create a New Skill
```
"Create a skill for summarizing PDF documents using the memory MCP server"
```

### Fix a Bug
```
"Fix the memory leak in MCP connection handling"
```

## Architecture

The self-modification system consists of:

- **Analyzer**: Parses natural language → identifies files, changes needed
- **Backup Manager**: Creates/restores file snapshots
- **Modifier**: Applies code changes safely
- **Validator**: Runs cargo build, test, clippy
- **Rollback Handler**: Restores from backup on failure

## Constraints

- Maximum 5 files per modification
- Changes must pass all tests
- No modifications to .git directory
- No modifications to secrets/credentials
