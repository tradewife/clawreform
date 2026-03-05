# Migration Report: OpenClaw -> ClawReform

## Summary

- Imported: 3 items
- Skipped: 0 items
- Warnings: 0

## Imported

| Type | Name | Destination |
|------|------|-------------|
| Secret | TELEGRAM_BOT_TOKEN | secrets.env |
| Channel | telegram | config.toml [channels.telegram] |
| Config | openclaw.json | config.toml |

## Next Steps

1. Review imported agent manifests in `~/.clawreform/agents/`
2. Review `~/.clawreform/secrets.env` — verify tokens were migrated correctly
3. Set any remaining API keys referenced in `~/.clawreform/config.toml`
4. Start the daemon: `clawreform start`
5. Test your agents: `clawreform agent list`
