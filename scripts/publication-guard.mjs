import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

// One owner for the public allowlist; adding a path still requires content review.
export const approvedPublicPaths = Object.freeze([
  '.github/workflows/public-smoke.yml', '.githooks/pre-push', 'AGENTS.md',
  'README.md', 'SECURITY.md', 'docs/GUIDE-CI-PUBLIQUE-PRIVEE.md',
  'docs/REPOSITORY-EFFICIENCY.md', 'docs/index.html', 'package.json',
  'scripts/publication-guard.mjs', 'site/index.html',
  'tests/public-scope.test.mjs', 'tests/publication-guard.test.mjs',
  'tests/smoke.test.mjs'
].sort());
const publicOrigin = /^(?:https:\/\/github\.com\/Serge-As\/utrae(?:\.git)?\/?|git@github\.com:Serge-As\/utrae(?:\.git)?)$/i;
const secretRules = [
  ['PRIVATE_KEY', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  ['GITHUB_TOKEN', /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/],
  ['AWS_ACCESS_KEY', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['JWT', /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/],
  ['SECRET_ASSIGNMENT', /\b(?:password|passwd|api[_-]?key|access[_-]?token|client[_-]?secret|session[_-]?cookie)\s*[:=]\s*["'][A-Za-z0-9+/_=.-]{12,}["']/i],
  ['SIGNED_URL', /[?&](?:X-Amz-Signature|X-Goog-Signature|sig)=[A-Za-z0-9%+/=_-]{16,}/i]
];
const decoder = new TextDecoder('utf-8', { fatal: true });
export function inspectPublicText(path, bytes, mode = '100644') {
  const failures = [];
  if (!approvedPublicPaths.includes(path)) failures.push('PATH_NOT_APPROVED');
  if (!['100644', '100755'].includes(mode)) failures.push('LINK_OR_SUBMODULE_FORBIDDEN');
  if (bytes.length > 256 * 1024) failures.push('FILE_TOO_LARGE');
  if (bytes.includes(0)) failures.push('BINARY_FORBIDDEN');
  let text;
  try { text = decoder.decode(bytes); } catch { failures.push('NOT_UTF8'); }
  if (text !== undefined) for (const [name, pattern] of secretRules) {
    if (pattern.test(text)) failures.push(name);
  }
  return failures.map(rule => ({ path, rule }));
}
function git(root, args, encoding = 'utf8', input) {
  return execFileSync('git', ['-C', root, ...args], {
    encoding, input, maxBuffer: 8 * 1024 * 1024, windowsHide: true,
    stdio: ['pipe', 'pipe', 'pipe']
  });
}
export function checkPublicTree(root, { ref } = {}) {
  const origin = git(root, ['config', '--get', 'remote.origin.url']).trim();
  if (!publicOrigin.test(origin)) return [{ path: '(repository)', rule: 'PUBLIC_ORIGIN_REQUIRED' }];
  if (ref && ref !== 'HEAD' && !/^[a-f0-9]{40}$/.test(ref)) throw new Error('INVALID_REF');
  const rows = git(root, ref ? ['ls-tree', '-r', '-z', ref] : ['ls-files', '--stage', '-z'])
    .split('\0').filter(Boolean);
  if (rows.length > 128) throw new Error('PUBLIC_TREE_LIMIT_EXCEEDED');
  const failures = [], actual = [], entries = [];
  for (const row of rows) {
    const tab = row.indexOf('\t'), [mode, second, third] = row.slice(0, tab).split(' ');
    const path = row.slice(tab + 1), sha = ref ? third : second;
    actual.push(path);
    if (!ref && third !== '0') { failures.push({ path, rule: 'UNMERGED_INDEX' }); continue; }
    if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error('INVALID_OBJECT');
    entries.push({ path, sha, mode });
  }
  // One local Git process reads all staged blobs, instead of one process per file.
  if (entries.length) {
    const batch = git(root, ['cat-file', '--batch'], null, entries.map(e => e.sha).join('\n') + '\n');
    let offset = 0;
    for (const entry of entries) {
      const end = batch.indexOf(10, offset);
      if (end < 0) throw new Error('INVALID_BATCH');
      const [sha, type, sizeText] = batch.subarray(offset, end).toString('ascii').split(' ');
      const size = Number(sizeText), start = end + 1;
      if (sha !== entry.sha || type !== 'blob' || !Number.isSafeInteger(size) || size < 0 || start + size >= batch.length || batch[start + size] !== 10) throw new Error('INVALID_BATCH');
      failures.push(...inspectPublicText(entry.path, batch.subarray(start, start + size), entry.mode));
      offset = start + size + 1;
    }
    if (offset !== batch.length) throw new Error('INVALID_BATCH');
  }
  for (const path of approvedPublicPaths) if (!actual.includes(path)) failures.push({ path, rule: 'APPROVED_FILE_MISSING' });
  return failures;
}
export function checkPush(root, input, remoteUrl) {
  if (!publicOrigin.test(remoteUrl)) return [{ path: '(repository)', rule: 'PUBLIC_PUSH_DESTINATION_REQUIRED' }];
  const commits = new Set();
  for (const row of input.trim().split(/\r?\n/).filter(Boolean)) {
    const [, local, , previous] = row.split(/\s+/);
    if (![local, previous].every(sha => /^[a-f0-9]{40}$/.test(sha ?? ''))) throw new Error('INVALID_PUSH_INPUT');
    if (/^0+$/.test(local)) continue;
    const args = /^0+$/.test(previous)
      ? ['rev-list', local, '--not', '--remotes=origin']
      : ['rev-list', `${previous}..${local}`];
    for (const sha of git(root, args).trim().split(/\r?\n/).filter(Boolean)) commits.add(sha);
    commits.add(local);
  }
  if (commits.size > 100) throw new Error('PUBLIC_HISTORY_LIMIT_EXCEEDED');
  return [...commits].flatMap(ref => checkPublicTree(root, { ref }).map(f => ({ ...f, commit: ref })));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
    const args = process.argv.slice(2);
    const failures = args[0] === '--pre-push'
      ? checkPush(root, readFileSync(0, 'utf8'), args[1] ?? '')
      : args.length === 0 ? checkPublicTree(root)
      : args.length === 2 && args[0] === '--ref' ? checkPublicTree(root, { ref: args[1] })
      : (() => { throw new Error('INVALID_ARGUMENTS'); })();
    if (failures.length) {
      process.stderr.write(JSON.stringify({ publicPublication: 'REFUSED', failures }, null, 2) + '\n');
      process.exitCode = 1;
    } else process.stdout.write('PUBLIC_PUBLICATION_GUARD_PASS\n');
  } catch {
    // Never print raw Git errors or matched secret contents.
    process.stderr.write('PUBLIC_PUBLICATION_GUARD_REFUSED: verification incomplete.\n');
    process.exitCode = 1;
  }
}
