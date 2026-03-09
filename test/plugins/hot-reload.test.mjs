import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createAppServer } from '../../lib/server.mjs';
import { hotReloadPlugin } from '../../lib/plugins/hot-reload.mjs';

let root;
let server;
const PORT = 3334;
const BASE = `http://localhost:${PORT}`;

before(async () => {
  root = await mkdtemp(join(tmpdir(), 'serv-hotreload-test-'));
  await writeFile(join(root, 'index.html'), '<html><body>hello</body></html>');
  await writeFile(join(root, 'no-body.html'), '<html>no body tag</html>');

  ({ server } = await createAppServer({ ROOT: root, PORT, plugins: [hotReloadPlugin] }));
  await new Promise(resolve => server.once('listening', resolve));
});

after(async () => {
  hotReloadPlugin._watcher?.close();
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
});

test('injects script before </body>', async () => {
  const res = await fetch(`${BASE}/`);
  const text = await res.text();
  assert.ok(text.includes('<script>'));
  assert.ok(text.includes('EventSource'));
  assert.ok(text.includes('</body>'));
});

test('injects script at end when </body> is missing', async () => {
  const res = await fetch(`${BASE}/no-body.html`);
  const text = await res.text();
  assert.ok(text.includes('<script>'));
});

test('does not inject script into non-html response', async () => {
  await writeFile(join(root, 'style.css'), 'body {}');
  const res = await fetch(`${BASE}/style.css`);
  const text = await res.text();
  assert.ok(!text.includes('<script>'));
});

test('reloads browser via SSE on file change', async () => {
  const response = await fetch(`${BASE}/__hot-reload`);
  const reader = response.body.getReader();

  await writeFile(join(root, 'index.html'), '<html><body>updated</body></html>');

  const { value } = await reader.read();
  assert.ok(new TextDecoder().decode(value).includes('reload'));
  await reader.cancel();
});
