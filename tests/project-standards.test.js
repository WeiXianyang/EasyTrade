import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function readProjectFile(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('gitignore excludes generated artifacts and local-only files', () => {
  const gitignore = readProjectFile('.gitignore');

  const requiredRules = [
    /node_modules\//,
    /dist\//,
    /\.vite\//,
    /\.env/,
    /\*\.log/,
    /coverage\//,
    /\*\.zip/,
  ];

  for (const rule of requiredRules) {
    assert.match(gitignore, rule);
  }
});

test('submission packager includes project governance files', () => {
  const packScript = readProjectFile('tool/pack.cjs');

  const requiredFiles = [
    '.gitattributes',
    '.gitignore',
    'README.md',
    'package-lock.json',
  ];

  for (const file of requiredFiles) {
    assert.match(packScript, new RegExp(`'${file.replace('.', '\\.')}'`));
  }
});

test('gitattributes normalizes source files and protects binary artifacts', () => {
  const gitattributes = readProjectFile('.gitattributes');

  assert.match(gitattributes, /\* text=auto eol=lf/);
  assert.match(gitattributes, /\*\.zip binary/);
  assert.match(gitattributes, /\*\.pdf binary/);
});
