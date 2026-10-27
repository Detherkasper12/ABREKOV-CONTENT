// LOCAL DEVELOPMENT / TESTS ONLY. A tiny stand-in for the two Supabase services the
// app calls over HTTP (Auth password sign-in and Storage signed uploads), so the whole
// admin flow can run against a local Postgres without a Supabase project.
// Production always uses real Supabase.
//
//   MOCK_ADMIN_EMAIL=me@example.com MOCK_ADMIN_PASSWORD=secret node scripts/mock-supabase.mjs
import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

const PORT = Number(process.env.MOCK_PORT ?? 54321);
const ROOT = process.env.MOCK_STORAGE_DIR ?? "/var/tmp/abrekov-mock-storage";
const EMAIL = process.env.MOCK_ADMIN_EMAIL ?? "admin@example.com";
const PASSWORD = process.env.MOCK_ADMIN_PASSWORD ?? "password";
const USER = {
  id: "00000000-0000-4000-8000-000000000001",
  aud: "authenticated",
  role: "authenticated",
  email: EMAIL,
  app_metadata: { provider: "email" },
  user_metadata: {},
  created_at: new Date().toISOString(),
};
const sessions = new Set();
const uploadTokens = new Map();

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
function session() {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const access = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: USER.id, email: EMAIL, role: "authenticated", aud: "authenticated", exp })}.${randomBytes(16).toString("base64url")}`;
  sessions.add(access);
  return { access_token: access, token_type: "bearer", expires_in: 3600, expires_at: exp, refresh_token: randomBytes(16).toString("hex"), user: USER };
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    ...(typeof body === "object" && !Buffer.isBuffer(body) ? { "Content-Type": "application/json" } : {}),
    ...headers,
  });
  res.end(typeof body === "object" && !Buffer.isBuffer(body) ? JSON.stringify(body) : body);
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}

function safePath(p) {
  const n = normalize(decodeURIComponent(p)).replace(/^(\.\.(\/|$))+/, "");
  return join(ROOT, n);
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  if (req.method === "OPTIONS") return send(res, 204, "");

  // ----- Auth -----
  if (path === "/auth/v1/token" && req.method === "POST") {
    const body = JSON.parse((await readBody(req)).toString() || "{}");
    if (url.searchParams.get("grant_type") === "password") {
      if (body.email?.toLowerCase() === EMAIL.toLowerCase() && body.password === PASSWORD) return send(res, 200, session());
      return send(res, 400, { code: 400, error_code: "invalid_credentials", msg: "Invalid login credentials" });
    }
    if (url.searchParams.get("grant_type") === "refresh_token") return send(res, 200, session());
    return send(res, 400, { msg: "unsupported grant" });
  }
  if (path === "/auth/v1/user" && req.method === "GET") {
    const token = (req.headers.authorization ?? "").replace(/^Bearer /i, "");
    if (sessions.has(token)) return send(res, 200, USER);
    return send(res, 401, { code: 401, error_code: "bad_jwt", msg: "invalid JWT" });
  }
  if (path === "/auth/v1/logout") {
    sessions.delete((req.headers.authorization ?? "").replace(/^Bearer /i, ""));
    return send(res, 204, "");
  }

  // ----- Storage -----
  let m = path.match(/^\/storage\/v1\/object\/upload\/sign\/([^/]+)\/(.+)$/);
  if (m && req.method === "POST") {
    if (!(req.headers.authorization ?? "").includes(process.env.MOCK_SERVICE_KEY ?? "service-role-key")) return send(res, 403, { message: "forbidden" });
    const token = randomBytes(16).toString("hex");
    uploadTokens.set(token, `${m[1]}/${m[2]}`);
    return send(res, 200, { url: `/object/upload/sign/${m[1]}/${m[2]}?token=${token}` });
  }
  if (m && req.method === "PUT") {
    const key = `${m[1]}/${m[2]}`;
    if (uploadTokens.get(url.searchParams.get("token")) !== key) return send(res, 400, { message: "invalid token" });
    uploadTokens.delete(url.searchParams.get("token"));
    const raw = await readBody(req);
    let data = raw;
    let type = req.headers["content-type"] ?? "application/octet-stream";
    if (type.startsWith("multipart/form-data")) {
      const form = await new Request("http://x", { method: "POST", headers: { "content-type": type }, body: raw }).formData();
      const file = [...form.values()].find((v) => typeof v === "object");
      data = Buffer.from(await file.arrayBuffer());
      type = file.type || "application/octet-stream";
    }
    const target = safePath(key);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, data);
    writeFileSync(`${target}.type`, type);
    return send(res, 200, { Key: key });
  }
  m = path.match(/^\/storage\/v1\/object\/(?!public\/|upload\/)([^/]+)\/(.+)$/);
  if (m && (req.method === "POST" || req.method === "PUT")) {
    if (!(req.headers.authorization ?? "").includes(process.env.MOCK_SERVICE_KEY ?? "service-role-key")) return send(res, 403, { message: "forbidden" });
    const target = safePath(`${m[1]}/${m[2]}`);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, await readBody(req));
    writeFileSync(`${target}.type`, req.headers["content-type"] ?? "application/octet-stream");
    return send(res, 200, { Key: `${m[1]}/${m[2]}` });
  }
  m = path.match(/^\/storage\/v1\/object\/public\/(.+)$/);
  if (m && req.method === "GET") {
    const target = safePath(m[1]);
    if (!existsSync(target)) return send(res, 404, { message: "not found" });
    return send(res, 200, readFileSync(target), { "Content-Type": readFileSync(`${target}.type`, "utf8") });
  }

  send(res, 404, { message: `mock: no route ${req.method} ${path}` });
}).listen(PORT, () => console.log(`mock supabase on :${PORT} (admin ${EMAIL})`));
