#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

GREP_SKIP=(--exclude-dir=node_modules --exclude-dir=dist --exclude-dir=coverage --exclude-dir=.git --exclude-dir=public)

grep -RE "${GREP_SKIP[@]}" "rounded-(full|none|sm|md|lg|xl|xs)" apps/web/src || true

node <<'JS'
const fs = require("node:fs");
const path = require("node:path");

const skipDirs = new Set(["node_modules", "dist", "coverage", ".git", "public"]);
const textExts = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".html", ".json", ".sh"]);
const auditFile = "scripts/audit.sh";
const print = (value = "") => process.stdout.write(`${value}\n`);

function rel(file) {
  return file.split(path.sep).join("/");
}

function walk(root) {
  if (!fs.existsSync(root)) return [];
  const out = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      if (skipDirs.has(path.basename(current))) continue;
      for (const entry of fs.readdirSync(current)) stack.push(path.join(current, entry));
      continue;
    }
    const name = rel(current);
    if (name === auditFile) continue;
    if (textExts.has(path.extname(current))) out.push(current);
  }
  return out;
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function scan(title, roots, predicate) {
  print(`-- ${title} --`);
  const hits = [];
  for (const root of roots) {
    for (const file of walk(root)) {
      if (predicate(read(file), rel(file))) hits.push(rel(file));
    }
  }
  if (hits.length > 0) {
    print([...new Set(hits)].sort().join("\n"));
    process.exitCode = 1;
    return;
  }
  print("ok");
}

scan("emoji scan", ["apps/web/src"], (text) => /[\u{1F300}-\u{1FAFF}]/u.test(text));

const shortcutNeedles = [
  "as " + "any",
  "@ts-" + "ignore",
  "@ts-" + "nocheck",
  "eslint-" + "disable",
  "--no-" + "verify",
];
scan("shortcut scan", ["apps/web", "apps/api", "scripts"], (text) => shortcutNeedles.some((needle) => text.includes(needle)));

const debugNeedles = ["console." + "log", "debug" + "ger"];
scan("debug residue scan", ["apps/web/src", "apps/api/src", "scripts"], (text) => debugNeedles.some((needle) => text.includes(needle)));

scan("hex color leak", ["apps/web/src"], (text, file) => file !== "apps/web/src/styles/tokens.css" && /#(?:[0-9A-Fa-f]{3}){1,2}\b/.test(text));

print("-- forbidden deps --");
const pkg = JSON.parse(read("apps/web/package.json"));
const deps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies, ...pkg.optionalDependencies };
const forbiddenDeps = ["antd", "@mui", "@chakra-ui", "chakra-ui", "react-bootstrap", "element-plus", "echarts", "chart.js", "d3", "framer-motion", "shadcn-ui"];
const hit = Object.keys(deps).find((name) => forbiddenDeps.some((blocked) => name === blocked || name.startsWith(`${blocked}/`)));
if (hit) {
  print(hit);
  process.exitCode = 1;
} else {
  print("ok");
}
JS
