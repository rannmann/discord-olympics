# Discord Olympics Bot 🏅

A Discord bot for tracking the Winter Olympics 2026 (Milano Cortina) — medal counts, recent winners, and sports schedules.

## Commands

- `/medalcount` — Current medal standings by country (top 15 with flags)
- `/medals` — Recent medal winners with athlete names, events, and disciplines
- `/sports` — All 16 winter sports with total medal events

## Data Sources

- **Primary:** NBC Olympics API (real-time, includes athlete names and event details)
- **Fallback:** Wikipedia (medal counts only, used if NBC token is unavailable)

## Setup

1. Clone the repo
2. `npm install`
3. Copy `.env.example` to `.env` and fill in your values
4. `node src/index.js`

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_TOKEN` | Yes | Bot token from Discord Developer Portal |
| `DISCORD_CLIENT_ID` | Yes | Application ID from Discord Developer Portal |
| `DISCORD_GUILD_ID` | No | Server ID for instant command registration (omit for global, ~1hr delay) |
| `NBC_APP_TOKEN` | No | NBC Olympics API token (falls back to Wikipedia without it) |

### Bot Invite

Replace `YOUR_CLIENT_ID` with your application ID:

```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot%20applications.commands&permissions=2048
```

## Running as a Service

```bash
# Create systemd user service
mkdir -p ~/.config/systemd/user
cp olympics-bot.service ~/.config/systemd/user/  # or create one manually
systemctl --user daemon-reload
systemctl --user enable --now olympics-bot
```

## Tech Stack

- Node.js + discord.js v14
- axios for API calls
- Wikipedia MediaWiki API (fallback)
- NBC Olympics OVP API (primary)

## History

Originally built for the 2024 Paris Summer Olympics using NBC's Gracenote API. Rewritten for the 2026 Milano Cortina Winter Olympics with new data sources.
