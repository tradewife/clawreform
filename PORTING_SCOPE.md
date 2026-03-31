# PORTING_SCOPE.md — senpi-waifu → Clawreform Rust Port

> Generated: 2026-03-31
> Source: https://github.com/tradewife/senpi-waifu (Python)
> Target: https://github.com/tradewife/clawreform (Rust)

---

## 1. Python Module → Rust Crate/Module Mapping

### Layer 1: Entrypoints

| Python Module | Purpose | Rust Crate | Complexity |
|---|---|---|---|
| `worker.py` | APScheduler cron entrypoint (21 jobs, ThreadPoolExecutor(8), Telegram bot thread) | `senpi-worker` binary — `tokio-cron-scheduler` + `tokio` runtime | **HIGH** |
| `dashboard/server.py` | FastAPI WebSocket + REST dashboard, Jinja2 templates, Oz/Warp agent dispatch | `senpi-dashboard` — `axum` + `axum::ws` + `askama` | **MEDIUM** |
| `dashboard/telegram_bot.py` | Full Telegram bot: 12+ commands, inline keyboards, callback queries, Hermes LLM dispatch | `senpi-telegram` — `teloxide` | **HIGH** |

### Layer 2: Shared Library

| Python Module | Purpose | Rust Crate | Complexity |
|---|---|---|---|
| `scripts/lib/senpi_common.py` | **Central runtime**: JSON I/O, regime/brain/strategy loading, DSL helpers, directional exposure calc, pending entry queue, trade journal, guardrails, MCP JSON-RPC client, git sync/pull, file locks, heartbeat, Telegram alerts | `senpi-common` — `serde_json`, `reqwest`, `tokio`, `chrono`, `fd-lock` | **HIGH** |

### Layer 3: VPS Cron Jobs (Mechanical Layer)

| Python Module | Purpose | Rust Crate/Bin | Complexity |
|---|---|---|---|
| `scripts/vps/dsl-runner.py` | High-water trailing stop manager (Phase 1/2, stagnation TP, SL sync) | `senpi-dsl` | **HIGH** |
| `scripts/vps/risk-arbiter.py` | Mechanical safety net (30s loop: daily loss, catastrophic DD, consecutive stop-outs) | `senpi-arbiter` | **MEDIUM** |
| `scripts/vps/autonomous-brain.py` | Strategic policy snapshot builder (scanner profiles, execution policy, playbook) | `senpi-brain` | **MEDIUM** |
| `scripts/vps/arena-monitor.py` | Predators leaderboard poller (Supabase Edge Function JSON-RPC) | `senpi-arena` | **LOW** |
| `scripts/vps/health-check-cron.py` | System health: git pull, MCP connectivity, config validation, stale heartbeats | `senpi-health` | **LOW** |
| `scripts/vps/watchdog-cron.py` | Margin/liquidation monitor (liq distance, ROE alerts, ghost cleanup) | `senpi-watchdog` | **MEDIUM** |
| `scripts/vps/sm-flip-cron.py` | Position supervisor (SM flip, conviction collapse, dead-weight rotation) | `senpi-supervisor` | **MEDIUM** |
| `scripts/vps/reconcile-closes.py` | Journal reconciliation (backfill missing CLOSE records) | `senpi-health::reconcile` | **LOW** |
| `scripts/vps/elite_trader.py` | Full research-to-execution loop (GraphSignalScore, ALO orders, SQLite) | `senpi-elite` | **HIGH** |
| `scripts/vps/orca-scanner-cron.py` | ORCA v1.3 dual-mode scanner (STALKER + STRIKER) | `senpi-scanners::bin::orca` | **MEDIUM** |
| `scripts/vps/komodo-scanner-cron.py` | KOMODO momentum event consensus scanner | `senpi-scanners::bin::komodo` | **MEDIUM** |
| `scripts/vps/condor-scanner-cron.py` | CONDOR multi-asset alpha hunter (BTC, ETH, SOL, HYPE) | `senpi-scanners::bin::condor` | **MEDIUM** |
| `scripts/vps/polar-scanner-cron.py` | POLAR ETH-only alpha hunter (3-mode lifecycle) | `senpi-scanners::bin::polar` | **MEDIUM** |
| `scripts/vps/mantis-scanner-cron.py` | MANTIS dual-mode scanner (depowered) | `senpi-scanners::bin::mantis` | **LOW** |
| `scripts/vps/fox-scanner-cron.py` | FOX dual-mode scanner (depowered, streak gate) | `senpi-scanners::bin::fox` | **LOW** |
| `scripts/vps/roach-scanner-cron.py` | ROACH striker-only scanner (depowered) | `senpi-scanners::bin::roach` | **LOW** |
| `scripts/vps/sentinel-scanner-cron.py` | SENTINEL quality trader convergence scanner | `senpi-scanners::bin::sentinel` | **MEDIUM** |
| `scripts/vps/rhino-scanner-cron.py` | RHINO momentum pyramider | `senpi-scanners::bin::rhino` | **MEDIUM** |
| `scripts/vps/barracuda-scanner-cron.py` | BARRACUDA (paused) | Feature-gated | **LOW** |
| `scripts/vps/bison-scanner-cron.py` | BISON (paused) | Feature-gated | **LOW** |
| `scripts/vps/shark-scanner-cron.py` | SHARK OI (paused, -4.3% ROI) | Feature-gated | **LOW** |
| `scripts/vps/emerging-movers-cron.py` | LEGACY (replaced by ORCA) | **Do not port** | — |

