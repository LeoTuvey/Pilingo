const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const EVENTS_FILE = path.join(DATA_DIR, "student-events.json");
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const EMAIL_TO = process.env.EMAIL_TO || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webmanifest": "application/manifest+json"
};

ensureDataFile();

const server = http.createServer(async (req, res) => {
  const parsed = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && parsed.pathname === "/api/notifications") {
    return sendJson(res, 200, {
      ok: true,
      events: readEvents().slice(-50).reverse()
    });
  }

  if (req.method === "POST" && parsed.pathname === "/api/track") {
    try {
      const body = await readBody(req);
      const payload = JSON.parse(body || "{}");
      const event = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        type: String(payload.type || "activity"),
        page: String(payload.page || ""),
        label: String(payload.label || ""),
        studentName: String(payload.studentName || "Unknown student"),
        studentEmail: String(payload.studentEmail || ""),
        details: payload.details && typeof payload.details === "object" ? payload.details : {},
        createdAt: new Date().toISOString()
      };

      const events = readEvents();
      events.push(event);
      writeEvents(events.slice(-400));
      sendNotifications(event).catch(() => {});

      return sendJson(res, 200, { ok: true, event });
    } catch (error) {
      return sendJson(res, 400, { ok: false, error: "Invalid request body" });
    }
  }

  if (req.method !== "GET") {
    return sendJson(res, 405, { ok: false, error: "Method not allowed" });
  }

  return serveStatic(parsed.pathname, res);
});

server.listen(PORT, () => {
  console.log(`Pilingo server running on http://localhost:${PORT}`);
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    console.log("Telegram notifications: enabled");
  }
  if (RESEND_API_KEY && EMAIL_TO && EMAIL_FROM) {
    console.log("Email notifications: enabled");
  }
});

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(EVENTS_FILE)) fs.writeFileSync(EVENTS_FILE, "[]", "utf8");
}

function readEvents() {
  try {
    return JSON.parse(fs.readFileSync(EVENTS_FILE, "utf8"));
  } catch (error) {
    return [];
  }
}

function writeEvents(events) {
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), "utf8");
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error("Body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function serveStatic(requestPath, res) {
  let filePath = requestPath === "/" ? "/index.html" : requestPath;
  filePath = path.normalize(filePath).replace(/^(\.\.[/\\])+/, "");
  const absolutePath = path.join(ROOT, filePath);

  if (!absolutePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(absolutePath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not found");
        return;
      }

      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Server error");
      return;
    }

    const ext = path.extname(absolutePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream"
    });
    res.end(content);
  });
}

async function sendNotifications(event) {
  await Promise.allSettled([
    sendTelegramNotification(event),
    sendEmailNotification(event)
  ]);
}

async function sendTelegramNotification(event) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const text = [
    "Pilingo student activity",
    `Student: ${event.studentName || "Unknown student"}`,
    `Action: ${event.label || event.type || "Activity"}`,
    `Page: ${event.page || ""}`,
    `Time: ${event.createdAt || ""}`
  ].join("\n");

  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text
    })
  });
}

async function sendEmailNotification(event) {
  if (!RESEND_API_KEY || !EMAIL_TO || !EMAIL_FROM) return;

  const subject = `Pilingo student activity: ${event.label || event.type || "Activity"}`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2>Pilingo student activity</h2>
      <p><strong>Student:</strong> ${escapeHtml(event.studentName || "Unknown student")}</p>
      <p><strong>Email:</strong> ${escapeHtml(event.studentEmail || "")}</p>
      <p><strong>Action:</strong> ${escapeHtml(event.label || event.type || "Activity")}</p>
      <p><strong>Page:</strong> ${escapeHtml(event.page || "")}</p>
      <p><strong>Time:</strong> ${escapeHtml(event.createdAt || "")}</p>
    </div>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [EMAIL_TO],
      subject,
      html
    })
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
