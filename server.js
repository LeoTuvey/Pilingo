const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const EVENTS_FILE = path.join(DATA_DIR, "student-events.json");
const STATS_FILE = path.join(DATA_DIR, "student-stats.json");
const ACCOUNTS_FILE = path.join(DATA_DIR, "accounts.json");
const RESETS_FILE = path.join(DATA_DIR, "password-resets.json");
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const EMAIL_TO = process.env.EMAIL_TO || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "";
const RESET_CODE_TTL_MS = 15 * 60 * 1000;

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

  if (req.method === "GET" && parsed.pathname === "/api/health") {
    return sendJson(res, 200, {
      ok: true,
      status: "healthy"
    });
  }

  if (req.method === "GET" && parsed.pathname === "/api/notifications") {
    return sendJson(res, 200, {
      ok: true,
      events: readEvents().slice(-50).reverse()
    });
  }

  if (req.method === "GET" && parsed.pathname === "/api/leaderboard") {
    return sendJson(res, 200, {
      ok: true,
      students: getLeaderboard()
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
        studentPhone: String(payload.studentPhone || ""),
        studentLocation: String(payload.studentLocation || ""),
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

  if (req.method === "POST" && parsed.pathname === "/api/student-stats") {
    try {
      const body = await readBody(req);
      const payload = JSON.parse(body || "{}");
      const student = upsertStudentStats(payload || {});
      return sendJson(res, 200, { ok: true, student });
    } catch (error) {
      return sendJson(res, 400, { ok: false, error: "Invalid student stats body" });
    }
  }

  if (req.method === "POST" && parsed.pathname === "/api/auth/register") {
    try {
      const body = await readBody(req);
      const payload = JSON.parse(body || "{}");
      const account = registerAccount(payload || {});
      if (!account) {
        return sendJson(res, 400, { ok: false, error: "This email is already in use." });
      }
      return sendJson(res, 200, { ok: true, account: publicAccount(account) });
    } catch (error) {
      return sendJson(res, 400, { ok: false, error: "Invalid register request" });
    }
  }

  if (req.method === "POST" && parsed.pathname === "/api/auth/login") {
    try {
      const body = await readBody(req);
      const payload = JSON.parse(body || "{}");
      const result = loginAccount(payload || {});
      if (!result?.ok) {
        if (result?.reason === "missing_account") {
          return sendJson(res, 404, { ok: false, error: "No account was found for this email. Please sign up first." });
        }
        if (result?.reason === "wrong_password") {
          return sendJson(res, 401, { ok: false, error: "Wrong password. Please try again." });
        }
        return sendJson(res, 401, { ok: false, error: "Wrong email or password." });
      }
      return sendJson(res, 200, { ok: true, account: publicAccount(result.account) });
    } catch (error) {
      return sendJson(res, 400, { ok: false, error: "Invalid login request" });
    }
  }

  if (req.method === "POST" && parsed.pathname === "/api/auth/request-reset") {
    try {
      const body = await readBody(req);
      const payload = JSON.parse(body || "{}");
      const result = await createPasswordReset(payload || {});
      if (!result?.ok) {
        if (result?.reason === "missing_email") {
          return sendJson(res, 400, { ok: false, error: "Please enter the account email first." });
        }
        if (result?.reason === "missing_account") {
          return sendJson(res, 404, { ok: false, error: "No account was found for this email. Please sign up first." });
        }
        return sendJson(res, 400, { ok: false, error: "Could not start password recovery." });
      }
      return sendJson(res, 200, { ok: true });
    } catch (error) {
      return sendJson(res, 400, { ok: false, error: "Invalid password reset request" });
    }
  }

  if (req.method === "POST" && parsed.pathname === "/api/auth/reset-password") {
    try {
      const body = await readBody(req);
      const payload = JSON.parse(body || "{}");
      const account = resetPassword(payload || {});
      if (!account) {
        return sendJson(res, 400, { ok: false, error: "The code is wrong or expired." });
      }
      return sendJson(res, 200, { ok: true, account: publicAccount(account) });
    } catch (error) {
      return sendJson(res, 400, { ok: false, error: "Invalid new password request" });
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
  if (!fs.existsSync(STATS_FILE)) fs.writeFileSync(STATS_FILE, "[]", "utf8");
  if (!fs.existsSync(ACCOUNTS_FILE)) fs.writeFileSync(ACCOUNTS_FILE, "[]", "utf8");
  if (!fs.existsSync(RESETS_FILE)) fs.writeFileSync(RESETS_FILE, "[]", "utf8");
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

function readStudentStats() {
  try {
    return JSON.parse(fs.readFileSync(STATS_FILE, "utf8"));
  } catch (error) {
    return [];
  }
}

function writeStudentStats(students) {
  fs.writeFileSync(STATS_FILE, JSON.stringify(students, null, 2), "utf8");
}

function readAccounts() {
  try {
    return JSON.parse(fs.readFileSync(ACCOUNTS_FILE, "utf8"));
  } catch (error) {
    return [];
  }
}

function writeAccounts(accounts) {
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), "utf8");
}

function readPasswordResets() {
  try {
    return JSON.parse(fs.readFileSync(RESETS_FILE, "utf8"));
  } catch (error) {
    return [];
  }
}

function writePasswordResets(resets) {
  fs.writeFileSync(RESETS_FILE, JSON.stringify(resets, null, 2), "utf8");
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
    const headers = {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream"
    };

    if (
      ext === ".html" ||
      ext === ".js" ||
      ext === ".css" ||
      ext === ".json" ||
      path.basename(absolutePath) === "sw.js" ||
      ext === ".webmanifest"
    ) {
      headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0";
      headers.Pragma = "no-cache";
      headers.Expires = "0";
    }

    res.writeHead(200, headers);
    res.end(content);
  });
}

function upsertStudentStats(payload) {
  const name = String(payload.studentName || "Unknown student").trim() || "Unknown student";
  const email = String(payload.studentEmail || "").trim().toLowerCase();
  const phone = String(payload.studentPhone || "").trim();
  const location = String(payload.studentLocation || "").trim();
  const students = readStudentStats();
  const key = email || phone || name.toLowerCase();
  const existingIndex = students.findIndex((student) => {
    const studentKey = String(student.email || student.phone || student.name || "").trim().toLowerCase();
    return studentKey === key;
  });
  const existing = existingIndex >= 0 ? students[existingIndex] : null;

  const merged = {
    id: existing?.id || `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name,
    email,
    phone,
    location,
    xp: safeNumber(payload.xp, existing?.xp || 0),
    level: safeNumber(payload.level, existing?.level || 0),
    streak: safeNumber(payload.streak, existing?.streak || 0),
    completedSections: safeNumber(payload.completedSections, existing?.completedSections || 0),
    averageGrade: safeNumber(payload.averageGrade, existing?.averageGrade || 0),
    bestGrade: safeNumber(payload.bestGrade, existing?.bestGrade || 0),
    lessonsFinished: safeNumber(payload.lessonsFinished, existing?.lessonsFinished || 0),
    updatedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    students[existingIndex] = merged;
  } else {
    students.push(merged);
  }

  writeStudentStats(students);
  return merged;
}

function publicAccount(account) {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    phone: account.phone,
    location: account.location || "",
    createdAt: account.createdAt
  };
}

function registerAccount(payload) {
  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const phone = String(payload.phone || "").trim();
  const password = String(payload.password || "").trim();
  const location = String(payload.location || "").trim();
  if (!name || !email || !phone || !password) return null;

  const accounts = readAccounts();
  const exists = accounts.some((account) => String(account.email || "").trim().toLowerCase() === email);
  if (exists) return null;

  const account = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name,
    email,
    phone,
    password,
    location,
    createdAt: new Date().toISOString()
  };
  accounts.push(account);
  writeAccounts(accounts);
  return account;
}

function findAccountByEmail(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) return null;

  const accounts = readAccounts();
  return accounts.find((account) =>
    String(account.email || "").trim().toLowerCase() === normalizedEmail
  ) || null;
}

function loginAccount(payload) {
  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "").trim();
  if (!email || !password) return null;

  const account = findAccountByEmail(email);
  if (!account) {
    return { ok: false, reason: "missing_account" };
  }
  if (String(account.password || "") !== password) {
    return { ok: false, reason: "wrong_password" };
  }

  return { ok: true, account };
}

async function createPasswordReset(payload) {
  const email = String(payload.email || "").trim().toLowerCase();
  if (!email) return { ok: false, reason: "missing_email" };

  const accounts = readAccounts();
  const account = accounts.find((item) => String(item.email || "").trim().toLowerCase() === email);
  if (!account) return { ok: false, reason: "missing_account" };

  const resets = readPasswordResets().filter((item) => item.email !== email);
  const code = String(Math.floor(100000 + Math.random() * 900000));
  resets.push({
    email,
    code,
    expiresAt: Date.now() + RESET_CODE_TTL_MS
  });
  writePasswordResets(resets);

  await sendPasswordResetCode(account, code);
  return { ok: true };
}

function resetPassword(payload) {
  const email = String(payload.email || "").trim().toLowerCase();
  const code = String(payload.code || "").trim();
  const newPassword = String(payload.newPassword || "").trim();
  if (!email || !code || !newPassword) return null;

  const resets = readPasswordResets();
  const match = resets.find((item) => item.email === email && item.code === code && Number(item.expiresAt || 0) > Date.now());
  if (!match) return null;

  const accounts = readAccounts();
  const index = accounts.findIndex((account) => String(account.email || "").trim().toLowerCase() === email);
  if (index < 0) return null;

  accounts[index].password = newPassword;
  writeAccounts(accounts);
  writePasswordResets(resets.filter((item) => !(item.email === email && item.code === code)));
  return accounts[index];
}

function getLeaderboard() {
  const merged = new Map();

  readStudentStats().forEach((student) => {
    const email = String(student.email || "").trim().toLowerCase();
    const phone = String(student.phone || "").trim();
    const name = String(student.name || "Unknown student").trim();
    const key = email || phone || name.toLowerCase();
    const current = merged.get(key);

    if (!current) {
      merged.set(key, { ...student });
      return;
    }

    merged.set(key, {
      ...current,
      name: current.name || name,
      email: current.email || email,
      phone: current.phone || phone,
      location: current.location || student.location || "",
      xp: Math.max(safeNumber(current.xp, 0), safeNumber(student.xp, 0)),
      level: Math.max(safeNumber(current.level, 0), safeNumber(student.level, 0)),
      streak: Math.max(safeNumber(current.streak, 0), safeNumber(student.streak, 0)),
      completedSections: Math.max(safeNumber(current.completedSections, 0), safeNumber(student.completedSections, 0)),
      averageGrade: Math.max(safeNumber(current.averageGrade, 0), safeNumber(student.averageGrade, 0)),
      bestGrade: Math.max(safeNumber(current.bestGrade, 0), safeNumber(student.bestGrade, 0)),
      lessonsFinished: Math.max(safeNumber(current.lessonsFinished, 0), safeNumber(student.lessonsFinished, 0)),
      updatedAt: current.updatedAt > student.updatedAt ? current.updatedAt : student.updatedAt
    });
  });

  return Array.from(merged.values())
    .map((student) => ({
      ...student,
      rankScore: leaderboardScore(student)
    }))
    .sort((a, b) =>
      b.rankScore - a.rankScore ||
      b.xp - a.xp ||
      b.averageGrade - a.averageGrade ||
      b.completedSections - a.completedSections ||
      a.name.localeCompare(b.name)
    )
    .slice(0, 20);
}

function leaderboardScore(student) {
  return (
    safeNumber(student.xp, 0) +
    (safeNumber(student.averageGrade, 0) * 4) +
    (safeNumber(student.completedSections, 0) * 25) +
    (safeNumber(student.streak, 0) * 3)
  );
}

function safeNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
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
    `Email: ${event.studentEmail || ""}`,
    `Phone: ${event.studentPhone || ""}`,
    `Location: ${event.studentLocation || ""}`,
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
      <p><strong>Phone:</strong> ${escapeHtml(event.studentPhone || "")}</p>
      <p><strong>Location:</strong> ${escapeHtml(event.studentLocation || "")}</p>
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

async function sendPasswordResetCode(account, code) {
  const event = {
    studentName: account.name,
    studentEmail: account.email,
    studentPhone: account.phone,
    studentLocation: account.location || "",
    label: "Requested password reset",
    type: "password_reset",
    page: "index.html",
    createdAt: new Date().toISOString()
  };

  await Promise.allSettled([
    sendTelegramNotification(event),
    sendEmailNotification(event)
  ]);

  if (!RESEND_API_KEY || !EMAIL_FROM) return;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2>Pilingo password reset</h2>
      <p>Your reset code is:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px">${escapeHtml(code)}</p>
      <p>This code works for 15 minutes.</p>
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
      to: [account.email],
      subject: "Your Pilingo password reset code",
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
