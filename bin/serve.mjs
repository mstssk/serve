#!/usr/bin/env node
import { parseArgs } from "node:util";
import { createAppServer } from "../lib/server.mjs";
import { hotReloadPlugin } from "../lib/plugins/hot-reload.mjs";

const HELP = `
Usage: serve <dir> [options]

Arguments:
  dir               Directory to serve

Options:
  -p, --port        Port number (default: 3000)
  -H, --hot-reload  Reload browser on file changes
  -h, --help        Show this help message
`.trim();

let values, positionals;
try {
  ({ values, positionals } = parseArgs({
    options: {
      port: { type: "string", short: "p", default: "3000" },
      "hot-reload": { type: "boolean", short: "H", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  }));
} catch (e) {
  console.error(`Error: ${e.message}\n`);
  console.error(HELP);
  process.exit(1);
}

if (values.help) {
  console.log(HELP);
  process.exit(0);
}

if (!positionals[0]) {
  console.error("Error: <dir> is required\n");
  console.error(HELP);
  process.exit(1);
}

const ROOT = positionals[0];
const PORT = Number(values.port);

if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
  console.error("Error: --port must be an integer between 1 and 65535\n");
  console.error(HELP);
  process.exit(1);
}

const plugins = values["hot-reload"] ? [hotReloadPlugin] : [];

createAppServer({ ROOT, PORT, plugins });