### Layer 4: CLI Package

| Python Module | Purpose | Rust Crate/Module | Complexity |
|---|---|---|---|
| `waifu_cli/main.py` | Click CLI group (11 subcommands) | `senpi-cli` — `clap` derive | **LOW** |
| `waifu_cli/runtime.py` | CLI helpers: git sync, command lock | `senpi-cli::runtime` | **LOW** |
| `waifu_cli/safety.py` | **10-gate entry safety pipeline** (GateResult accumulator) | `senpi-cli::safety` | **MEDIUM** |
| `waifu_cli/commands/evaluate.py` | Trade evaluator (10-gate → APPROVE/REJECT → MCP execute → DSL state) | `senpi-cli::commands::evaluate` | **HIGH** |
| `waifu_cli/commands/jido.py` | Autonomous executor (tiered governance, ROI-based auto-execute) | `senpi-cli::commands::jido` | **MEDIUM** |
| `waifu_cli/commands/regime.py` | Regime classifier (BTC 4h MA slope + ATR) | `senpi-cli::commands::regime` | **LOW** |
| `waifu_cli/commands/review.py` | Portfolio review (equity, drawdown, dead-weight, guardrail alerts) | `senpi-cli::commands::review` | **MEDIUM** |
| `waifu_cli/commands/howl.py` | Nightly 10-pillar analysis + auto-apply risk-reducing changes | `senpi-cli::commands::howl` | **HIGH** |
| `waifu_cli/commands/whale.py` | Copy-trade portfolio management (top-trader scoring, slot mgmt) | `senpi-cli::commands::whale` | **MEDIUM** |
| `waifu_cli/commands/arena.py` | Arena leaderboard strategy learner | `senpi-cli::commands::arena` | **LOW** |
| `waifu_cli/commands/status.py` | Read-only status snapshot | `senpi-cli::commands::status` | **LOW** |
| `waifu_cli/commands/emergency_stop.py` | Immediate RISK_OFF + Telegram alert + git push | `senpi-cli::commands::emergency_stop` | **LOW** |
| `waifu_cli/commands/debug.py` | Railway CLI wrappers (logs, deploy, tail) | `senpi-cli::commands::debug` | **LOW** |
| `waifu_cli/commands/dev.py` | Skill catalog, scaffold, YAML frontmatter parsing | `senpi-cli::commands::dev` | **LOW** |
| `waifu_cli/commands/config.py` | .env I/O, validation, export, user-rules management | `senpi-cli::commands::config` | **LOW** |

---

## 2. External Dependency → Rust Equivalent Mapping

### External Services

| Service | Python Mechanism | Endpoint | Rust Crate | Notes |
|---|---|---|---|---|
| **Senpi MCP** | `urllib.request` JSON-RPC 2.0 POST | `https://mcp.prod.senpi.ai/mcp` | `reqwest` (raw HTTP) | Custom JSON-RPC 2.0 client — build a thin `SenpiMcpClient` struct over reqwest |
| **Arena / Supabase** | `urllib.request` JSON-RPC 2.0 POST | `https://ypofdvbavcdgseguddey.supabase.co/functions/v1/mcp-server` | `reqwest` (raw HTTP) | Same JSON-RPC protocol, unauthenticated |
| **Telegram Bot API** (alerts) | `urllib.request` POST | `https://api.telegram.org/bot{TOKEN}/sendMessage` | `reqwest` (raw HTTP) | Simple one-shot POST for alerts |
| **Telegram Bot API** (full bot) | `python-telegram-bot` library | polling API | **`teloxide`** | Full equivalent: handlers, inline keyboards, callback queries, command dispatch |
| **GitHub** (state persistence) | `subprocess.run(["git", ...])` | HTTPS git push/pull | **`git2`** (libgit2 bindings) or `tokio::process::Command` shelling out to `git` | `git2` for native; shell-out is simpler and matches Python behavior exactly |
| **Warp / Oz Agent** | `urllib.request` POST | `https://app.warp.dev/api/v1/agent/run` | `reqwest` (raw HTTP) | Single POST endpoint |
| **Hermes LLM** | `subprocess` spawning `hermes` binary | Local binary | `tokio::process::Command` | Shell-out to `hermes` binary, same as Python |

