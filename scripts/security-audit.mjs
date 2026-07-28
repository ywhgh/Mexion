import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

function argumentValue(name, fallback) {
  const inline = args.find((arg) => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

const mode = argumentValue("--mode", "full");
if (!["full", "pre-upgrade", "post-upgrade"].includes(mode)) {
  throw new Error(`Unsupported audit mode: ${mode}`);
}

const outputPath = resolve(repoRoot, argumentValue("--output", "logs/security-audit-latest.json"));
const securityBaselinePath = resolve(repoRoot, "security/security-baseline.json");
const upstreamBaselinePath = resolve(repoRoot, "overlays/sub2api/upstream-baseline.json");
const securityBaseline = JSON.parse(readFileSync(securityBaselinePath, "utf8"));
const upstreamBaseline = JSON.parse(readFileSync(upstreamBaselinePath, "utf8"));

const report = {
  schema_version: 1,
  mode,
  started_at: new Date().toISOString(),
  status: "running",
  checks: [],
};

function toPosix(path) {
  return path.split(sep).join("/");
}

function relativePath(path) {
  return toPosix(relative(repoRoot, path));
}

function sha256(input) {
  return createHash("sha256").update(input).digest("hex");
}

function fileSha256(path) {
  return sha256(readFileSync(path));
}

function lineNumberAt(text, index) {
  return text.slice(0, index).split("\n").length;
}

function safeDetail(path, message, line) {
  return {
    ...(path ? { path } : {}),
    ...(line ? { line } : {}),
    message,
  };
}

function runCheck(id, title, callback) {
  try {
    const result = callback() || {};
    report.checks.push({
      id,
      title,
      status: result.status || "pass",
      summary: result.summary || "ok",
      details: result.details || [],
    });
  } catch (error) {
    report.checks.push({
      id,
      title,
      status: "fail",
      summary: error instanceof Error ? error.message : "check failed",
      details: Array.isArray(error?.details) ? error.details : [],
    });
  }
}

function fail(message, details = []) {
  const error = new Error(message);
  error.details = details;
  throw error;
}

function assert(condition, message, details = []) {
  if (!condition) fail(message, details);
}

function runNative(file, nativeArgs, options = {}) {
  const result = spawnSync(file, nativeArgs, {
    cwd: options.cwd || repoRoot,
    encoding: options.encoding === null ? null : "utf8",
    timeout: options.timeout || 60_000,
    windowsHide: true,
    shell: options.shell || false,
    env: options.env || process.env,
  });
  if (result.error || result.status !== 0) {
    fail(`${options.label || file} failed with exit code ${result.status ?? "unknown"}`);
  }
  return result.stdout;
}

const excludedPrefixes = securityBaseline.secret_policy.excluded_directories.map((path) =>
  path.replaceAll("\\", "/").replace(/\/$/, ""),
);
const excludedNames = new Set(excludedPrefixes.filter((path) => !path.includes("/")));
const textExtensions = new Set([
  ".cjs",
  ".css",
  ".go",
  ".graphql",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".npmrc",
  ".patch",
  ".ps1",
  ".scss",
  ".sh",
  ".sql",
  ".svg",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".vue",
  ".yaml",
  ".yml",
]);
const textNames = new Set([".editorconfig", ".gitattributes", ".gitignore", ".npmrc"]);

function isExcluded(relativeName, baseName) {
  if (excludedNames.has(baseName)) return true;
  return excludedPrefixes.some(
    (prefix) => relativeName === prefix || relativeName.startsWith(`${prefix}/`),
  );
}

function collectTextFiles() {
  const files = [];
  const stack = [repoRoot];
  while (stack.length > 0) {
    const current = stack.pop();
    const stat = lstatSync(current);
    if (stat.isSymbolicLink()) continue;
    const name = relativePath(current);
    const baseName = current.slice(current.lastIndexOf(sep) + 1);
    if (current !== repoRoot && isExcluded(name, baseName)) continue;
    if (stat.isDirectory()) {
      for (const entry of readdirSync(current)) stack.push(resolve(current, entry));
      continue;
    }
    if (stat.size > 2 * 1024 * 1024) continue;
    if (!textExtensions.has(extname(current).toLowerCase()) && !textNames.has(baseName)) continue;
    const buffer = readFileSync(current);
    if (buffer.includes(0)) continue;
    files.push({ path: current, name, text: buffer.toString("utf8") });
  }
  return files.sort((a, b) => a.name.localeCompare(b.name));
}

const textFiles = collectTextFiles();

function isPlaceholder(value) {
  if (/^<[^>\r\n]+>$/.test(value.trim())) return true;
  const normalized = value.toLowerCase();
  return [
    "example",
    "placeholder",
    "replace-with",
    "test-only",
    "dummy",
    "not-a-real",
    "${",
    "{{",
    "<secret",
    "<token",
    "<password",
    "your-",
    "your_",
    "process.env",
    "$env:",
    "$(",
  ].some((marker) => normalized.includes(marker));
}

runCheck("SEC-SECRET-001", "Protected local secret values are not duplicated", () => {
  const settingsPath = resolve(repoRoot, securityBaseline.secret_policy.private_settings_path);
  if (!existsSync(settingsPath)) {
    return { status: "skip", summary: "private settings file is absent in this environment" };
  }

  const settings = JSON.parse(readFileSync(settingsPath, "utf8"));
  const protectedValues = Object.entries(settings)
    .filter(
      ([key, value]) =>
        typeof value === "string" &&
        value.length >= 8 &&
        /(password|secret|token|cookie|api[_-]?key|jwt)/i.test(key),
    )
    .map(([, value]) => value);

  const findings = [];
  for (const file of textFiles) {
    for (const value of protectedValues) {
      const index = file.text.indexOf(value);
      if (index >= 0) {
        findings.push(
          safeDetail(
            file.name,
            "matches a protected local secret value",
            lineNumberAt(file.text, index),
          ),
        );
      }
    }
  }
  assert(findings.length === 0, `${findings.length} protected secret duplicate(s) found`, findings);
  return { summary: `${protectedValues.length} protected values checked without disclosure` };
});

runCheck("SEC-SECRET-002", "Common credential formats and hardcoded secret defaults", () => {
  const formatRules = [
    ["private-key", /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g],
    ["aws-access-key", /\bAKIA[0-9A-Z]{16}\b/g],
    ["github-token", /\b(?:ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/g],
    ["api-token", /\bsk-[A-Za-z0-9_-]{24,}\b/g],
    ["jwt", /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g],
    ["url-userinfo", /https?:\/\/[^\s/:@]+:[^\s/@]+@[^\s/]+/g],
  ];
  const literalRule =
    /["'](?:admin_password|database_password|jwt_secret|client_secret|access_token|refresh_token|api_key|password|secret|token)["']\s*[:=]\s*["']([^"'\r\n]{8,})["']/gi;
  const findings = [];
  const fixtureAllowances = new Map(
    securityBaseline.secret_policy.credential_format_allowlist.map((fixture) => [
      `${fixture.path}\u0000${fixture.rule}`,
      fixture.count,
    ]),
  );

  function consumeFixture(path, rule) {
    const key = `${path}\u0000${rule}`;
    const remaining = fixtureAllowances.get(key) || 0;
    if (remaining <= 0) return false;
    fixtureAllowances.set(key, remaining - 1);
    return true;
  }

  for (const file of textFiles) {
    for (const [rule, pattern] of formatRules) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(file.text))) {
        if (consumeFixture(file.name, rule)) continue;
        findings.push(
          safeDetail(
            file.name,
            `matches ${rule} credential format`,
            lineNumberAt(file.text, match.index),
          ),
        );
      }
    }

    literalRule.lastIndex = 0;
    let literal;
    while ((literal = literalRule.exec(file.text))) {
      if (!isPlaceholder(literal[1])) {
        findings.push(
          safeDetail(
            file.name,
            "contains a hardcoded secret-like literal",
            lineNumberAt(file.text, literal.index),
          ),
        );
      }
    }
  }

  for (const [key, remaining] of fixtureAllowances) {
    if (remaining <= 0) continue;
    const [path, rule] = key.split("\u0000");
    findings.push(safeDetail(path, `expected ${rule} test/example fixture count changed`));
  }

  assert(findings.length === 0, `${findings.length} generic credential finding(s)`, findings);
  return { summary: `${textFiles.length} repository text files scanned` };
});

function sinkInventory(attribute) {
  const pattern = new RegExp(`${attribute}\\s*=\\s*"([^"]+)"`, "g");
  const inventory = new Map();
  for (const file of textFiles.filter(
    (item) => item.name.startsWith("apps/web/src/") && item.name.endsWith(".vue"),
  )) {
    let match;
    while ((match = pattern.exec(file.text))) {
      const key = `${file.name}\u0000${match[1]}`;
      inventory.set(key, (inventory.get(key) || 0) + 1);
    }
  }
  return inventory;
}

function expectedSinkInventory(entries) {
  return new Map(entries.map((entry) => [`${entry.path}\u0000${entry.expression}`, entry.count]));
}

function compareInventories(actual, expected, attribute) {
  const findings = [];
  for (const [key, count] of actual) {
    if (expected.get(key) !== count) {
      const [path, expression] = key.split("\u0000");
      findings.push(safeDetail(path, `unexpected ${attribute} sink or count: ${expression}`));
    }
  }
  for (const [key, count] of expected) {
    if (actual.get(key) !== count) {
      const [path, expression] = key.split("\u0000");
      findings.push(safeDetail(path, `missing/changed ${attribute} sink contract: ${expression}`));
    }
  }
  return findings;
}

runCheck("SEC-WEB-001", "HTML and srcdoc sink contract", () => {
  const findings = [
    ...compareInventories(
      sinkInventory("v-html"),
      expectedSinkInventory(securityBaseline.html_sinks),
      "v-html",
    ),
    ...compareInventories(
      sinkInventory(":srcdoc"),
      expectedSinkInventory(securityBaseline.srcdoc_sinks),
      "srcdoc",
    ),
  ];

  for (const entry of [...securityBaseline.html_sinks, ...securityBaseline.srcdoc_sinks]) {
    const text = readFileSync(resolve(repoRoot, entry.path), "utf8");
    for (const token of entry.requires) {
      if (!text.includes(token))
        findings.push(safeDetail(entry.path, `required sink guard is absent: ${token}`));
    }
  }

  assert(findings.length === 0, `${findings.length} HTML sink contract finding(s)`, findings);
  return {
    summary: `${securityBaseline.html_sinks.reduce((sum, item) => sum + item.count, 0)} v-html and ${securityBaseline.srcdoc_sinks.length} srcdoc sinks match baseline`,
  };
});

runCheck("SEC-WEB-002", "Direct active HTML execution sinks", () => {
  const findings = [];
  const sourceFiles = textFiles.filter((file) => file.name.startsWith("apps/web/src/"));
  const forbidden = [
    ["eval", /\beval\s*\(/g],
    ["new Function", /\bnew\s+Function\s*\(/g],
    ["document.write", /\bdocument\.write\s*\(/g],
    ["insertAdjacentHTML", /\.insertAdjacentHTML\s*\(/g],
  ];

  for (const file of sourceFiles) {
    const assignment = /\.innerHTML\s*=\s*([^\r\n;]+)/g;
    let match;
    while ((match = assignment.exec(file.text))) {
      if (!/^\s*(['"])\1\s*$/.test(match[1])) {
        findings.push(
          safeDetail(
            file.name,
            "non-empty innerHTML assignment",
            lineNumberAt(file.text, match.index),
          ),
        );
      }
    }
    for (const [name, pattern] of forbidden) {
      pattern.lastIndex = 0;
      while ((match = pattern.exec(file.text))) {
        findings.push(
          safeDetail(file.name, `forbidden ${name} sink`, lineNumberAt(file.text, match.index)),
        );
      }
    }
  }

  assert(findings.length === 0, `${findings.length} active HTML execution finding(s)`, findings);
  return { summary: "no non-empty innerHTML/eval/document.write sink found" };
});

runCheck("SEC-SOURCE-001", "Preview and runtime source contracts", () => {
  const findings = [];
  for (const contract of securityBaseline.source_contracts) {
    const fullPath = resolve(repoRoot, contract.path);
    if (!existsSync(fullPath)) {
      findings.push(safeDetail(contract.path, "contract file is missing"));
      continue;
    }
    const text = readFileSync(fullPath, "utf8");
    for (const token of contract.requires) {
      if (!text.includes(token))
        findings.push(safeDetail(contract.path, `required contract token is absent: ${token}`));
    }
  }
  assert(findings.length === 0, `${findings.length} source contract finding(s)`, findings);
  return { summary: `${securityBaseline.source_contracts.length} source contracts verified` };
});

runCheck("SEC-AUTH-001", "Browser authentication storage and audit-tool contract", () => {
  const findings = [];
  const secretKeys = "auth_token|refresh_token|auth_user|token_expires_at|pending_auth_session";
  const persistentSecretPattern = new RegExp(
    `(?:window\\.)?localStorage\\.(?:getItem|setItem)\\(\\s*["'](?:${secretKeys})["']`,
    "g",
  );
  const productionSources = textFiles.filter(
    (file) =>
      file.name.startsWith("apps/web/src/") &&
      !file.name.includes("/__tests__/") &&
      !/\.(?:spec|test)\.[cm]?[jt]sx?$/.test(file.name),
  );
  for (const file of productionSources) {
    persistentSecretPattern.lastIndex = 0;
    let match;
    while ((match = persistentSecretPattern.exec(file.text))) {
      findings.push(
        safeDetail(
          file.name,
          "authentication secret is read from or written to localStorage",
          lineNumberAt(file.text, match.index),
        ),
      );
    }
  }

  const auditLoginScripts = textFiles.filter(
    (file) =>
      /^scripts\/cdp-[^/]+\.mjs$/.test(file.name) &&
      file.text.includes("/api/v1/auth/login"),
  );
  assert(auditLoginScripts.length >= 8, "expected CDP login scripts are missing");
  for (const file of auditLoginScripts) {
    for (const token of [
      "X-User-UI-Request",
      "sessionStorage.setItem('auth_token'",
      "sessionStorage.setItem('auth_user'",
      "sessionStorage.setItem('token_expires_at'",
    ]) {
      if (!file.text.includes(token)) {
        findings.push(safeDetail(file.name, `CDP UI login contract is absent: ${token}`));
      }
    }
    if (/refresh_token/.test(file.text)) {
      findings.push(safeDetail(file.name, "CDP script still handles a browser refresh token"));
    }
    persistentSecretPattern.lastIndex = 0;
    let match;
    while ((match = persistentSecretPattern.exec(file.text))) {
      findings.push(
        safeDetail(
          file.name,
          "CDP script persists authentication data in localStorage",
          lineNumberAt(file.text, match.index),
        ),
      );
    }
  }

  const previewVerifier = textFiles.find(
    (file) => file.name === "scripts/verify-mexion-vue-preview.mjs",
  );
  if (!previewVerifier || !previewVerifier.text.includes("sessionStorage.getItem('auth_token')")) {
    findings.push(
      safeDetail(
        "scripts/verify-mexion-vue-preview.mjs",
        "preview verifier does not inspect tab-scoped auth",
      ),
    );
  }

  assert(findings.length === 0, `${findings.length} browser auth storage finding(s)`, findings);
  return {
    summary: `${productionSources.length} production source file(s) and ${auditLoginScripts.length} CDP login script(s) checked`,
  };
});

runCheck("SEC-DEPS-001", "Dependency policy and frozen lockfile", () => {
  const packageJson = JSON.parse(readFileSync(resolve(repoRoot, "package.json"), "utf8"));
  const expected = securityBaseline.dependency_policy;
  assert(
    JSON.stringify(packageJson.pnpm?.overrides || {}) === JSON.stringify(expected.overrides),
    "package.json pnpm.overrides does not match security baseline",
  );
  const actualBuilt = [...(packageJson.pnpm?.onlyBuiltDependencies || [])].sort();
  const expectedBuilt = [...expected.only_built_dependencies].sort();
  assert(
    JSON.stringify(actualBuilt) === JSON.stringify(expectedBuilt),
    "pnpm.onlyBuiltDependencies does not match security baseline",
  );
  const webPackageJson = JSON.parse(
    readFileSync(resolve(repoRoot, "apps/web/package.json"), "utf8"),
  );
  const directPackages = {
    ...(webPackageJson.dependencies || {}),
    ...(webPackageJson.devDependencies || {}),
  };
  for (const name of expected.forbidden_direct_packages || []) {
    assert(!(name in directPackages), `forbidden direct dependency remains: ${name}`);
  }
  for (const [name, version] of Object.entries(expected.required_direct_packages || {})) {
    assert(directPackages[name] === version, `required direct dependency version changed: ${name}`);
  }

  const pnpmExecPath = process.env.npm_execpath;
  const corepackPnpmPath = resolve(
    dirname(process.execPath),
    "node_modules/corepack/dist/pnpm.js",
  );
  const pnpmCommand =
    pnpmExecPath && existsSync(pnpmExecPath)
      ? { file: process.execPath, prefix: [pnpmExecPath], shell: false }
      : existsSync(corepackPnpmPath)
        ? { file: process.execPath, prefix: [corepackPnpmPath], shell: false }
        : { file: "pnpm", prefix: [], shell: false };
  runNative(
    pnpmCommand.file,
    [...pnpmCommand.prefix, "install", "--lockfile-only", "--frozen-lockfile", "--offline"],
    {
      label: "frozen lockfile parity check",
      timeout: 120_000,
      shell: pnpmCommand.shell,
    },
  );
  const ignored = String(
    runNative(pnpmCommand.file, [...pnpmCommand.prefix, "ignored-builds"], {
      label: "pnpm ignored-builds",
      shell: pnpmCommand.shell,
    }),
  );
  if (!/\bNone\b/.test(ignored)) {
    const modulesStatePath = resolve(repoRoot, "node_modules/.modules.yaml");
    assert(existsSync(modulesStatePath), "pnpm build state is unavailable");
    const modulesState = JSON.parse(readFileSync(modulesStatePath, "utf8"));
    assert(
      Array.isArray(modulesState.pendingBuilds) && modulesState.pendingBuilds.length === 0,
      "pnpm reports an unexpected pending/ignored build script",
    );
  }
  return { summary: "manifest, lockfile, overrides, and install-script allowlist agree" };
});

runCheck("SEC-DOC-001", "Security documents and patch hashes", () => {
  const findings = [];
  for (const document of upstreamBaseline.documents) {
    const fullPath = resolve(repoRoot, document.path);
    if (!existsSync(fullPath)) {
      findings.push(safeDetail(document.path, "required document is missing"));
      continue;
    }
    const text = readFileSync(fullPath, "utf8");
    if (!text.includes(document.marker))
      findings.push(safeDetail(document.path, "machine marker is missing"));
    if (fileSha256(fullPath) !== document.sha256)
      findings.push(safeDetail(document.path, "SHA-256 does not match upstream baseline"));
  }
  for (const patch of upstreamBaseline.patches) {
    const fullPath = resolve(repoRoot, patch.path);
    if (!existsSync(fullPath)) {
      findings.push(safeDetail(patch.path, "required overlay patch is missing"));
      continue;
    }
    if (fileSha256(fullPath) !== patch.sha256)
      findings.push(safeDetail(patch.path, "SHA-256 does not match upstream baseline"));
  }
  const agents = readFileSync(resolve(repoRoot, "AGENTS.md"), "utf8");
  for (const required of [
    "docs/SECURITY_OPTIMIZATION_PLAN.md",
    "docs/UPSTREAM_UPGRADE_SECURITY_OVERLAY.md",
    "security:audit -- --mode pre-upgrade",
    "security:audit -- --mode post-upgrade",
  ]) {
    if (!agents.includes(required))
      findings.push(safeDetail("AGENTS.md", `upgrade rule is absent: ${required}`));
  }
  assert(findings.length === 0, `${findings.length} document/patch integrity finding(s)`, findings);
  return {
    summary: `${upstreamBaseline.documents.length} documents and ${upstreamBaseline.patches.length} patches hash-checked`,
  };
});

function migrationInventory(root, directory) {
  const migrationRoot = resolve(root, directory);
  const files = readdirSync(migrationRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => `${directory}/${entry.name}`)
    .sort();
  return {
    count: files.length,
    sha256: sha256(`${files.join("\n")}\n`),
  };
}

runCheck("SEC-UPSTREAM-001", "External Sub2API baseline and overlay", () => {
  const defaultRoot = "D:/midstation-relay-analysis/worktrees/A/sub2api";
  const sub2ApiRoot = resolve(process.env.SUB2API_ROOT || defaultRoot);
  if (!existsSync(resolve(sub2ApiRoot, ".git"))) {
    return {
      status: "skip",
      summary: "external Sub2API worktree is unavailable in this environment",
    };
  }

  const upstream = upstreamBaseline.upstream;
  const remote = String(
    runNative("git", ["-C", sub2ApiRoot, "remote", "get-url", "origin"], {
      label: "upstream remote",
    }),
  ).trim();
  const head = String(
    runNative("git", ["-C", sub2ApiRoot, "rev-parse", "HEAD"], { label: "upstream HEAD" }),
  ).trim();
  const branch = String(
    runNative("git", ["-C", sub2ApiRoot, "branch", "--show-current"], { label: "upstream branch" }),
  ).trim();
  assert(remote === upstream.repository, "external upstream remote does not match baseline");
  assert(head === upstream.commit, "external upstream HEAD does not match baseline");
  assert(branch === upstream.branch, "external upstream branch does not match baseline");

  const versionValue = readFileSync(resolve(sub2ApiRoot, upstream.version_file), "utf8").trim();
  assert(
    versionValue === upstream.observed_version_file_value,
    "upstream VERSION observation changed",
  );

  const expectedDirty = [
    ...new Set(upstreamBaseline.patches.flatMap((patch) => patch.dirty_paths)),
  ].sort();
  const actualDirty = String(
    runNative(
      "git",
      ["-C", sub2ApiRoot, "status", "--porcelain=v1", "--untracked-files=all"],
      { label: "upstream diff inventory" },
    ),
  )
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3).replace(/^.* -> /, ""))
    .sort();
  assert(
    JSON.stringify(actualDirty) === JSON.stringify(expectedDirty),
    "external upstream dirty paths do not match overlay manifest",
  );

  for (const patch of upstreamBaseline.patches) {
    const patchPath = resolve(repoRoot, patch.path);
    runNative("git", ["-C", sub2ApiRoot, "apply", "--reverse", "--check", patchPath], {
      label: `reverse check for ${patch.path}`,
    });
    if (!patch.creates_paths) {
      const diff = runNative(
        "git",
        ["-C", sub2ApiRoot, "diff", "--full-index", "--binary", "--", ...patch.dirty_paths],
        { label: `diff check for ${patch.path}`, encoding: null },
      );
      assert(sha256(diff) === patch.sha256, `external diff does not exactly match ${patch.path}`);
    }
  }

  const migration = migrationInventory(sub2ApiRoot, upstreamBaseline.migrations.directory);
  assert(
    migration.count === upstreamBaseline.migrations.file_count,
    "migration inventory file count changed",
  );
  assert(
    migration.sha256 === upstreamBaseline.migrations.inventory_sha256,
    "migration inventory hash changed",
  );
  const handlerRoot = resolve(sub2ApiRoot, "backend/internal/handler");
  const oauthTokenLeakFindings = [];
  for (const entry of readdirSync(handlerRoot, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".go") || entry.name.endsWith("_test.go")) continue;
    const path = resolve(handlerRoot, entry.name);
    const text = readFileSync(path, "utf8");
    const pattern = /(?:fragment|query)\.Set\(\s*["']refresh_token["']/g;
    let match;
    while ((match = pattern.exec(text))) {
      oauthTokenLeakFindings.push(
        safeDetail(
          `backend/internal/handler/${entry.name}`,
          "OAuth redirect writes a refresh token",
          lineNumberAt(text, match.index),
        ),
      );
    }
  }
  assert(
    oauthTokenLeakFindings.length === 0,
    `${oauthTokenLeakFindings.length} OAuth redirect refresh-token leak(s)`,
    oauthTokenLeakFindings,
  );
  return {
    summary: `commit, branch, ${actualDirty.length} dirty path(s), patches, and ${migration.count} migration files agree`,
  };
});

runCheck("SEC-RUNTIME-001", "Listening project ports are loopback-only", () => {
  if (process.platform !== "win32") {
    return { status: "skip", summary: "Windows listener probe is not applicable" };
  }
  const command = [
    "$ports=5432,6379,8080,5515;",
    "$rows=@();",
    "foreach($port in $ports){",
    "$listeners=@(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue);",
    "foreach($listener in $listeners){$rows += [pscustomobject]@{port=$port;address=$listener.LocalAddress}}",
    "};",
    "$rows | ConvertTo-Json -Compress",
  ].join(" ");
  const output = String(
    runNative("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command], {
      label: "loopback listener probe",
    }),
  ).trim();
  const rows = output ? JSON.parse(output) : [];
  const listeners = Array.isArray(rows) ? rows : [rows];
  const unsafe = listeners.filter((item) => !["127.0.0.1", "::1"].includes(item.address));
  assert(
    unsafe.length === 0,
    `${unsafe.length} non-loopback listener(s) found`,
    unsafe.map((item) =>
      safeDetail(undefined, `port ${item.port} listens on a non-loopback address`),
    ),
  );
  return { summary: `${listeners.length} active listener(s) checked` };
});

runCheck("SEC-RUNTIME-002", "Unique active administrator is user ID 1", () => {
  if (process.platform !== "win32") {
    return { status: "skip", summary: "Windows local database probe is not applicable" };
  }
  const settingsPath = resolve(repoRoot, securityBaseline.secret_policy.private_settings_path);
  assert(existsSync(settingsPath), "private runtime settings are required for the admin-ID probe");
  const settings = JSON.parse(readFileSync(settingsPath, "utf8"));
  const password = String(settings.database_password || "");
  assert(password.length > 0, "database password is missing from private runtime settings");
  const psql = resolve(repoRoot, ".runtime/postgres/pgsql/bin/psql.exe");
  assert(existsSync(psql), "local psql executable is missing");
  const query =
    "select coalesce(string_agg(id::text, ',' order by id), '') from users " +
    "where role='admin' and status='active' and deleted_at is null";
  const output = String(
    runNative(
      psql,
      [
        "-h",
        "127.0.0.1",
        "-p",
        "5432",
        "-U",
        "postgres",
        "-d",
        "sub2api",
        "-v",
        "ON_ERROR_STOP=1",
        "-tAc",
        query,
      ],
      {
        label: "active administrator ID probe",
        env: { ...process.env, PGPASSWORD: password },
      },
    ),
  ).trim();
  assert(output === "1", "active administrator ID invariant failed");
  return { summary: "the active administrator ID set is exactly [1]" };
});

report.finished_at = new Date().toISOString();
report.status = report.checks.some((check) => check.status === "fail") ? "fail" : "pass";
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

for (const check of report.checks) {
  const label = check.status.toUpperCase().padEnd(4);
  process.stdout.write(`${label} ${check.id} ${check.summary}\n`);
}
process.stdout.write(`RESULT ${report.status.toUpperCase()} ${relativePath(outputPath)}\n`);

if (report.status !== "pass") process.exitCode = 1;
