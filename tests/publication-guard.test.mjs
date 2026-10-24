import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { approvedPublicPaths, checkPublicTree, checkPush, inspectPublicText } from '../scripts/publication-guard.mjs';

const syntheticToken = ['gh', 'p_', 'A'.repeat(30)].join('');
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'utrae-public-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', ['-C', root, ...args], {
    encoding: 'utf8', windowsHide: true, stdio: ['pipe', 'pipe', 'pipe']
  }).trim();
  git('init', '-q');
  git('config', 'user.name', 'Synthetic Public Test');
  git('config', 'user.email', 'synthetic@example.invalid');
  git('config', 'core.autocrlf', 'false');
  git('remote', 'add', 'origin', 'https://github.com/Serge-As/utrae.git');
  for (const path of approvedPublicPaths) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), 'Synthetic public fixture only.\n');
  }
  git('add', '--', ...approvedPublicPaths);
  git('commit', '-qm', 'Synthetic public baseline');
  return { root, git, put: (path, text) => writeFileSync(join(root, path), text) };
}

test('a reviewed public staged tree and commit pass without network access', t => {
  const { root } = fixture(t);
  assert.deepEqual(checkPublicTree(root), []);
  assert.deepEqual(checkPublicTree(root, { ref: 'HEAD' }), []);
});

test('known secret formats are refused without returning their values', () => {
  const inputs = [
    syntheticToken,
    ['-----BEGIN', 'PRIVATE KEY-----'].join(' '),
    ['AK', 'IA', 'A'.repeat(16)].join(''),
    ['password', ' = "', 'fictitious'.repeat(3), '"'].join(''),
    ['https://example.invalid/?', 'X-Amz-Signature=', 'a'.repeat(32)].join('')
  ];
  for (const value of inputs) {
    const result = inspectPublicText('README.md', Buffer.from(value));
    assert.ok(result.length > 0);
    assert.ok(result.every(f => Object.keys(f).sort().join(',') === 'path,rule'));
    assert.ok(!JSON.stringify(result).includes(value));
  }
});

test('unreviewed paths, binary data, non-UTF8, links and oversized files are refused', () => {
  assert.ok(inspectPublicText('backup.zip', Buffer.from('synthetic')).some(f => f.rule === 'PATH_NOT_APPROVED'));
  assert.ok(inspectPublicText('README.md', Buffer.from([0])).some(f => f.rule === 'BINARY_FORBIDDEN'));
  assert.ok(inspectPublicText('README.md', Buffer.from([255])).some(f => f.rule === 'NOT_UTF8'));
  assert.ok(inspectPublicText('README.md', Buffer.from('target'), '120000').some(f => f.rule === 'LINK_OR_SUBMODULE_FORBIDDEN'));
  assert.ok(inspectPublicText('README.md', Buffer.alloc(256 * 1024 + 1, 65)).some(f => f.rule === 'FILE_TOO_LARGE'));
});

test('staged secret is still found when the working copy has already been cleaned', t => {
  const { root, git, put } = fixture(t);
  put('README.md', syntheticToken);
  git('add', '--', 'README.md');
  put('README.md', 'Clean working copy, not the staged content.\n');
  assert.ok(checkPublicTree(root).some(f => f.rule === 'GITHUB_TOKEN'));
});

test('an unapproved tracked file and an incomplete public tree fail closed', t => {
  const { root, git, put } = fixture(t);
  put('internal-notes.md', 'Synthetic internal file.\n');
  git('add', '--', 'internal-notes.md');
  assert.ok(checkPublicTree(root).some(f => f.rule === 'PATH_NOT_APPROVED'));
  git('rm', '--cached', '--', 'SECURITY.md');
  assert.ok(checkPublicTree(root).some(f => f.rule === 'APPROVED_FILE_MISSING'));
});

test('private or unrelated origin and push destinations are refused', t => {
  const { root, git } = fixture(t);
  git('remote', 'set-url', 'origin', 'https://github.com/Serge-As/urae.git');
  assert.equal(checkPublicTree(root)[0].rule, 'PUBLIC_ORIGIN_REQUIRED');
  assert.equal(checkPush(root, '', 'https://example.invalid/utrae.git')[0].rule, 'PUBLIC_PUSH_DESTINATION_REQUIRED');
});

test('pre-push refuses a secret in an intermediate commit even after its removal', t => {
  const { root, git, put } = fixture(t);
  const baseline = git('rev-parse', 'HEAD');
  put('README.md', syntheticToken);
  git('add', '--', 'README.md');
  git('commit', '-qm', 'Synthetic exposure fixture');
  put('README.md', 'Public final content.\n');
  git('add', '--', 'README.md');
  git('commit', '-qm', 'Synthetic final clean fixture');
  const head = git('rev-parse', 'HEAD');
  assert.deepEqual(checkPublicTree(root, { ref: 'HEAD' }), []);
  const failures = checkPush(root, `refs/heads/main ${head} refs/heads/main ${baseline}\n`, 'https://github.com/Serge-As/utrae.git');
  assert.ok(failures.some(f => f.rule === 'GITHUB_TOKEN' && f.commit !== head));
  assert.ok(!JSON.stringify(failures).includes(syntheticToken));
});

test('new branches inspect their new commits and malformed push inputs fail closed', t => {
  const { root, git } = fixture(t);
  const head = git('rev-parse', 'HEAD');
  const zero = '0'.repeat(40);
  assert.deepEqual(checkPush(root, `refs/heads/work ${head} refs/heads/work ${zero}\n`, 'https://github.com/Serge-As/utrae.git'), []);
  assert.throws(() => checkPush(root, 'invalid input', 'https://github.com/Serge-As/utrae.git'), /INVALID_PUSH_INPUT/);
  assert.throws(() => checkPublicTree(root, { ref: '--all' }), /INVALID_REF/);
});
