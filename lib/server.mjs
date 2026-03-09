import { createServer } from 'node:http';
import { readFile, stat, lstat } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { getMimeType } from './mime.mjs';

function isUnderRoot(root, filePath) {
  return filePath === root || filePath.startsWith(root + '/');
}

export async function createAppServer({ ROOT, PORT, plugins = [] }) {
  const root = resolve(ROOT);

  const server = createServer((req, res) => {
    if (plugins.some(plugin => plugin.handleRequest?.(req, res))) return;

    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const filePath = resolve(join(root, pathname));

    if (!isUnderRoot(root, filePath)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }

    lstat(filePath, (err, lstats) => {
      if (err) { res.writeHead(404); res.end('Not Found'); return; }
      if (lstats.isSymbolicLink()) { res.writeHead(403); res.end('Forbidden'); return; }

      stat(filePath, (err, info) => {
        if (err) { res.writeHead(404); res.end('Not Found'); return; }

        const target = info.isDirectory() ? join(filePath, 'index.html') : filePath;

        readFile(target, (err, body) => {
          if (err) { res.writeHead(404); res.end('Not Found'); return; }

          const mime = getMimeType(extname(target).toLowerCase()) ?? 'application/octet-stream';

          const transformed = plugins.reduce(
            (acc, plugin) => plugin.transformResponse?.(acc, { mime, target }) ?? acc,
            body
          );

          res.writeHead(200, { 'Content-Type': mime });
          res.end(transformed);
        });
      });
    });
  });

  await Promise.all(plugins.map(plugin => plugin.setup?.({ server, root, port: PORT })));

  server.listen(PORT, '127.0.0.1', () => {
    console.log(`serving ${root} at http://localhost:${PORT}`);
  });

  return { server };
}
