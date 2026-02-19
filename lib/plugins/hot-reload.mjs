import { watch } from 'node:fs';

async function loadWS() {
  try {
    const { WebSocketServer } = await import('ws');
    return WebSocketServer;
  } catch {
    console.error('Error: "ws" package is required for hot-reload.');
    console.error('Run: npm install ws');
    process.exit(1);
  }
}

function buildInject(port) {
  return `<script>
  const ws = new WebSocket(\`ws://\${location.hostname}:${port}\`);
  ws.onmessage = () => location.reload();
</script>`;
}

export const hotReloadPlugin = {
  async setup({ server, root, port }) {
    const WebSocketServer = await loadWS();
    const wss = new WebSocketServer({ server });
    this._inject = buildInject(port);

    let timer;
    watch(root, { recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        wss.clients.forEach(client => client.send('reload'));
        console.log('reloaded');
      }, 50);
    });
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
