// hot-reload の接続状態を表示するデモ
const status = document.getElementById('status');

function checkHotReload() {
  const injected = document.querySelector('script:not([src])');
  if (injected && injected.textContent.includes('WebSocket')) {
    status.textContent = 'Hot-reload: enabled — edit any file to reload';
    status.classList.add('connected');
  } else {
    status.textContent = 'Hot-reload: disabled — restart with -H flag to enable';
  }
}

checkHotReload();
