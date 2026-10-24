import test from 'node:test';
import assert from 'node:assert/strict';
import { checkPublicTree } from '../scripts/publication-guard.mjs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Fail closed: every public path must be reviewed and added intentionally.
// The private ECO repository and its historical Git objects must NEVER enter this tree.
// Includes known-secret detection; semantic content review remains mandatory.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('published files match the explicit public allowlist', () => {
  assert.deepEqual(checkPublicTree(root), [], [
    'PUBLIC_EXPORT_NOT_APPROVED: tracked file list changed.',
    'Do not publish a new module, archive, secret, dump, artifact, source map',
    'or any private ECO source until an explicit code/security review approves it.'
  ].join(' '));
});
