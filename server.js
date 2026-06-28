const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

loadEnvFile();

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT, "data"));
const EVENTS_FILE = path.join(DATA_DIR, "student-events.json");
const STATS_FILE = path.join(DATA_DIR, "student-stats.json");
const ACCOUNTS_FILE = path.join(DATA_DIR, "accounts.json");
const RESETS_FILE = path.join(DATA_DIR, "password-resets.json");
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const EMAIL_TO = process.env.EMAIL_TO || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "";
const OWNER_EMAILS = parseOwnerEmails(process.env.OWNER_EMAILS || EMAIL_TO);
const OWNER_PANEL_TOKEN = process.env.OWNER_PANEL_TOKEN || `owner-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
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
  applyApiHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && parsed.pathname === "/api/health") {
    return sendJson(res, 200, {
      ok: true,
      status: "healthy"
    });
  }

  if (req.method === "GET" && parsed.pathname === "/api/notifications") {
    if (!hasOwnerAccess(req)) {
      return sendJson(res, 403, {
        ok: false,
        error: "Owner access only"
      });
    }
    return sendJson(res, 200, {
      ok: true,
      events: readEvents().slice(-50).reverse()
    });
  }

  if (req.method === "GET" && parsed.pathname === "/api/owner/students") {
    if (!hasOwnerAccess(req)) {
      return sendJson(res, 403, {
        ok: false,
        error: "Owner access only"
      });
    }
    return sendJson(res, 200, {
      ok: true,
      students: getOwnerStudentRoster()
    });
  }

  if (req.method === "GET" && parsed.pathname === "/api/leaderboard") {
    return sendJson(res, 200, {
      ok: true,
      students: getLeaderboard()
    });
  }

  if (req.method === "GET" && parsed.pathname === "/api/social") {
    const viewerEmail = normalizeEmail(parsed.searchParams.get("viewerEmail") || "");
    return sendJson(res, 200, {
      ok: true,
      social: getSocialSnapshot(viewerEmail)
    });
  }

  if (req.method === "GET" && parsed.pathname === "/api/social/profile") {
    const viewerEmail = normalizeEmail(parsed.searchParams.get("viewerEmail") || "");
    const targetEmail = normalizeEmail(parsed.searchParams.get("targetEmail") || "");
    return sendJson(res, 200, {
      ok: true,
      profile: getStudentProfile(viewerEmail, targetEmail)
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
      if (isNamedStudentEvent(event)) {
        upsertStudentStats({
          studentName: event.studentName,
          studentEmail: event.studentEmail,
          studentPhone: event.studentPhone,
          studentLocation: event.studentLocation,
          xp: 0,
          level: 0,
          streak: 0,
          completedSections: 0,
          averageGrade: 0,
          bestGrade: 0,
          lessonsFinished: 0
        });
      }
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

  if (req.method === "POST" && parsed.pathname === "/api/social/follow") {
    try {
      const body = await readBody(req);
      const payload = JSON.parse(body || "{}");
      const result = updateFollowState(payload || {});
      if (!result.ok) {
        return sendJson(res, 400, { ok: false, error: result.error || "Could not update follow status." });
      }
      return sendJson(res, 200, {
        ok: true,
        social: getSocialSnapshot(result.viewerEmail)
      });
    } catch (error) {
      return sendJson(res, 400, { ok: false, error: "Invalid follow request" });
    }
  }

  if (req.method === "POST" && parsed.pathname === "/api/social/block") {
    try {
      const body = await readBody(req);
      const payload = JSON.parse(body || "{}");
      const result = updateBlockState(payload || {});
      if (!result.ok) {
        return sendJson(res, 400, { ok: false, error: result.error || "Could not update block status." });
      }
      return sendJson(res, 200, {
        ok: true,
        social: getSocialSnapshot(result.viewerEmail),
        profile: getStudentProfile(result.viewerEmail, result.targetEmail)
      });
    } catch (error) {
      return sendJson(res, 400, { ok: false, error: "Invalid block request" });
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
      return sendJson(res, 200, {
        ok: true,
        code: result.code || null,
        deliveredByEmail: !!result.deliveredByEmail
      });
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

function loadEnvFile() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;

  const raw = fs.readFileSync(envPath, "utf8");
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const index = trimmed.indexOf("=");
    if (index < 0) return;

    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  });
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
    const accounts = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, "utf8"));
    return Array.isArray(accounts) ? accounts.map(normalizeAccountRecord) : [];
  } catch (error) {
    return [];
  }
}

function writeAccounts(accounts) {
  const normalized = Array.isArray(accounts) ? accounts.map(normalizeAccountRecord) : [];
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(normalized, null, 2), "utf8");
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

function applyApiHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Pilingo-Owner-Token");
  res.setHeader("Cache-Control", "no-store");
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
  const normalizedName = name.toLowerCase();
  const existingIndex = students.findIndex((student) => {
    const studentEmail = String(student.email || "").trim().toLowerCase();
    const studentPhone = String(student.phone || "").trim();
    const studentName = String(student.name || "").trim().toLowerCase();
    return (
      (!!email && studentEmail === email) ||
      (!!phone && studentPhone === phone) ||
      (!!normalizedName && normalizedName !== "unknown student" && studentName === normalizedName)
    );
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

function isNamedStudentEvent(event) {
  const email = String(event?.studentEmail || "").trim().toLowerCase();
  const phone = String(event?.studentPhone || "").trim();
  const name = String(event?.studentName || "").trim().toLowerCase();
  return !!(email || phone || (name && name !== "unknown student"));
}

function publicAccount(account) {
  const isOwner = isOwnerEmail(account?.email);
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    phone: account.phone,
    location: account.location || "",
    createdAt: account.createdAt,
    following: Array.isArray(account?.following) ? account.following.slice() : [],
    blocked: Array.isArray(account?.blocked) ? account.blocked.slice() : [],
    isOwner,
    ownerPanelToken: isOwner ? OWNER_PANEL_TOKEN : ""
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
    createdAt: new Date().toISOString(),
    following: [],
    blocked: []
  };
  accounts.push(account);
  writeAccounts(accounts);
  upsertStudentStats({
    studentName: account.name,
    studentEmail: account.email,
    studentPhone: account.phone,
    studentLocation: account.location || "",
    xp: 0,
    level: 0,
    streak: 0,
    completedSections: 0,
    averageGrade: 0,
    bestGrade: 0,
    lessonsFinished: 0
  });
  return account;
}

function findAccountByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const accounts = readAccounts();
  return accounts.find((account) =>
    String(account.email || "").trim().toLowerCase() === normalizedEmail
  ) || null;
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeAccountRecord(account) {
  const following = Array.isArray(account?.following)
    ? account.following.map((email) => normalizeEmail(email)).filter(Boolean)
    : [];
  const blocked = Array.isArray(account?.blocked)
    ? account.blocked.map((email) => normalizeEmail(email)).filter(Boolean)
    : [];

  return {
    ...account,
    email: normalizeEmail(account?.email),
    phone: String(account?.phone || "").trim(),
    location: String(account?.location || "").trim(),
    following: Array.from(new Set(following)),
    blocked: Array.from(new Set(blocked))
  };
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

function parseOwnerEmails(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function isOwnerEmail(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  return !!(normalizedEmail && OWNER_EMAILS.includes(normalizedEmail));
}

function hasOwnerAccess(req) {
  const token = String(req.headers["x-pilingo-owner-token"] || "").trim();
  return !!(token && token === OWNER_PANEL_TOKEN);
}

function updateFollowState(payload) {
  const viewerEmail = normalizeEmail(payload?.viewerEmail);
  const targetEmail = normalizeEmail(payload?.targetEmail);
  const shouldFollow = payload?.follow !== false;

  if (!viewerEmail || !targetEmail) {
    return { ok: false, error: "Both students need an email address." };
  }

  if (viewerEmail === targetEmail) {
    return { ok: false, error: "Students cannot follow themselves." };
  }

  const accounts = readAccounts();
  const viewerIndex = accounts.findIndex((account) => normalizeEmail(account?.email) === viewerEmail);
  const targetIndex = accounts.findIndex((account) => normalizeEmail(account?.email) === targetEmail);

  if (viewerIndex < 0 || targetIndex < 0) {
    return { ok: false, error: "Both students need real accounts before following." };
  }

  const viewer = normalizeAccountRecord(accounts[viewerIndex]);
  const target = normalizeAccountRecord(accounts[targetIndex]);
  const nextFollowing = new Set(viewer.following || []);
  const viewerBlocked = new Set(viewer.blocked || []);
  const targetBlocked = new Set(target.blocked || []);

  if (shouldFollow) {
    if (viewerBlocked.has(targetEmail) || targetBlocked.has(viewerEmail)) {
      return { ok: false, error: "This student cannot be followed right now." };
    }
    nextFollowing.add(targetEmail);
  } else {
    nextFollowing.delete(targetEmail);
  }

  accounts[viewerIndex] = {
    ...viewer,
    following: Array.from(nextFollowing)
  };
  writeAccounts(accounts);

  return { ok: true, viewerEmail };
}

function updateBlockState(payload) {
  const viewerEmail = normalizeEmail(payload?.viewerEmail);
  const targetEmail = normalizeEmail(payload?.targetEmail);
  const shouldBlock = payload?.block !== false;

  if (!viewerEmail || !targetEmail) {
    return { ok: false, error: "Both students need an email address." };
  }

  if (viewerEmail === targetEmail) {
    return { ok: false, error: "Students cannot block themselves." };
  }

  const accounts = readAccounts();
  const viewerIndex = accounts.findIndex((account) => normalizeEmail(account?.email) === viewerEmail);
  const targetIndex = accounts.findIndex((account) => normalizeEmail(account?.email) === targetEmail);

  if (viewerIndex < 0 || targetIndex < 0) {
    return { ok: false, error: "Both students need real accounts before blocking." };
  }

  const viewer = normalizeAccountRecord(accounts[viewerIndex]);
  const nextBlocked = new Set(viewer.blocked || []);
  const nextFollowing = new Set(viewer.following || []);

  if (shouldBlock) {
    nextBlocked.add(targetEmail);
    nextFollowing.delete(targetEmail);
  } else {
    nextBlocked.delete(targetEmail);
  }

  accounts[viewerIndex] = {
    ...viewer,
    blocked: Array.from(nextBlocked),
    following: Array.from(nextFollowing)
  };
  writeAccounts(accounts);

  return { ok: true, viewerEmail, targetEmail };
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

  const delivery = await sendPasswordResetCode(account, code);
  return {
    ok: true,
    deliveredByEmail: !!delivery?.deliveredByEmail,
    code
  };
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
  const normalizeName = (value) => String(value || "").trim().toLowerCase();
  const rememberStudent = (studentLike) => {
    const email = String(studentLike.email || studentLike.studentEmail || "").trim().toLowerCase();
    const phone = String(studentLike.phone || studentLike.studentPhone || "").trim();
    const name = String(studentLike.name || studentLike.studentName || "Unknown student").trim();
    const location = String(studentLike.location || studentLike.studentLocation || "").trim();
    const nameKey = normalizeName(name);
    const preferredKey = email || phone || nameKey;
    if (!preferredKey || nameKey === "unknown student") return null;

    let current = null;
    let currentKey = "";

    for (const [key, value] of merged.entries()) {
      const sameEmail = !!(email && value.email === email);
      const samePhone = !!(phone && value.phone === phone);
      const sameName = !!(nameKey && normalizeName(value.name) === nameKey);
      if (sameEmail || samePhone || sameName) {
        current = value;
        currentKey = key;
        break;
      }
    }

    if (!current) {
      const createdAt = studentLike.createdAt || studentLike.updatedAt || new Date().toISOString();
      const base = {
        id: studentLike.id || `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        name,
        email,
        phone,
        location,
        xp: 0,
        level: 0,
        streak: 0,
        completedSections: 0,
        averageGrade: 0,
        bestGrade: 0,
        lessonsFinished: 0,
        updatedAt: createdAt
      };
      merged.set(preferredKey, base);
      return base;
    }

    current.name = current.name || name;
    current.email = current.email || email;
    current.phone = current.phone || phone;
    current.location = current.location || location;
    current.updatedAt = current.updatedAt > (studentLike.updatedAt || studentLike.createdAt || current.updatedAt)
      ? current.updatedAt
      : (studentLike.updatedAt || studentLike.createdAt || current.updatedAt);

    if (currentKey && currentKey !== preferredKey && (email || phone)) {
      merged.delete(currentKey);
      merged.set(preferredKey, current);
    }

    return current;
  };

  readAccounts().forEach((account) => {
    rememberStudent(account);
  });

  readEvents().forEach((event) => {
    if (!event) return;
    const hasIdentity = String(event.studentEmail || "").trim() || String(event.studentPhone || "").trim();
    const hasNamedStudent = String(event.studentName || "").trim() && String(event.studentName || "").trim().toLowerCase() !== "unknown student";
    if (!hasIdentity && !hasNamedStudent) return;
    rememberStudent({
      studentName: event.studentName,
      studentEmail: event.studentEmail,
      studentPhone: event.studentPhone,
      studentLocation: event.studentLocation,
      createdAt: event.createdAt,
      updatedAt: event.createdAt
    });
  });

  readStudentStats().forEach((student) => {
    const current = rememberStudent(student);
    if (!current) return;

    const key = current.email || current.phone || current.name.toLowerCase();
    merged.set(key, {
      ...current,
      name: current.name || String(student.name || "Unknown student").trim(),
      email: current.email || String(student.email || "").trim().toLowerCase(),
      phone: current.phone || String(student.phone || "").trim(),
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

function getSocialSnapshot(viewerEmail) {
  const accounts = readAccounts();
  const leaderboard = getLeaderboard();
  const accountByEmail = new Map();
  const statsByEmail = new Map();
  const followersByEmail = new Map();
  const followingByEmail = new Map();
  const blockedByEmail = new Map();
  const knownStudents = new Map();

  const rememberKnownStudent = (studentLike) => {
    const email = normalizeEmail(studentLike?.email || studentLike?.studentEmail);
    const phone = String(studentLike?.phone || studentLike?.studentPhone || "").trim();
    const name = String(studentLike?.name || studentLike?.studentName || "").trim();
    const key = email || phone || name.toLowerCase();
    if (!key) return null;

    const current = knownStudents.get(key) || {
      id: studentLike?.id || "",
      name: name || "Student",
      email,
      phone
    };

    current.id = current.id || studentLike?.id || "";
    current.name = current.name || name || "Student";
    current.email = current.email || email;
    current.phone = current.phone || phone;
    knownStudents.set(key, current);
    return current;
  };

  accounts.forEach((account) => {
    const normalized = normalizeAccountRecord(account);
    if (normalized.email) {
      accountByEmail.set(normalized.email, normalized);
    }
    rememberKnownStudent(normalized);
  });

  leaderboard.forEach((student, index) => {
    const key = normalizeEmail(student?.email);
    rememberKnownStudent(student);
    if (!key) return;
    statsByEmail.set(key, {
      rank: index + 1,
      xp: safeNumber(student?.xp, 0),
      level: safeNumber(student?.level, 0),
      streak: safeNumber(student?.streak, 0),
      completedSections: safeNumber(student?.completedSections, 0),
      averageGrade: safeNumber(student?.averageGrade, 0)
    });
  });

  accounts.forEach((account) => {
    const accountEmail = normalizeEmail(account?.email);
    if (!accountEmail) return;
    const following = Array.isArray(account?.following) ? account.following : [];
    const blocked = Array.isArray(account?.blocked) ? account.blocked : [];
    followingByEmail.set(accountEmail, Array.from(new Set(following.map(normalizeEmail).filter(Boolean))));
    blockedByEmail.set(accountEmail, Array.from(new Set(blocked.map(normalizeEmail).filter(Boolean))));
    following.forEach((followedEmail) => {
      const followed = normalizeEmail(followedEmail);
      if (!followed) return;
      const currentFollowers = followersByEmail.get(followed) || [];
      currentFollowers.push(accountEmail);
      followersByEmail.set(followed, currentFollowers);
    });
  });

  const students = Array.from(knownStudents.values()).map((student) => {
    const email = normalizeEmail(student?.email);
    const followers = Array.from(new Set(followersByEmail.get(email) || []));
    const following = Array.from(new Set(followingByEmail.get(email) || []));
    const viewerBlocked = Array.from(new Set(blockedByEmail.get(viewerEmail) || []));
    const blockedByStudent = Array.from(new Set(blockedByEmail.get(email) || []));
    const stats = statsByEmail.get(email) || {};
    const account = accountByEmail.get(email) || null;
    return {
      id: student.id || account?.id || "",
      name: student.name || account?.name || "Student",
      email,
      phone: student.phone || account?.phone || "",
      hasAccount: !!account,
      followersCount: followers.length,
      followingCount: following.length,
      followers,
      following,
      blocked: Array.from(new Set(blockedByEmail.get(email) || [])),
      isCurrentStudent: email === viewerEmail,
      isFollowing: !!(viewerEmail && viewerEmail !== email && (followingByEmail.get(viewerEmail) || []).includes(email)),
      isBlocked: !!(viewerEmail && viewerEmail !== email && viewerBlocked.includes(email)),
      blockedYou: !!(viewerEmail && viewerEmail !== email && blockedByStudent.includes(viewerEmail)),
      rank: safeNumber(stats.rank, 0),
      xp: safeNumber(stats.xp, 0),
      level: safeNumber(stats.level, 0),
      streak: safeNumber(stats.streak, 0),
      completedSections: safeNumber(stats.completedSections, 0),
      averageGrade: safeNumber(stats.averageGrade, 0)
    };
  }).sort((a, b) => {
    if (a.isCurrentStudent) return -1;
    if (b.isCurrentStudent) return 1;
    if (b.xp !== a.xp) return b.xp - a.xp;
    if (b.averageGrade !== a.averageGrade) return b.averageGrade - a.averageGrade;
    return String(a.name || "").localeCompare(String(b.name || ""));
  });

  const currentStudent = students.find((student) => student.isCurrentStudent) || null;
  const currentBlocked = currentStudent?.blocked || [];
  const followingStudents = currentStudent
    ? students.filter((student) => currentStudent.following.includes(student.email) && !student.blockedYou)
    : [];
  const followerStudents = currentStudent
    ? students.filter((student) => currentStudent.followers.includes(student.email) && !currentBlocked.includes(student.email))
    : [];
  const suggestedStudents = students.filter((student) =>
    !student.isCurrentStudent &&
    !(currentStudent?.following || []).includes(student.email) &&
    !(currentBlocked || []).includes(student.email) &&
    !student.blockedYou
  ).slice(0, 8);

  return {
    currentStudent,
    followingStudents,
    followerStudents,
    suggestedStudents,
    students
  };
}

function getStudentProfile(viewerEmail, targetEmail) {
  const snapshot = getSocialSnapshot(viewerEmail);
  const target = (snapshot.students || []).find((student) => normalizeEmail(student?.email) === targetEmail) || null;
  if (!target) return null;

  const current = snapshot.currentStudent || null;
  const currentBlocked = current?.blocked || [];

  return {
    ...target,
    canFollow: !target.isCurrentStudent && !target.isBlocked && !target.blockedYou,
    canBlock: !target.isCurrentStudent,
    visibleToViewer: !currentBlocked.includes(target.email),
    profileStatus: target.blockedYou
      ? "This student blocked you."
      : target.isBlocked
        ? "You blocked this student."
        : target.isFollowing
          ? "You are following this student."
          : "You can follow this student."
  };
}

function getOwnerStudentRoster() {
  const students = new Map();
  const leaderboard = getLeaderboard();
  const leaderboardByEmail = new Map();

  const rememberStudent = (studentLike) => {
    const email = normalizeEmail(studentLike?.email || studentLike?.studentEmail);
    const phone = String(studentLike?.phone || studentLike?.studentPhone || "").trim();
    const name = String(studentLike?.name || studentLike?.studentName || "").trim();
    const location = String(studentLike?.location || studentLike?.studentLocation || "").trim();
    const key = email || phone || name.toLowerCase();
    if (!key) return null;

    const current = students.get(key) || {
      id: studentLike?.id || "",
      name: name || "Student",
      email,
      phone,
      location,
      createdAt: studentLike?.createdAt || "",
      lastSeenAt: "",
      latestAction: "",
      xp: 0,
      averageGrade: 0,
      completedSections: 0,
      rank: 0
    };

    current.id = current.id || studentLike?.id || "";
    current.name = current.name || name || "Student";
    current.email = current.email || email;
    current.phone = current.phone || phone;
    current.location = current.location || location;
    current.createdAt = current.createdAt || studentLike?.createdAt || "";
    students.set(key, current);
    return current;
  };

  leaderboard.forEach((student, index) => {
    const email = normalizeEmail(student?.email);
    if (email) {
      leaderboardByEmail.set(email, { ...student, rank: index + 1 });
    }
    const current = rememberStudent(student);
    if (!current) return;
    current.rank = index + 1;
    current.xp = safeNumber(student?.xp, current.xp);
    current.averageGrade = safeNumber(student?.averageGrade, current.averageGrade);
    current.completedSections = safeNumber(student?.completedSections, current.completedSections);
  });

  readAccounts().forEach((account) => {
    const current = rememberStudent(account);
    if (!current) return;
    current.createdAt = current.createdAt || account.createdAt || "";
    const fromBoard = leaderboardByEmail.get(normalizeEmail(account.email));
    if (fromBoard) {
      current.rank = current.rank || fromBoard.rank || 0;
      current.xp = Math.max(current.xp, safeNumber(fromBoard.xp, 0));
      current.averageGrade = Math.max(current.averageGrade, safeNumber(fromBoard.averageGrade, 0));
      current.completedSections = Math.max(current.completedSections, safeNumber(fromBoard.completedSections, 0));
    }
  });

  readEvents().forEach((event) => {
    const current = rememberStudent(event);
    if (!current) return;
    const createdAt = String(event?.createdAt || "");
    if (!current.lastSeenAt || new Date(createdAt).getTime() > new Date(current.lastSeenAt).getTime()) {
      current.lastSeenAt = createdAt;
      current.latestAction = String(event?.label || event?.type || "Activity");
      current.location = current.location || String(event?.studentLocation || "").trim();
    }
  });

  return Array.from(students.values())
    .sort((a, b) => {
      const aSeen = new Date(a.lastSeenAt || a.createdAt || 0).getTime();
      const bSeen = new Date(b.lastSeenAt || b.createdAt || 0).getTime();
      return bSeen - aSeen || String(a.name || "").localeCompare(String(b.name || ""));
    })
    .slice(0, 50);
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

  if (!RESEND_API_KEY || !EMAIL_FROM) {
    return { deliveredByEmail: false };
  }

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2>Pilingo password reset</h2>
      <p>Your reset code is:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px">${escapeHtml(code)}</p>
      <p>This code works for 15 minutes.</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
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

  return { deliveredByEmail: response.ok };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
