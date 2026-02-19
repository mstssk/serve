# example

A minimal example to verify `@mstssk/serve` is working.

## Usage

```bash
# static only
node ../bin/serve.mjs . -p 3000

# with hot-reload
node ../bin/serve.mjs . -p 3000 -H
```

Open http://localhost:3000 in your browser.

## What to try

- Edit `style.css` or `index.html` with `-H` flag to see hot-reload in action.
- Access `http://localhost:3000/not-found` to verify 404 handling.