### Senpi MCP Tools Called (Complete Inventory)

| MCP Tool | Type | Callers |
|---|---|---|
| `leaderboard_get_markets` | read | komodo, polar, sentinel, rhino, condor, sm-flip, elite, evaluate/jido (via safety) |
| `leaderboard_get_momentum_events` | read | komodo, sentinel |
| `leaderboard_get_top` | read | sentinel |
| `market_get_asset_data` | read | dsl-runner, sm-flip, elite, polar, rhino, condor, komodo, regime, evaluate/jido |
| `market_get_candles` | read | elite (1h, 4h) |
| `market_get_orderbook` | read | elite |
| `market_get_instrument_specs` | read | elite |
| `market_get_prices` | read | elite |
| `market_list_instruments` | read | rhino |
| `account_get_portfolio` | read | watchdog, health, arbiter, elite, review |
| `discovery_get_top_traders` | read | whale, arena |
| `strategy_open_position` | **write** | evaluate, jido |
| `strategy_close_position` | **write** | dsl-runner, watchdog, arbiter, sm-flip, elite |
| `edit_position` | **write** | dsl-runner (SL sync) |

### Python Library → Rust Crate Mapping

| Python Library | Usage | Rust Crate | Status |
|---|---|---|---|
| `apscheduler` | Cron scheduler | `tokio-cron-scheduler` | ✅ Direct equivalent |
| `python-telegram-bot` | Telegram bot framework | `teloxide` | ✅ Direct equivalent |
| `click` | CLI framework | `clap` (derive) | ✅ Direct equivalent |
| `fastapi` + `uvicorn` | Web server | `axum` + `tokio` | ✅ Direct equivalent |
| `jinja2` | HTML templates | `askama` or `minijinja` | ✅ Direct equivalent |
| `urllib.request` | HTTP client | `reqwest` | ✅ Direct equivalent |
| `json` (stdlib) | JSON serialization | `serde` + `serde_json` | ✅ Direct equivalent |
| `datetime` (stdlib) | Date/time | `chrono` | ✅ Direct equivalent |
| `fcntl.flock` | File locking | `fd-lock` or `fs2` | ✅ Direct equivalent |
| `subprocess` | Process spawning | `tokio::process::Command` | ✅ Direct equivalent |
| `sqlite3` (stdlib) | SQLite (elite_trader) | `rusqlite` | ✅ Direct equivalent |
| `pathlib` / `os.path` | File paths | `std::path` | ✅ Stdlib |
| `threading` | Thread pool | `tokio` tasks | ✅ Direct equivalent |
| `hashlib` | Hashing | `sha2` / `md-5` | ✅ Direct equivalent |
| `yaml` (PyYAML) | YAML frontmatter (dev.py) | `serde_yaml` | ✅ Direct equivalent |
| `math` / `statistics` | Numeric computation | `std` + `statrs` (if needed) | ✅ Direct equivalent |
| `re` (stdlib) | Regex | `regex` | ✅ Direct equivalent |
| `copy.deepcopy` | Deep clone | `Clone` trait | ✅ Language-level |

**⚠ No missing crate gaps identified.** Every Python dependency has a mature Rust equivalent.

---

## 3. 10-Gate Safety Pipeline — Typed State Machine

```
evaluate_entry(entry, strategy) → GateResult
```

