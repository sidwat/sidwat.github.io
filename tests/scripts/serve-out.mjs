#!/usr/bin/env node
// Minimal static server for the Next.js export in out/, written to behave like
// GitHub Pages where it matters to the tests (04 §3, §10):
//   /x/        -> out/x/index.html
//   /x         -> 301 to /x/ when out/x/ is a directory (Pages does this)
//   /x.html    -> served as-is
//   unknown    -> out/404.html with status 404
// Content types for .xml are application/xml (Pages serves feed.xml that way).
// Results that depend on the server stay PROVISIONAL until the post-deploy smoke test.
//
// Usage: node tests/scripts/serve-out.mjs [dir=out] [port=4173]
// No dependencies, so it runs offline in CI and locally.

import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? process.env.QA_OUT_DIR ?? "out");
const port = Number(process.argv[3] ?? process.env.QA_PORT ?? 4173);

if (!existsSync(root)) {
  console.error(`serve-out: ${root} does not exist; run a build first`);
  process.exit(2);
}

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".yml": "text/yaml; charset=utf-8",
  ".yaml": "text/yaml; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

function send(res, status, file, method) {
  const type = TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream";
  res.writeHead(status, { "content-type": type, "content-length": statSync(file).size });
  if (method === "HEAD") return res.end();
  createReadStream(file).pipe(res);
}

function isFile(p) {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
}
function isDir(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  let rel;
  try {
    rel = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400).end();
    return;
  }
  const target = path.join(root, rel);
  if (target !== root && !target.startsWith(root + path.sep)) {
    res.writeHead(403).end();
    return;
  }

  if (rel.endsWith("/")) {
    const index = path.join(target, "index.html");
    if (isFile(index)) return send(res, 200, index, req.method);
  } else if (isFile(target)) {
    return send(res, 200, target, req.method);
  } else if (isDir(target) && isFile(path.join(target, "index.html"))) {
    res.writeHead(301, { location: `${url.pathname}/${url.search}` }).end();
    return;
  } else if (isFile(`${target}.html`)) {
    return send(res, 200, `${target}.html`, req.method);
  }

  const notFound = path.join(root, "404.html");
  if (isFile(notFound)) return send(res, 404, notFound, req.method);
  res.writeHead(404, { "content-type": "text/plain" }).end("404");
});

server.listen(port, "127.0.0.1", () => {
  console.log(`serve-out: ${root} on http://127.0.0.1:${port}`);
});
