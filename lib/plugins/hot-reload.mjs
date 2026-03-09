import { watch } from 'node:fs';

const SSE_PATH = '/__hot-reload';

function buildInject() {
  return `<script>
  new EventSource('${SSE_PATH}').onmessage = () => location.reload();
</script>`;
}

export const hotReloadPlugin = {
  setup({ root }) {
    this._inject = buildInject();
    this._clients = new Set();

    let timer;
    const watcher = watch(root, { recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        for (const res of this._clients) res.write('data: reload\n\n');
        console.log('reloaded');
      }, 50);
    });
    watcher.unref();
    this._watcher = watcher;
  },

  handleRequest(req, res) {
    if (req.url !== SSE_PATH) return false;
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.flushHeaders();
    this._clients.add(res);
    req.on('close', () => this._clients.delete(res));
    return true;
  },

  transformResponse(body, { mime }) {
    if (mime !== 'text/html') return body;
    const html = body.toString();
    const injected = html.includes('</body>')
      ? html.replace('</body>', `${this._inject}</body>`)
      : html + this._inject;
    return injected;
  },
};
