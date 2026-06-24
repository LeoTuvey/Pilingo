const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const EVENTS_FILE = path.join(DATA_DIR, "student-events.json");

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
