import { test, before, after, suite } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, mkdir, symlink } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createAppServer } from "../lib/server.mjs";

let root;
let server;
const PORT = 3333;
const BASE = `http://localhost:${PORT}`;

before(async () => {
  root = await mkdtemp(join(tmpdir(), "serv-test-"));
  await writeFile(join(root, "index.html"), "<html><body>hello</body></html>");
  await writeFile(join(root, "style.css"), "body {}");
  await mkdir(join(root, "sub"));
  await writeFile(join(root, "sub", "index.html"), "<html><body>sub</body></html>");
  await symlink("/etc/passwd", join(root, "link"));
  await writeFile(join(root, ".env"), "SECRET=1");
  await mkdir(join(root, "node_modules"));
  await writeFile(join(root, "node_modules", "pkg.js"), "module.exports = {}");
  await mkdir(join(root, ".git"));
  await writeFile(join(root, ".git", "config"), "[core]");

  ({ server } = await createAppServer({ ROOT: root, PORT, plugins: [] }));
  await new Promise((resolve) => server.once("listening", resolve));
});

after(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});

test("serves index.html at /", async () => {
  const res = await fetch(`${BASE}/`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "text/html");
  const text = await res.text();
  assert.ok(text.includes("hello"));
});

test("serves static file", async () => {
  const res = await fetch(`${BASE}/style.css`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "text/css");
});

test("serves subdirectory index.html", async () => {
  const res = await fetch(`${BASE}/sub/`);
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.ok(text.includes("sub"));
});

test("returns 404 for missing file", async () => {
  const res = await fetch(`${BASE}/not-found.html`);
  assert.equal(res.status, 404);
});

test("blocks path traversal", async () => {
  // fetch normalizes the URL before sending, so ../../ is stripped.
  // The resolved path stays within root, and the file doesn't exist → 404.
  const res = await fetch(`${BASE}/../../etc/passwd`);
  assert.equal(res.status, 404);
});

test("blocks symbolic links", async () => {
  const res = await fetch(`${BASE}/link`);
  assert.equal(res.status, 403);
});

test("blocks dotfiles by default", async () => {
  const res = await fetch(`${BASE}/.env`);
  assert.equal(res.status, 404);
});

test("blocks node_modules by default", async () => {
  const res = await fetch(`${BASE}/node_modules/pkg.js`);
  assert.equal(res.status, 404);
});

test("blocks nested dotfiles by default", async () => {
  const res = await fetch(`${BASE}/.git/config`);
  assert.equal(res.status, 404);
});

suite("ignoreDotfilesAndModules=false", () => {
  let s;
  const PORT2 = 3335;
  const BASE2 = `http://localhost:${PORT2}`;

  before(async () => {
    ({ server: s } = await createAppServer({
      ROOT: root,
      PORT: PORT2,
      plugins: [],
      ignoreDotfilesAndModules: false,
    }));
    await new Promise((resolve) => s.once("listening", resolve));
  });

  after(async () => {
    s.closeAllConnections();
    await new Promise((resolve) => s.close(resolve));
  });

  test("serves dotfiles when ignoreDotfilesAndModules=false", async () => {
    const res = await fetch(`${BASE2}/.env`);
    assert.equal(res.status, 200);
  });

  test("serves node_modules when ignoreDotfilesAndModules=false", async () => {
    const res = await fetch(`${BASE2}/node_modules/pkg.js`);
    assert.equal(res.status, 200);
  });
});