| Gate | Check | Hard? | Inputs |
|---|---|---|---|
| 1 | Entries allowed by regime | Soft | `risk-regime.json`, brain policy |
| 2 | Auto-entry enabled | Soft | regime params, brain policy |
| 3 | Valid strategy ID | Soft | `wolf-strategies.json` |
| 4 | Slots available (dynamic) | Soft | strategy config, trade journal, brain caps |
| 5 | Scanner not blocked by brain | Soft | `entry.brainContext.blockedScanner` |
| 6 | Score ≥ threshold | Soft | `DEFAULT_MIN_SCORES` ∪ `user-rules.json` |
| 7 | Asset not banned | **HARD** | `guardrails.bannedAssetPrefixes` |
| 8 | 120-min cooldown clear | **HARD** | trade journal reverse scan |
| 9 | Directional exposure cap | Soft | all open positions, `guardrails.directionalCapPct` (70%) |
| 10 | Leverage clamp 7–10x | **HARD** (never rejects) | `guardrails.minLeverage/maxLeverage` |

**Key properties:** No early exit (all gates always run). `approved` latches `false`. Gate 10 is output-only (writes `clamped_leverage`). First-position exemption on Gate 9. Config is 3-layer merged (defaults → regime → user-rules), with brain policy as 4th overlay.

**Rust type sketch:**
```rust
pub struct GateResult {
    pub approved: bool,          // latching false
    pub reasons: Vec<String>,    // rejection messages
    pub clamped_leverage: u8,    // always set by gate 10
    pub effective_margin: f64,   // set by gate 9
}
```

---

## 4. Cron Job Schedule Summary

| Job | Interval | Offset | Active MCP Calls? |
|---|---|---|---|
| `arbiter` | 30s | — | Yes (portfolio, close) |
| `orca` | 3 min | — | No (depowered) |
| `mantis` | 90s | — | No (depowered) |
| `fox` | 90s | — | No (depowered) |
| `roach` | 90s | — | No (depowered) |
| `dsl` | 3 min | — | Yes (price, edit, close) |
| `condor` | 3 min | +60s | Yes (candles, funding, SM) |
| `polar` | 3 min | +45s | Yes (candles, SM) |
| `sentinel` | 3 min | +90s | Yes (SM, momentum, top) |
| `rhino` | 3 min | +150s | Yes (instruments, SM, candles) |
| `smflip` | 5 min | — | Yes (SM snapshot, close) |
| `komodo` | 5 min | +60s | Yes (momentum, SM, candles) |
| `jido` | 5 min | +90s | Yes (open, evaluate) |
| `brain` | 5 min | +210s | No (local state only) |
| `watchdog` | 5 min | +120s | Yes (portfolio, close) |
| `elite_stale` | 5 min | +180s | Yes (price, close) |
| `health` | 10 min | — | Yes (portfolio connectivity test) |
| `regime` | 15 min | +300s | Yes (BTC candles) |
| `arena` | 15 min | — | Yes (Supabase, not Senpi MCP) |
| `reconcile` | 15 min | +30s | No (local file scan) |
| `elite_trader` | 30 min | +420s | Yes (full market data suite) |
| `heartbeat` | 5 min | — | No (stdout only) |

---

## 5. Proposed Rust Workspace Structure

```
crates/
├── senpi-common/          # Central runtime library
│   └── src/
│       ├── lib.rs
│       ├── config.rs      # KernelConfig fields, regime, guardrails
│       ├── state.rs       # JSON state file I/O (atomic read/write)
│       ├── journal.rs     # Trade journal read/write/query
│       ├── regime.rs      # Regime loading, params, brain overlay
│       ├── brain.rs       # Brain policy, scanner profiles
│       ├── strategy.rs    # Wolf strategy registry
│       ├── positions.rs   # DSL position state, slot counting
│       ├── exposure.rs    # Directional exposure calculation
│       ├── guardrails.rs  # 3-layer guardrail merge
│       ├── mcp_client.rs  # Senpi MCP JSON-RPC 2.0 client
│       ├── locks.rs       # File-based cron + trade locks
│       ├── git.rs         # git pull/sync operations
│       ├── heartbeat.rs   # Cron heartbeat recording
│       └── telegram.rs    # send_telegram() one-shot alerts
├── senpi-cli/             # CLI binary (clap)
│   └── src/
│       ├── main.rs
│       ├── cli.rs         # Subcommand dispatch
│       ├── runtime.rs     # sync_before/after, locks
│       ├── safety.rs      # 10-gate pipeline
│       └── commands/
│           ├── evaluate.rs
│           ├── jido.rs
│           ├── regime.rs
│           ├── review.rs
│           ├── howl.rs
│           ├── whale.rs
│           ├── arena.rs
│           ├── status.rs
│           ├── emergency_stop.rs
│           ├── debug.rs
│           ├── dev.rs
│           └── config.rs
├── senpi-dsl/             # DSL trailing-stop manager
├── senpi-arbiter/         # Risk arbiter (30s safety net)
├── senpi-brain/           # Autonomous brain + arena monitor
├── senpi-health/          # Health check + reconcile
├── senpi-watchdog/        # Margin/liq monitor
├── senpi-supervisor/      # SM flip position supervisor
├── senpi-elite/           # Elite trader (SQLite, GraphSignalScore)
├── senpi-scanners/        # All scanner binaries
│   └── src/bin/
│       ├── orca.rs
│       ├── komodo.rs
│       ├── condor.rs
│       ├── polar.rs
│       ├── mantis.rs
│       ├── fox.rs
│       ├── roach.rs
│       ├── sentinel.rs
│       └── rhino.rs
├── senpi-worker/          # Scheduler binary (tokio-cron-scheduler)
├── senpi-telegram/        # Full Telegram bot (teloxide)
└── senpi-dashboard/       # Web dashboard (axum)
```

