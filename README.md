# @mstssk/serve

[![CI](https://github.com/mstssk/serve/actions/workflows/ci.yml/badge.svg)](https://github.com/mstssk/serve/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/@mstssk%2Fserve.svg)](https://badge.fury.io/js/@mstssk%2Fserve)

Minimal static file server for local development.

- Zero config
- No dependencies
- Plugin interface for extensibility

## Install

```bash
npm install -g @mstssk/serve
```

## Usage

```bash
serve ./dist                 # serve ./dist on :3000
serve ./dist -p 8080         # serve ./dist on :8080
serve ./dist -p 8080 -H      # with hot-reload
```

## Options

| Option             | Short | Description                                        | Default |
| ------------------ | ----- | -------------------------------------------------- | ------- |
| `--port`           | `-p`  | Port number                                        | `3000`  |
| `--hot-reload`     | `-H`  | Reload browser on file changes                     | off     |
| `--allow-dotfiles` |       | Serve dotfiles and node_modules (default: ignored) | off     |
| `--help`           | `-h`  | Show help message                                  |         |

## Plugin interface

`createAppServer` accepts a `plugins` array. Each plugin can implement:

| Method                                      | Description                                                          |
| ------------------------------------------- | -------------------------------------------------------------------- |
| `setup({ server, root, port })`             | Called once before the server starts listening. Can be async.        |
| `handleRequest(req, res)`                   | Handle a request. Return `true` if handled, `false` to fall through. |
| `transformResponse(body, { mime, target })` | Transform response body, return new body                             |

### Example plugin

```js
import { createAppServer } from "@mstssk/serve/lib/server.mjs";

const logPlugin = {
  setup({ root }) {
    console.log(`serving ${root}`);
  },
  transformResponse(body, { mime }) {
    if (mime !== "text/html") return body;
    return Buffer.from(body.toString() + "<!-- served by @mstssk/serve -->");
  },
};

createAppServer({ ROOT: "./dist", PORT: 3000, plugins: [logPlugin] });
```

## Security

- Path traversal is blocked via `resolve()` + root boundary check
- Symbolic links are blocked
- Binds to `127.0.0.1` by default (not exposed to LAN)

## License

MIT
