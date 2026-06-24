# Pilingo

## Run the app with the local server

Use the bundled Node runtime:

```bash
cd "/Users/leotuvey/Documents/New project"
/Users/leotuvey/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node server.js
```

Then open:

```text
http://localhost:3000
```

## Notification channels

The app now supports:

- Browser notifications in the saved app
- Telegram notifications
- Email notifications

## Telegram setup

Set these before starting the server:

```bash
export TELEGRAM_BOT_TOKEN="your_bot_token"
export TELEGRAM_CHAT_ID="your_chat_id"
```

## Email setup

This uses Resend. Set these before starting the server:

```bash
export RESEND_API_KEY="your_resend_api_key"
export EMAIL_TO="your@email.com"
export EMAIL_FROM="Pilingo <onboarding@resend.dev>"
```

## Notes

- Browser notifications work when the app is opened through the local server.
- Phone browser notifications need notification permission enabled in the saved app.
- Telegram and email notifications are sent by the backend whenever student activity is tracked.
