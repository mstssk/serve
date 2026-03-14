// hot-reload の接続状態を表示するデモ
const statusEl = document.getElementById("status");

function checkHotReload() {
  const injected = document.querySelector("script:not([src])");
  if (injected && injected.textContent.includes("EventSource")) {
    statusEl.textContent = "Hot-reload: enabled — edit any file to reload";
    statusEl.classList.add("connected");
  } else {
    statusEl.textContent = "Hot-reload: disabled — restart with -H flag to enable";
  }
}

document.addEventListener("DOMContentLoaded", checkHotReload);
