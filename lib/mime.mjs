const MIME_TYPES = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'text/javascript',
  '.mjs':  'text/javascript',
  '.json': 'application/json',
  '.xml':  'application/xml',
  '.csv':  'text/csv',
  '.wasm': 'application/wasm',
  '.map':  'application/json',

  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.avif': 'image/avif',

  '.mp4':  'video/mp4',
  '.webm': 'video/webm',

  '.woff':  'font/woff',
  '.woff2': 'font/woff2',
  '.ttf':   'font/ttf',
  '.otf':   'font/otf',

  '.txt': 'text/plain',
  '.pdf': 'application/pdf',
  '.gz':  'application/gzip',
};

export function getMimeType(ext) {
  return MIME_TYPES[ext] ?? null;
}
