import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Fail closed: every public path must be reviewed and added intentionally.
// The private ECO repository and its historical Git objects must NEVER enter this tree.
// This check is a guardrail, not a secret scanner or permission boundary.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const approved = [
  '.github/workflows/public-smoke.yml',
  'README.md',
  'SECURITY.md',
  'docs/GUIDE-CI-PUBLIQUE-PRIVEE.md',
  'docs/index.html',
  'package.json',
  'site/index.html',
  'tests/public-scope.test.mjs',
  'tests/smoke.test.mjs'
].sort();

test('published files match the explicit public allowlist', () => {
  const actual = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
    .split('\0').filter(Boolean).sort();
  assert.deepEqual(actual, approved, [
    'PUBLIC_EXPORT_NOT_APPROVED: tracked file list changed.',
    'Do not publish a new module, archive, secret, dump, artifact, source map',
    'or any private ECO source until an explicit code/security review approves it.'
  ].join(' '));
});
