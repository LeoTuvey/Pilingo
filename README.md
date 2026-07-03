# Pilingo

## Important

- `http://localhost:3000` is the full app with accounts, login, reset codes, notifications, and student tracking.
- `GitHub Pages` is only static hosting. It cannot run `server.js`, so it cannot fully support the new account system by itself.
- If you want the public app to work like the new local version for everyone, deploy the whole app to a real Node host such as Render or Railway.

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

Or create a local `.env` file in the project folder with:

```bash
RESEND_API_KEY="your_resend_api_key"
EMAIL_TO="your@email.com"
EMAIL_FROM="Pilingo <onboarding@resend.dev>"
```

Then restart the server. Password-reset emails will start using those saved values automatically.

## Notes

- Browser notifications work when the app is opened through the local server.
- Phone browser notifications need notification permission enabled in the saved app.
- Telegram and email notifications are sent by the backend whenever student activity is tracked.

## Deploy online for everyone

The app is now ready for a simple Node deployment.

### Option 1: Render

1. Push this project to GitHub.
2. Go to [Render](https://render.com/).
3. Create a new `Web Service` from the GitHub repo.
4. Render can use the included [render.yaml](/Users/leotuvey/Documents/New%20project/render.yaml:1).
5. Add these environment variables in Render:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `RESEND_API_KEY`
   - `EMAIL_TO`
   - `EMAIL_FROM`
6. Deploy.

### Option 2: Railway

1. Push this project to GitHub.
2. Go to [Railway](https://railway.app/).
3. Create a new project from the GitHub repo.
4. Railway will detect [package.json](/Users/leotuvey/Documents/New%20project/package.json:1) and start with `node server.js`.
5. Add the same environment variables from [.env.example](/Users/leotuvey/Documents/New%20project/.env.example:1).
6. Deploy.

## GitHub Pages limitation

If you only use:

```text
https://leotuvey.github.io/Pilingo/
```

that page can show design updates after a push, but it cannot run:

- real sign up
- real login
- forgot-password reset codes
- backend notifications
- shared student data for everyone

For those features, the app must run on a real backend host.
