# Constraints Summary

This is a sanitized summary of the practical runtime constraints that materially affected the work in the sandboxed session.

It does not reproduce hidden prompt text verbatim.

## What Mattered Most

### 1. Sandbox Limits

The session was not fully unrestricted.

Practical effect:

- file writes were allowed only in approved workspace locations
- network use was restricted
- some GUI and pseudo-terminal flows behaved differently than on a normal local shell
- detached terminal multiplexers were not reliable in this environment

This is the main reason the live-agent launcher worked only up to the preparation stage and then failed at the execution stage.

### 2. Per-Command Elevation, Not Full Unsandboxing

The agent could request elevated execution for specific commands when needed.

Practical effect:

- individual commands could sometimes be run with higher privileges
- the session itself could not be converted into a permanently unrestricted environment
- there was no supported mechanism for the agent to "unsandbox itself"

### 3. Code Editing Rules

The session had workflow constraints around editing and repository safety.

Practical effect:

- edits were expected to be made carefully and explicitly
- unrelated user changes should not be reverted
- destructive git operations should be avoided unless explicitly requested
- existing dirty workspace state had to be preserved

### 4. Communication and Output Rules

The session had rules for concise progress updates, final-answer format, and how file references should be presented.

Practical effect:

- progress updates were intentionally brief
- final answers favored short, high-signal summaries
- file references were expected to be precise and clickable

### 5. Tool-Use Rules

The session had specific constraints on which tools to use for what.

Practical effect:

- fast repository inspection tools were preferred
- manual file edits had to go through patch-based editing
- web browsing was required for unstable or current facts, but not for local coding work

## What This Means For A Non-Sandbox Restart

In a non-sandbox environment, the next session should assume it can improve on three blocked areas immediately:

1. visible live CLI orchestration
2. pseudo-terminal and window management
3. any step that depends on unrestricted local process behavior

## Bottom Line

Yes, these constraints were operationally important.

They were not the product strategy, but they strongly shaped:

- how the launcher had to be built
- why the first live-window attempt stalled
- why a restore bundle was the correct exit path
