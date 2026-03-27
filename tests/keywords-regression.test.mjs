import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

async function importTsModule(filePath) {
  const abs = path.join(ROOT, filePath);
  let source = await fs.readFile(abs, 'utf8');

  source = source.replace(/from '\.\/.+\/api\/types'/g, "from 'data:text/javascript,export {}'");
  source = source.replace(/from '\.\.\/api\/types'/g, "from 'data:text/javascript,export {}'");
  source = source.replace(/from '\.\.\/utils\/keywords'/g, `from '${await toDataModule('src/utils/keywords.ts')}'`);

  const transpiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2020, target: ts.ScriptTarget.ES2020 },
    fileName: abs,
  }).outputText;

  const dataUrl = `data:text/javascript;base64,${Buffer.from(transpiled).toString('base64')}`;
  return import(dataUrl);
}

async function toDataModule(filePath) {
  const abs = path.join(ROOT, filePath);
  const source = await fs.readFile(abs, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2020, target: ts.ScriptTarget.ES2020 },
    fileName: abs,
  }).outputText;
  return `data:text/javascript;base64,${Buffer.from(transpiled).toString('base64')}`;
}

test('keyword normalization is deterministic and constrained to 1-2 words', async () => {
  const { normalizeKeywords } = await importTsModule('src/utils/keywords.ts');
  const result = normalizeKeywords([
    ' Project Alpha ',
    'project alpha',
    'three word phrase',
    'Brainstorm!',
    'foo/bar',
  ]);

  assert.deepEqual(result, ['brainstorm', 'foo-bar', 'project-alpha']);
});

test('update detection flags keyword changes even when timestamps do not', async () => {
  const { shouldMarkAsUpdated } = await importTsModule('src/sync/status.ts');

  const note = {
    id: 'sn-1',
    name: 'Demo',
    path: '/Note/Demo.note',
    size: 1,
    createdAt: '2026-03-01T00:00:00.000Z',
    modifiedAt: '2026-03-02T00:00:00.000Z',
    extension: 'note',
    keywords: ['Project Alpha'],
  };

  const localFile = {
    path: 'Supernote/Demo.md',
    id: 'sn-1',
    sourcePath: '/Note/Demo.note',
    mtime: new Date('2026-03-03T00:00:00.000Z').getTime(),
    keywords: ['different-keyword'],
  };

  assert.equal(shouldMarkAsUpdated(note, localFile), true);
});
