#!/usr/bin/env node
// Generate a Markdown PR comment summarizing failing RLS assertions
// and the slowest per-assertion timings. Writes the body to a file
// and exposes its path via $GITHUB_OUTPUT (body_path=...).
import { readFileSync, writeFileSync, existsSync, appendFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.env.RLS_LOG_DIR;
if (!dir) {
  console.error('RLS_LOG_DIR is not set');
  process.exit(0);
}

const failurePath = join(dir, 'failure-details.json');
const timingsPath = join(dir, 'assertion-timings.json');

const readJson = (p) => {
  try {
    return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
  } catch (err) {
    console.error(`Failed to parse ${p}:`, err.message);
    return null;
  }
};

const failure = readJson(failurePath);
const timings = readJson(timingsPath);

if (!failure && !timings) {
  console.log('No RLS artifacts found; skipping PR comment.');
  process.exit(0);
}

const runUrl =
  process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : null;

const lines = [];
lines.push('## ❌ RLS Tests Failed');
if (runUrl) lines.push(`[View workflow run](${runUrl})`);
lines.push('');

if (failure) {
  const { failed = 0, passed = 0, failureDetails = [], failures = [] } = failure;
  lines.push(`**Summary:** ${failed} failed / ${passed} passed`);
  lines.push('');

  const details = failureDetails.length ? failureDetails : failures;
  if (details.length) {
    lines.push('### Failing assertions');
    lines.push('');
    const shown = details.slice(0, 10);
    for (const f of shown) {
      const name = f.name ?? f.assertion ?? 'unnamed';
      lines.push(`<details><summary><code>${escapeMd(name)}</code></summary>`);
      lines.push('');
      const ctx = f.context ?? f.ctx ?? f;
      const rows = [
        ['role', ctx.role],
        ['table', ctx.table ?? ctx.view],
        ['operation', ctx.operation],
        ['columns', Array.isArray(ctx.columns) ? ctx.columns.join(', ') : ctx.columns],
        ['filter', ctx.filter ? JSON.stringify(ctx.filter) : undefined],
        ['expected', ctx.expected],
        ['error.code', ctx.error?.code],
        ['error.message', ctx.error?.message ?? f.detail],
        ['error.hint', ctx.error?.hint],
        ['error.details', ctx.error?.details],
      ].filter(([, v]) => v !== undefined && v !== null && v !== '');
      if (rows.length) {
        lines.push('| field | value |');
        lines.push('| --- | --- |');
        for (const [k, v] of rows) lines.push(`| ${k} | ${escapeCell(String(v))} |`);
      } else {
        lines.push('_No structured context captured._');
      }
      lines.push('');
      lines.push('</details>');
    }
    if (details.length > shown.length) {
      lines.push('');
      lines.push(`_…and ${details.length - shown.length} more (see artifacts)._`);
    }
    lines.push('');
  }
}

if (timings?.assertions?.length) {
  const slowest = [...timings.assertions]
    .sort((a, b) => (b.durationMs ?? 0) - (a.durationMs ?? 0))
    .slice(0, 10);
  lines.push('### Slowest assertions');
  lines.push('');
  lines.push('| # | assertion | duration | status |');
  lines.push('| --- | --- | --- | --- |');
  slowest.forEach((a, i) => {
    lines.push(
      `| ${i + 1} | ${escapeCell(a.name ?? 'unnamed')} | ${a.durationMs ?? 0} ms | ${a.status ?? (a.passed ? 'passed' : 'failed')} |`,
    );
  });
  if (typeof timings.totalDurationMs === 'number') {
    lines.push('');
    lines.push(`_Total: ${timings.totalDurationMs} ms across ${timings.assertions.length} assertions._`);
  }
  lines.push('');
}

// Artifact links. `actions/upload-artifact@v4` exposes an `artifact-url`
// pointing at the run's artifact page — the closest thing to a direct
// download link that GitHub offers for logged-in reviewers. Individual
// files inside the zip cannot be linked directly, so we list them under
// that URL to show what's inside.
const artifactUrl = process.env.RLS_ARTIFACT_URL;
const artifactName = process.env.RLS_ARTIFACT_NAME;
if (artifactUrl || existsSync(dir)) {
  lines.push('### Artifacts');
  lines.push('');
  if (artifactUrl) {
    lines.push(
      `📦 **[${artifactName ?? 'rls-artifacts'}](${artifactUrl})** — download the full \`rls-artifacts/\` bundle (sign-in required).`,
    );
    lines.push('');
  }
  try {
    const files = readdirSync(dir)
      .filter((f) => {
        try {
          return statSync(join(dir, f)).isFile();
        } catch {
          return false;
        }
      })
      .sort();
    if (files.length) {
      lines.push('Files included:');
      for (const f of files) {
        const size = (() => {
          try {
            return statSync(join(dir, f)).size;
          } catch {
            return null;
          }
        })();
        const sizeLabel = size != null ? ` _(${formatBytes(size)})_` : '';
        lines.push(
          artifactUrl
            ? `- [\`${f}\`](${artifactUrl})${sizeLabel}`
            : `- \`${f}\`${sizeLabel}`,
        );
      }
      lines.push('');
    }
  } catch (err) {
    console.error('Failed to list artifact files:', err.message);
  }
}

lines.push('### Reproduce locally');
lines.push('');
lines.push('The fastest way to rerun the suite locally is with the bundled env helper:');
lines.push('');
lines.push('```bash');
lines.push('cp scripts/rls.env.example .env');
lines.push('# edit .env with your real SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SERVICE_ROLE_KEY');
lines.push('bun run test:rls:local');
lines.push('```');
lines.push('');
lines.push('Or, if you prefer to manage the env file yourself:');
lines.push('');
lines.push('```bash');
lines.push('cp scripts/rls.env.example scripts/rls.env');
lines.push('# edit scripts/rls.env with your real credentials');
lines.push('source scripts/rls.env');
lines.push('mkdir -p "$RLS_LOG_DIR"');
lines.push('bun install --frozen-lockfile');
lines.push('bun run test:rls 2>&1 | tee "$RLS_LOG_DIR/rls-output.log"');
lines.push('```');
lines.push('');
lines.push('The example file is [`scripts/rls.env.example`](https://github.com/' + process.env.GITHUB_REPOSITORY + '/blob/' + (process.env.GITHUB_SHA ?? 'main') + '/scripts/rls.env.example).');
lines.push('');
lines.push('After the run, inspect `$RLS_LOG_DIR/failure-details.json` and `$RLS_LOG_DIR/assertion-timings.json` for the same context shown above.');
lines.push('');
lines.push('---');
lines.push('_Full logs are attached as workflow artifacts._');

const body = lines.join('\n');
const outPath = join(dir, 'pr-comment.md');
writeFileSync(outPath, body);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `body_path=${outPath}\n`);
}
console.log(`Wrote PR comment body to ${outPath}`);

function escapeMd(s) {
  return String(s).replace(/[<>]/g, (c) => (c === '<' ? '&lt;' : '&gt;'));
}
function escapeCell(s) {
  return escapeMd(s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