---

## 6. Total Scope Assessment

| Metric | Count |
|---|---|
| Python modules to port | **38** (excluding 1 legacy, 3 paused-but-feature-gated) |
| New Rust crates | **13** |
| External services | **6** (Senpi MCP, Supabase Arena, Telegram, GitHub/git, Warp/Oz, Hermes LLM) |
| Senpi MCP tools used | **14** (11 read, 3 write) |
| Cron jobs | **22** (including heartbeat) |
| Safety gates | **10** (3 hard, 7 soft) |
| HIGH complexity modules | **7** (`senpi-common`, `worker`, `telegram_bot`, `dsl-runner`, `elite_trader`, `evaluate`, `howl`) |
| MEDIUM complexity modules | **13** |
| LOW complexity modules | **18** |

**Estimated effort:** ~4–6 weeks for a single developer, ~2–3 weeks with parallel Codex agents on independent crates.

---

## 7. Recommended Build Order

Build from the bottom up — each phase unlocks the next.

### Phase 1: Foundation (build first — everything depends on this)
1. **`senpi-common`** — JSON I/O, config types, regime/guardrails loading, MCP client, journal, git sync, locks, Telegram alerts. This is the `senpi_common.py` equivalent that every other crate imports.

### Phase 2: Safety & Core Logic
2. **`senpi-cli::safety`** — 10-gate pipeline (`GateResult`, `evaluate_entry`). Pure logic, no I/O beyond what `senpi-common` provides.
3. **`senpi-arbiter`** — Risk arbiter. Critical safety path (30s loop). Must be correct before any execution.
4. **`senpi-dsl`** — DSL trailing stop manager. Core position management.

### Phase 3: Execution Path
5. **`senpi-cli::commands::evaluate`** — Trade evaluator (depends on safety + common).
6. **`senpi-cli::commands::jido`** — Autonomous executor (thin wrapper over evaluate).
7. **`senpi-supervisor`** — SM flip / position rotation (depends on common).
8. **`senpi-watchdog`** — Margin monitor (depends on common).

### Phase 4: Scanners (parallelizable — all independent)
9. **`senpi-scanners`** — All 9 active scanner binaries. Each is independent. Can be built in parallel by separate Codex agents.
   - Start with `orca` (template for dual-mode scanners) → `mantis`, `fox`, `roach` (clones with config tweaks)
   - Then `komodo`, `condor`, `polar`, `sentinel`, `rhino` (each has unique logic)

### Phase 5: Intelligence Layer
10. **`senpi-brain`** — Autonomous brain + arena monitor.
11. **`senpi-elite`** — Elite trader (most complex scanner, SQLite).
12. **`senpi-health`** — Health check + reconcile.

### Phase 6: CLI Remaining Commands (parallelizable)
13. **`senpi-cli::commands::regime`** — Regime classifier.
14. **`senpi-cli::commands::review`** — Portfolio review.
15. **`senpi-cli::commands::howl`** — Nightly analysis (complex but isolated).
16. **`senpi-cli::commands::{whale,arena,status,emergency_stop,config,debug,dev}`** — Lower-priority commands.

### Phase 7: Interface Layer
17. **`senpi-telegram`** — Full Telegram bot (teloxide). Depends on all CLI commands existing.
18. **`senpi-dashboard`** — Web dashboard (axum). Lowest priority — Telegram is the primary interface.
19. **`senpi-worker`** — Scheduler binary. Wire everything together. Build last because it's just job registration.

### Paused Scanners (port only if reactivated)
- `barracuda`, `bison`, `shark` — feature-gated stubs only.

### Do Not Port
- `emerging-movers-cron.py` — replaced by ORCA.
