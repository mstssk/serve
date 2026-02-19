import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir, symlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createAppServer } from '../lib/server.mjs';

let root;
let server;
const PORT = 3333;
const BASE = `http://localhost:${PORT}`;

before(async () => {
  root = await mkdtemp(join(tmpdir(), 'serv-test-'));
  await writeFile(join(root, 'index.html'), '<html><body>hello</body></html>');
  await writeFile(join(root, 'style.css'), 'body {}');
  await mkdir(join(root, 'sub'));
  await writeFile(join(root, 'sub', 'index.html'), '<html><body>sub</body></html>');
  await symlink('/etc/passwd', join(root, 'link'));

  ({ server } = await createAppServer({ ROOT: root, PORT, plugins: [] }));
  await new Promise(resolve => server.once('listening', resolve));
});

after(() => {
  server.close();
});

test('serves index.html at /', async () => {
  const res = await fetch(`${BASE}/`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'text/html');
  const text = await res.text();
  assert.ok(text.includes('hello'));
});

test('serves static file', async () => {
  const res = await fetch(`${BASE}/style.css`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'text/css');
});

test('serves subdirectory index.html', async () => {
  const res = await fetch(`${BASE}/sub/`);
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.ok(text.includes('sub'));
});

test('returns 404 for missing file', async () => {
  const res = await fetch(`${BASE}/not-found.html`);
  assert.equal(res.status, 404);
});

test('blocks path traversal', async () => {
  const res = await fetch(`${BASE}/../../etc/passwd`);
  assert.equal(res.status, 403);
});

test('blocks symbolic links', async () => {
  const res = await fetch(`${BASE}/link`);
  assert.equal(res.status, 403);
});
